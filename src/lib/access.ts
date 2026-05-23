import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { auditLogs, userProfiles, type UserProfile, type UserRole } from "@/db/schema";

export type ReviewSession = {
  userId: string;
  profile: UserProfile;
};

export async function requireUserProfile(): Promise<ReviewSession> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = getDb();
  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.authUserId, userId),
  });

  if (existing) {
    if (existing.status !== "active") {
      throw new Error("This reviewer account is inactive.");
    }
    return { userId, profile: existing };
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";
  const name = clerkUser?.fullName || email || "Reviewer";
  const initialAdmins = (process.env.INITIAL_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const role: UserRole = email && initialAdmins.includes(email) ? "admin" : "viewer";

  const [created] = await db
    .insert(userProfiles)
    .values({
      authUserId: userId,
      email,
      name,
      role,
      warehouseIds: [],
      customerIds: [],
    })
    .returning();

  await db.insert(auditLogs).values({
    actorUserId: created.id,
    action: "login",
    entityType: "user_profile",
    entityId: created.id,
    detail: `Created ${role} profile for ${email || userId}`,
  });

  return { userId, profile: created };
}

export function canWrite(profile: UserProfile) {
  return profile.role === "admin" || profile.role === "operator";
}

export function canAdmin(profile: UserProfile) {
  return profile.role === "admin";
}

export function canViewInternal(profile: UserProfile) {
  return profile.role === "admin" || profile.role === "operator" || profile.role === "viewer";
}

export function requireWrite(profile: UserProfile) {
  if (!canWrite(profile)) throw new Error("Write access is not allowed for this reviewer role.");
}

export function requireAdmin(profile: UserProfile) {
  if (!canAdmin(profile)) throw new Error("Admin access is required.");
}

export function customerScope(profile: UserProfile) {
  return profile.role === "customer" ? profile.customerIds : [];
}

export function stripInternalLoadFields<T extends Record<string, unknown>>(load: T) {
  const {
    carrierCostCents: _carrierCostCents,
    internalNotes: _internalNotes,
    carrierRateId: _carrierRateId,
    clientRateId: _clientRateId,
    ...safe
  } = load;
  return safe;
}
