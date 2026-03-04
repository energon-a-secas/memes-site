import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    passwordHash: v.string(),
  }).index("by_username", ["username"]),

  memes: defineTable({
    name: v.string(),
    category: v.string(),
    ext: v.string(),
    storageId: v.id("_storage"),
    uploadedBy: v.string(),        // username (tracked internally)
    displayAnonymous: v.boolean(),  // true = show "Anon" publicly
  }),

  votes: defineTable({
    memeKey: v.string(),
    visitorId: v.string(),
    direction: v.optional(v.number()),  // +1 upvote, -1 downvote (legacy rows may lack this)
  }).index("by_meme", ["memeKey"])
    .index("by_visitor_meme", ["visitorId", "memeKey"]),
});
