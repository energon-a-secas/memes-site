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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const deleteMeme = mutation({
  args: { memeId: v.id("memes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { ok: false, error: "Not authenticated" };
    }
    const admins = (process.env.ADMIN_SUBJECTS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!admins.includes(identity.subject)) {
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
    displayAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const uploadedBy =
      (identity.name && String(identity.name).trim()) ||
      (identity.email && identity.email.split("@")[0]) ||
      "Member";

    await ctx.db.insert("memes", {
      name: args.name,
      category: args.category,
      ext: args.ext,
      storageId: args.storageId,
      uploadedBy,
      displayAnonymous: args.displayAnonymous,
      ownerSubject: identity.subject,
    });
  },
});
