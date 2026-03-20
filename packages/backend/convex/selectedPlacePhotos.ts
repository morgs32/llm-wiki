import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function dedupePreserveOrder(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v2 of values) {
    const trimmed = v2.trim();
    if (!trimmed) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export const listSelectedPlacePhotos = query({
  args: {
    carparkId: v.id("carparks"),
  },
  handler: async (ctx, args) => {
    // Index order is based on [carparkId, sortOrder], so this is returned in ascending sortOrder.
    return await ctx.db
      .query("selectedPlacePhoto")
      .withIndex("by_carpark", (q) => q.eq("carparkId", args.carparkId))
      .collect();
  },
});

export const setSelectedPlacePhotos = mutation({
  args: {
    carparkId: v.id("carparks"),
    photoNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const clean = dedupePreserveOrder(args.photoNames);

    // Replace selection atomically from the perspective of the UI.
    const existing = await ctx.db
      .query("selectedPlacePhoto")
      .withIndex("by_carpark", (q) => q.eq("carparkId", args.carparkId))
      .collect();
    for (const row of existing) {
      await ctx.db.delete(row._id);
    }

    for (let i = 0; i < clean.length; i++) {
      await ctx.db.insert("selectedPlacePhoto", {
        carparkId: args.carparkId,
        photoName: clean[i],
        sortOrder: i,
      });
    }

    return clean.length;
  },
});

