import type { UserIdentity } from "convex/server";
import { ConvexError } from "convex/values";

/** Admins are listed in the Convex env var ADMIN_SUBJECTS as Clerk subject ids. */
export function adminSubjects(): string[] {
  return (process.env.ADMIN_SUBJECTS || "")
    .split(",")
    .map((subject) => subject.trim())
    .filter(Boolean);
}

export function isAdminIdentity(identity: UserIdentity | null): boolean {
  return !!identity && adminSubjects().includes(identity.subject);
}

/** Resolve the caller, or throw the reason they cannot act. */
export async function requireAdmin(ctx: {
  auth: { getUserIdentity: () => Promise<UserIdentity | null> };
}): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Sign in to manage categories.");
  if (!isAdminIdentity(identity)) throw new ConvexError("Only an admin can manage categories.");
  return identity;
}

/**
 * Convex replaces a thrown Error with a bare "Server Error" in production, so a
 * refusal the person is meant to read has to be a ConvexError. This wraps the
 * validators in js/organization.js, which are plain modules shared with the
 * browser and know nothing about Convex.
 */
export function surfaced<T>(run: () => T): T {
  try {
    return run();
  } catch (error) {
    throw new ConvexError(error instanceof Error ? error.message : String(error));
  }
}
