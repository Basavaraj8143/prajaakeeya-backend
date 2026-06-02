import "reflect-metadata";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AspirantsService } from "./aspirants.service";

/**
 * Behaviour unit tests for AspirantsService. The service is constructed with
 * mock dependencies (no DB / no server); methods' internal aggregations are
 * stubbed where needed. Each block locks in a specific business rule.
 */

// Build a service with only the dependencies a given test cares about; the
// rest are inert stubs. Constructor arg order mirrors the real constructor.
function buildService(deps: Record<string, any> = {}): any {
  const noop: any = {};
  return new AspirantsService(
    deps.repo ?? noop,
    deps.meetingRepo ?? noop,
    deps.bookingRepo ?? noop,
    deps.visitRepo ?? noop,
    deps.visitResponseRepo ?? noop,
    deps.meetingResponseRepo ?? noop,
    deps.activityRatingRepo ?? noop,
    deps.usersService ?? noop,
    deps.wardsService ?? noop,
    deps.electionsService ?? noop,
    deps.notificationsService ?? noop,
    deps.votesService ?? noop,
  );
}

describe("AspirantsService — contact privacy (findOne)", () => {
  const OWNER_USER_ID = 56;
  const ASPIRANT_ID = 54;

  let service: any;
  let aspirant: any;

  beforeEach(() => {
    aspirant = {
      id: ASPIRANT_ID,
      userId: OWNER_USER_ID,
      name: "Acchu M",
      gender: "Male", // set so the gender-fallback lookup is skipped
      electionId: null, // skip election/constituency name resolution
      constituencyId: null,
      phone: "9876543210",
      whatsappNumber: "9876543210",
      allowPhone: false,
      allowWhatsapp: true,
      allowChat: true,
      meetings: [],
      user: { isBlocked: false },
      getDocumentStatus: () => ({}),
    };

    service = buildService({
      repo: { findOne: jest.fn(async () => aspirant) },
      visitRepo: { find: jest.fn(async () => []) },
    });

    jest
      .spyOn(service, "getActivityRatingsBulk")
      .mockResolvedValue({ meetingRatings: {}, visitRatings: {}, overallRatings: {} });
    jest.spyOn(service, "getMeetingResponseCounts").mockResolvedValue(new Map());
    jest.spyOn(service, "getVisitResponseCounts").mockResolvedValue(new Map());
  });

  it("hides phone from an anonymous viewer when allowPhone is false", async () => {
    const res = await service.findOne(ASPIRANT_ID);
    expect(res).toBeTruthy();
    expect("phone" in res).toBe(false);
    expect(res.phone).toBeUndefined();
    expect(res.whatsappNumber).toBe("9876543210"); // allowWhatsapp still true
    expect(res.allowPhone).toBe(false); // flag preserved
  });

  it("shows phone to the OWNER even when allowPhone is false", async () => {
    const res = await service.findOne(ASPIRANT_ID, {
      id: OWNER_USER_ID,
      role: "aspirant",
    });
    expect(res.phone).toBe("9876543210");
    expect(res.whatsappNumber).toBe("9876543210");
  });

  it("hides phone from a different logged-in user when allowPhone is false", async () => {
    const res = await service.findOne(ASPIRANT_ID, { id: 999, role: "voter" });
    expect(res.phone).toBeUndefined();
  });

  it("hides whatsappNumber from non-owners when allowWhatsapp is false", async () => {
    aspirant.allowWhatsapp = false;
    const res = await service.findOne(ASPIRANT_ID, { id: 999, role: "voter" });
    expect(res.whatsappNumber).toBeUndefined();

    const ownerRes = await service.findOne(ASPIRANT_ID, {
      id: OWNER_USER_ID,
      role: "aspirant",
    });
    expect(ownerRes.whatsappNumber).toBe("9876543210");
  });

  it("includes both phone and whatsapp for everyone when both flags are true", async () => {
    aspirant.allowPhone = true;
    aspirant.allowWhatsapp = true;
    const res = await service.findOne(ASPIRANT_ID);
    expect(res.phone).toBe("9876543210");
    expect(res.whatsappNumber).toBe("9876543210");
  });
});

