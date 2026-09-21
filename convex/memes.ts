import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { MEMES } from "../js/data.js";
import { validateOrganization } from "../js/organization.js";

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
    labels: v.optional(v.array(v.string())),
    ext: v.string(),
    storageId: v.id("_storage"),
    displayAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const organization = validateOrganization(args.category, args.labels || []);
    const uploadedBy =
      (identity.name && String(identity.name).trim()) ||
      (identity.email && identity.email.split("@")[0]) ||
      "Member";

    await ctx.db.insert("memes", {
      name: args.name,
      ...organization,
      ext: args.ext,
      storageId: args.storageId,
      uploadedBy,
      displayAnonymous: args.displayAnonymous,
      ownerSubject: identity.subject,
    });
  },
});

export const organization = query({
  args: {},
  handler: async (ctx) => ctx.db.query("memeOrganization").collect(),
});

/** Owners organize their uploads; admins can also organize bundled memes. */
export const organize = mutation({
  args: {
    memeId: v.optional(v.id("memes")),
    memeKey: v.string(),
    category: v.string(),
    labels: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to organize memes.");
    const isAdmin = (process.env.ADMIN_SUBJECTS || "").split(",").map(s => s.trim()).includes(identity.subject);
    const values = validateOrganization(args.category, args.labels);
    if (args.memeId) {
      const meme = await ctx.db.get(args.memeId);
      if (!meme) throw new Error("This meme is no longer available.");
      if (!isAdmin && meme.ownerSubject !== identity.subject) throw new Error("Only the uploader or an admin can organize this meme.");
      await ctx.db.patch(args.memeId, values);
    } else {
      if (!isAdmin) throw new Error("Only admins can organize the bundled collection.");
      if (!MEMES.some(meme => meme.name === args.memeKey)) throw new Error("Meme not found.");
      const existing = await ctx.db.query("memeOrganization").withIndex("by_meme", q => q.eq("memeKey", args.memeKey)).unique();
      if (existing) await ctx.db.patch(existing._id, values);
      else await ctx.db.insert("memeOrganization", { memeKey: args.memeKey, ...values });
    }
    return values;
  },
});
