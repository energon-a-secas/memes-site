import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const memes = await ctx.db.query("memes").order("desc").collect();
    const results = [];
    for (const meme of memes) {
      const url = await ctx.storage.getUrl(meme.storageId);
      if (url) {
        results.push({
          ...meme,
          url,
          // Public display: show "Anon" if anonymous, otherwise show username
          displayName: meme.displayAnonymous ? "Anon" : meme.uploadedBy,
        });
      }
    }
    return results;
  },
});

export const getUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/** Admin-only: delete a meme by its Convex _id. */
export const deleteMeme = mutation({
  args: { memeId: v.id("memes"), adminUsername: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.adminUsername.trim().toLowerCase()))
      .first();
    if (!admin || admin.role !== "admin") {
      return { ok: false, error: "Not authorized" };
    }
    const meme = await ctx.db.get(args.memeId);
    if (!meme) return { ok: false, error: "Meme not found" };
    await ctx.storage.delete(meme.storageId);
    await ctx.db.delete(args.memeId);
    return { ok: true };
  },
});

export const saveMeme = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    ext: v.string(),
    storageId: v.id("_storage"),
    uploadedBy: v.string(),
    displayAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("memes", {
      name: args.name,
      category: args.category,
      ext: args.ext,
      storageId: args.storageId,
      uploadedBy: args.uploadedBy,
      displayAnonymous: args.displayAnonymous,
    });
  },
});
