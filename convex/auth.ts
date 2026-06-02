import { query } from "./_generated/server";

function adminSubjects(): string[] {
  return (process.env.ADMIN_SUBJECTS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** True when the signed-in Clerk user is listed in Convex env ADMIN_SUBJECTS. */
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    return adminSubjects().includes(identity.subject);
  },
});
