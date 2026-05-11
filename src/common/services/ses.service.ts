import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { randomBytes, randomInt } from "crypto";

export interface SendOtpResponse {
  verificationId: string;
  message: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  message: string;
}

@Injectable()
export class SESService {
  private readonly logger = new Logger(SESService.name);
  private readonly sesClient: SESClient;
  private readonly fromEmail: string;
  private readonly otpStore = new Map<
    string,
    { otp: string; expiresAt: Date }
  >();

  constructor() {
    const accessKeyId =
      process.env.AWS_SES_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
    const secretAccessKey =
      process.env.AWS_SES_SECRET_ACCESS_KEY ||
      process.env.AWS_SECRET_ACCESS_KEY ||
      "";
    const region =
      process.env.AWS_SES_REGION || process.env.AWS_REGION || "ap-south-1";
    this.fromEmail = process.env.AWS_SES_FROM_EMAIL || "noreply@example.com";

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        "AWS SES credentials not configured. Email service will not work.",
      );
    }

    this.sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Generate a cryptographically random 6-digit OTP.
   * `Math.random` is non-cryptographic and should never be used for codes
   * that gate authentication.
   */
  private generateOtp(): string {
    return String(randomInt(100_000, 1_000_000));
  }

  /**
   * Generate a cryptographically random verification ID.
   */
  private generateVerificationId(): string {
    return randomBytes(16).toString("hex");
  }

  /**
   * Send OTP to an email address via AWS SES
   * @param email - Email address to send OTP to
   * @returns verificationId to be used for OTP validation
   */
  async sendOtp(email: string): Promise<SendOtpResponse> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestException("Invalid email format");
      }

      const otp = this.generateOtp();
      const verificationId = this.generateVerificationId();

      // Store OTP temporarily (expires in 10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      this.otpStore.set(verificationId, { otp, expiresAt });

      const params = {
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: "Your OTP Code",
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: `
                <html>
                  <body>
                    <h2>Your OTP Code</h2>
                    <p>Your OTP code is: <strong>${otp}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you did not request this code, please ignore this email.</p>
                  </body>
                </html>
              `,
              Charset: "UTF-8",
            },
            Text: {
              Data: `Your OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.`,
              Charset: "UTF-8",
            },
          },
        },
      };

      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);

      this.logger.log(`OTP sent successfully to ${email}`);

      return {
        verificationId,
        message: "OTP sent successfully to your email",
      };
    } catch (error: any) {
      this.logger.error(`Failed to send OTP to ${email}:`, error.message);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException("Failed to send OTP email");
    }
  }

  /**
   * Verify OTP against the stored value
   * @param email - Email address
   * @param verificationId - Verification ID from sendOtp
   * @param otp - OTP code to verify
   * @returns verification result
   */
  async verifyOtp(
    email: string,
    verificationId: string,
    otp: string,
  ): Promise<VerifyOtpResponse> {
    try {
      const stored = this.otpStore.get(verificationId);

      if (!stored) {
        this.logger.warn(`Verification ID not found: ${verificationId}`);
        return { verified: false, message: "Invalid or expired OTP" };
      }

      if (stored.expiresAt < new Date()) {
        this.otpStore.delete(verificationId);
        this.logger.warn(`OTP expired for: ${email}`);
        return { verified: false, message: "OTP has expired" };
      }

      if (stored.otp !== otp) {
        this.logger.warn(`OTP mismatch for: ${email}`);
        return { verified: false, message: "Invalid OTP" };
      }

      // OTP verified, remove from store
      this.otpStore.delete(verificationId);
      this.logger.log(`OTP verified successfully for: ${email}`);

      return { verified: true, message: "OTP verified successfully" };
    } catch (error: any) {
      this.logger.error(`Failed to verify OTP for ${email}:`, error.message);
      throw new InternalServerErrorException("Failed to verify OTP");
    }
  }

  /**
   * Clean up expired OTPs (called periodically)
   */
  cleanupExpiredOtps(): void {
    const now = new Date();
    for (const [verificationId, stored] of this.otpStore.entries()) {
      if (stored.expiresAt < now) {
        this.otpStore.delete(verificationId);
      }
    }
  }
}
