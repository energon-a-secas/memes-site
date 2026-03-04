import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Get net vote scores for all memes, plus this visitor's votes. */
export const getVotes = query({
  args: { visitorId: v.string() },
  handler: async (ctx, args) => {
    const allVotes = await ctx.db.query("votes").collect();

    // Net score per meme (upvotes - downvotes)
    const counts: Record<string, number> = {};
    for (const vote of allVotes) {
      counts[vote.memeKey] = (counts[vote.memeKey] || 0) + (vote.direction ?? 1);
    }

    // This visitor's votes
    const myVotes = await ctx.db
      .query("votes")
      .withIndex("by_visitor_meme", (q) => q.eq("visitorId", args.visitorId))
      .collect();

    const upvoted: string[] = [];
    const downvoted: string[] = [];
    for (const v of myVotes) {
      if ((v.direction ?? 1) > 0) upvoted.push(v.memeKey);
      else downvoted.push(v.memeKey);
    }

    return { counts, upvoted, downvoted };
  },
});

/** Toggle upvote: add if not voted, remove if already upvoted, switch if downvoted. */
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

    if (existing) {
      if ((existing.direction ?? 1) === dir) {
        // Same direction — remove (toggle off)
        await ctx.db.delete(existing._id);
        return { action: "removed", direction: dir };
      } else {
        // Opposite direction — switch
        await ctx.db.patch(existing._id, { direction: dir });
        return { action: "switched", direction: dir };
      }
    } else {
      await ctx.db.insert("votes", {
        memeKey: args.memeKey,
        visitorId: args.visitorId,
        direction: dir,
      });
      return { action: "added", direction: dir };
    }
  },
});
