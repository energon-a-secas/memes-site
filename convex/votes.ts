import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Net vote scores for all memes, plus this visitor's votes.
 *
 * `counts` is a list of [memeKey, score] pairs rather than an object. Meme keys
 * are meme names, which are user-supplied and routinely hold accents ("mañana-
 * cubre-turno", "…porque decía la verdad"). Convex object field names must be
 * non-control ASCII, so keying an object by them threw while serialising the
 * return value and took every visitor's votes down with it.
 */
export const getVotes = query({
  args: { visitorId: v.string() },
  handler: async (ctx, args) => {
    const allVotes = await ctx.db.query("votes").collect();

    const totals = new Map<string, number>();
    for (const vote of allVotes) {
      totals.set(vote.memeKey, (totals.get(vote.memeKey) || 0) + (vote.direction ?? 1));
    }

    const myVotes = await ctx.db
      .query("votes")
      .withIndex("by_visitor_meme", (q) => q.eq("visitorId", args.visitorId))
      .collect();

    const upvoted: string[] = [];
    const downvoted: string[] = [];
    for (const vote of myVotes) {
      if ((vote.direction ?? 1) > 0) upvoted.push(vote.memeKey);
      else downvoted.push(vote.memeKey);
    }

    return { counts: [...totals], upvoted, downvoted };
  },
});

/** Toggle a vote: add if new, remove if repeated, switch if the direction differs. */
export const toggleVote = mutation({
  args: { memeKey: v.string(), visitorId: v.string(), direction: v.number() },
  handler: async (ctx, args) => {
    const dir = args.direction > 0 ? 1 : -1;

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_visitor_meme", (q) =>
        q.eq("visitorId", args.visitorId).eq("memeKey", args.memeKey)
      )
      .first();

    if (!existing) {
      await ctx.db.insert("votes", { memeKey: args.memeKey, visitorId: args.visitorId, direction: dir });
      return { action: "added", direction: dir };
    }
    if ((existing.direction ?? 1) === dir) {
      await ctx.db.delete(existing._id);
      return { action: "removed", direction: dir };
    }
    await ctx.db.patch(existing._id, { direction: dir });
    return { action: "switched", direction: dir };
  },
});
