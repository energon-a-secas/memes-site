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
