import { Injectable } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConfigService } from "@nestjs/config";

// Filenames are timestamp-prefixed so the same key never changes content —
// safe for a one-year immutable browser/CDN cache.
const IMMUTABLE_CACHE_HEADER = "public, max-age=31536000, immutable";

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private cdnDomain?: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get("AWS_REGION") || "ap-south-1",
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID") || "",
        secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY") || "",
      },
    });
    this.bucketName =
      this.configService.get("AWS_S3_BUCKET_NAME") || "prajaakeeya";
    this.cdnDomain = this.configService.get<string>("AWS_CLOUDFRONT_DOMAIN");
  }

  private buildPublicUrl(key: string): string {
    if (this.cdnDomain) return `https://${this.cdnDomain}/${key}`;
    const region = this.configService.get("AWS_REGION");
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  /**
   * Upload a file to S3
   * @param file - Express.Multer.File object
   * @param folder - Optional folder path in S3
   * @returns S3 object URL
   */
  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname.replace(/\s+/g, "-")}`;
    const key = folder ? `${folder}/${fileName}` : fileName;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: IMMUTABLE_CACHE_HEADER,
      },
    });

    await upload.done();

    return this.buildPublicUrl(key);
  }

  /**
   * Delete a file from S3
   * @param fileUrl - Full S3 URL
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const key = this.extractKeyFromUrl(fileUrl);
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error("Error deleting file from S3:", error);
    }
  }

  /**
   * Extract the S3 object key from a stored URL.
   *
   * Handles BOTH S3 virtual-hosted URLs
   * (`https://<bucket>.s3.<region>.amazonaws.com/<key>`) and CloudFront / CDN
   * URLs (`https://<cdnDomain>/<key>`) — the key is simply the URL path. The
   * old implementation split on ".amazonaws.com/" and returned "" for CDN
   * URLs, which made DeleteObject fail with 403 AccessDenied (empty key).
   */
  private extractKeyFromUrl(url: string): string {
    if (!url) return "";
    try {
      const { pathname } = new URL(url);
      return decodeURIComponent(pathname.replace(/^\/+/, ""));
    } catch {
      // Not an absolute URL — assume it's already a key, with a legacy
      // ".amazonaws.com/" fallback just in case.
      const parts = url.split(".amazonaws.com/");
      return parts.length > 1 ? parts[1] : url.replace(/^\/+/, "");
    }
  }

  /**
   * Generate a presigned GET URL for a key
   */
  async getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    // CDN serves cached bytes for ~zero egress cost — prefer it whenever set.
    if (this.cdnDomain) return this.buildPublicUrl(key);

    const isPublic = this.configService.get("AWS_PUBLIC_BUCKET");
    if (
      isPublic === true ||
      String(isPublic).toLowerCase() === "true" ||
      String(isPublic) === "1"
    ) {
      return this.buildPublicUrl(key);
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }
}
