import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /** Legacy Neorgon logins (verify once at link time; not required for new Clerk-only users). */
  users: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    role: v.optional(v.string()),
  }).index("by_username", ["username"]),

  clerkAccountLinks: defineTable({
    clerkSubject: v.string(),
    legacyUsername: v.string(),
    legacyConvexUserId: v.id("users"),
    legacyRole: v.optional(v.string()),
    linkedAt: v.number(),
  })
    .index("by_subject", ["clerkSubject"])
    .index("by_legacy_username", ["legacyUsername"]),

  userSettings: defineTable({
    clerkSubject: v.string(),
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  })
    .index("by_owner_key", ["clerkSubject", "key"])
    .index("by_subject", ["clerkSubject"]),

  memes: defineTable({
    name: v.string(),
    category: v.string(),
    ext: v.string(),
    storageId: v.id("_storage"),
    uploadedBy: v.string(),
    displayAnonymous: v.boolean(),
    ownerSubject: v.optional(v.string()),
  }),

  votes: defineTable({
    memeKey: v.string(),
    visitorId: v.string(),
    direction: v.optional(v.number()),
  })
    .index("by_meme", ["memeKey"])
    .index("by_visitor_meme", ["visitorId", "memeKey"]),
});
