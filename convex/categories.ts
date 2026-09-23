import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { MEMES } from "../js/data.js";
import { validateCategory } from "../js/organization.js";
import { requireAdmin, surfaced } from "./admin";

/** Memes have to land somewhere when their category is removed. */
const FALLBACK = "general";

const byName = (ctx: any, name: string) =>
  ctx.db.query("categories").withIndex("by_name", (q: any) => q.eq("name", name)).unique();

/** Categories an admin created that no meme uses yet. Everything else is derived from the memes. */
export const list = query({
  args: {},
  handler: async (ctx) => (await ctx.db.query("categories").collect()).map((row) => row.name),
});

/**
 * Move every meme out of one category and into another.
 *
 * Three stores hold a category and all three have to agree: uploaded `memes`
 * rows, `memeOrganization` rows, and bundled memes that have no row yet and so
 * still read their category straight out of data.js. The last case is the one
 * that bites, because those memes look untouched right up until the rename
 * silently skips them.
 */
async function moveMemes(ctx: any, from: string, to: string): Promise<number> {
  let moved = 0;
  for (const meme of await ctx.db.query("memes").collect()) {
    if (meme.category !== from) continue;
    await ctx.db.patch(meme._id, { category: to });
    moved += 1;
  }
  const rows = await ctx.db.query("memeOrganization").collect();
  const organized = new Set(rows.map((row: any) => row.memeKey));
  for (const row of rows) {
    if (row.category !== from) continue;
    await ctx.db.patch(row._id, { category: to });
    moved += 1;
  }
  for (const meme of MEMES) {
    if (organized.has(meme.name) || meme.category !== from) continue;
    await ctx.db.insert("memeOrganization", { memeKey: meme.name, category: to, labels: [] });
    moved += 1;
  }
  return moved;
}

/** Every category name in play, whether or not a meme uses it. */
async function knownCategories(ctx: any): Promise<Set<string>> {
  const names = new Set<string>(MEMES.map((meme) => meme.category));
  for (const row of await ctx.db.query("memeOrganization").collect()) names.add(row.category);
  for (const meme of await ctx.db.query("memes").collect()) names.add(meme.category);
  for (const row of await ctx.db.query("categories").collect()) names.add(row.name);
  return names;
}

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = surfaced(() => validateCategory(args.name));
    if ((await knownCategories(ctx)).has(name)) throw new ConvexError(`“${name}” already exists.`);
    await ctx.db.insert("categories", { name, createdAt: Date.now() });
    return name;
  },
});

export const rename = mutation({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const from = surfaced(() => validateCategory(args.from));
    const to = surfaced(() => validateCategory(args.to));
    if (from === to) return { from, to, moved: 0 };
    const moved = await moveMemes(ctx, from, to);
    const fromRow = await byName(ctx, from);
    if (fromRow) {
      // Renaming onto a name that already has a row merges the two.
      if (await byName(ctx, to)) await ctx.db.delete(fromRow._id);
      else await ctx.db.patch(fromRow._id, { name: to });
    }
    return { from, to, moved };
  },
});

export const remove = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = surfaced(() => validateCategory(args.name));
    if (name === FALLBACK) throw new ConvexError(`“${FALLBACK}” is where removed categories send their memes, so it cannot be removed.`);
    const moved = await moveMemes(ctx, name, FALLBACK);
    const row = await byName(ctx, name);
    if (row) await ctx.db.delete(row._id);
    return { name, moved, movedTo: FALLBACK };
  },
});
