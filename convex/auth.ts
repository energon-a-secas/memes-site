import { query } from "./_generated/server";
import { isAdminIdentity } from "./admin";

/** True when the signed-in Clerk user is listed in Convex env ADMIN_SUBJECTS. */
export const isAdmin = query({
  args: {},
  handler: async (ctx) => isAdminIdentity(await ctx.auth.getUserIdentity()),
});