describe("AspirantsService — register()", () => {
  it("rejects an unauthenticated caller", async () => {
    const service = buildService();
    await expect(service.register({}, undefined)).rejects.toThrow(
      BadRequestException,
    );
  });

  it("rejects a phone already used by another user", async () => {
    const service = buildService({
      usersService: { findByPhone: jest.fn(async () => ({ id: 999 })) },
    });
    await expect(
      service.register({ phone: "9876543210" }, { id: 1 }),
    ).rejects.toThrow("Phone already in use");
  });

  it("rejects a whatsapp number already used by another aspirant", async () => {
    const service = buildService({
      usersService: { findByPhone: jest.fn(async () => null) },
      repo: { findOne: jest.fn(async () => ({ userId: 999 })) },
    });
    await expect(
      service.register({ whatsappNumber: "9876543210" }, { id: 1 }),
    ).rejects.toThrow("WhatsApp number already in use");
  });

  it("rejects a user who already has an active aspirant profile", async () => {
    const service = buildService({
      usersService: { findByPhone: jest.fn(async () => null) },
    });
    jest.spyOn(service, "findByUserId").mockResolvedValue({ isActive: true });
    await expect(service.register({}, { id: 1 })).rejects.toThrow(
      "already has an active aspirant profile",
    );
  });

  it("creates the aspirant when all checks pass", async () => {
    const created = { id: 7, name: "New Aspirant" };
    const service = buildService({
      usersService: { findByPhone: jest.fn(async () => null) },
    });
    jest.spyOn(service, "findByUserId").mockResolvedValue(null);
    const createSpy = jest.spyOn(service, "create").mockResolvedValue(created);

    const dto = { name: "New Aspirant" };
    const user = { id: 1 };
    await expect(service.register(dto, user)).resolves.toBe(created);
    expect(createSpy).toHaveBeenCalledWith(dto, user);
  });
});

describe("AspirantsService — updatePermissions()", () => {
  it("rejects when the aspirant is not owned by the caller", async () => {
    const service = buildService({
      repo: { findOne: jest.fn(async () => null) },
    });
    await expect(
      service.updatePermissions(54, 999, { allowPhone: false }),
    ).rejects.toThrow(NotFoundException);
  });

  it("updates only the provided flags and returns them", async () => {
    const aspirant: any = { id: 54, userId: 56, allowPhone: true, allowWhatsapp: true, allowChat: true };
    const save = jest.fn(async (a: any) => a);
    const service = buildService({
      repo: { findOne: jest.fn(async () => aspirant), save },
    });

    const result = await service.updatePermissions(54, 56, { allowPhone: false });

    expect(aspirant.allowPhone).toBe(false);
    expect(aspirant.allowWhatsapp).toBe(true); // untouched
    expect(save).toHaveBeenCalledWith(aspirant);
    expect(result).toEqual({ allowPhone: false, allowWhatsapp: true, allowChat: true });
  });
});

describe("AspirantsService — withdrawAspirant()", () => {
  it("rejects when the user has no aspirant profile", async () => {
    const service = buildService({
      repo: { findOne: jest.fn(async () => null) },
    });
    await expect(service.withdrawAspirant(1)).rejects.toThrow(NotFoundException);
  });

  it("blocks withdrawal while voting is open for the same election", async () => {
    const service = buildService({
      repo: { findOne: jest.fn(async () => ({ id: 5, electionId: 10 })) },
      votesService: {
        isVotingAllowed: jest.fn(async () => true),
        getActiveVotingWindow: jest.fn(async () => ({ electionId: 10 })),
      },
    });
    await expect(service.withdrawAspirant(1)).rejects.toThrow(
      "Cannot withdraw candidacy while voting is open",
    );
  });

  it("withdraws and reverts the user to voter when voting is not open", async () => {
    const update = jest.fn(async () => ({}));
    const setRole = jest.fn(async () => ({}));
    const clearPhone = jest.fn(async () => ({}));
    const service = buildService({
      repo: { findOne: jest.fn(async () => ({ id: 5, electionId: 10 })), update },
      votesService: {
        isVotingAllowed: jest.fn(async () => false),
        getActiveVotingWindow: jest.fn(async () => null),
      },
      usersService: { setRole, clearPhone },
    });

    const result = await service.withdrawAspirant(1);

    expect(update).toHaveBeenCalledWith(5, expect.objectContaining({ isActive: false }));
    expect(setRole).toHaveBeenCalledWith(1, "voter");
    expect(clearPhone).toHaveBeenCalledWith(1);
    expect(result).toEqual(
      expect.objectContaining({ message: expect.stringContaining("withdrawn") }),
    );
  });
});
