import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const listDestinations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("destinations").collect();
  },
});

export const listDestinationsPaginated = query({
  args: {
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("destinations").order("asc").collect();
    let filtered = all;
    if (args.search && args.search.trim() !== "") {
      const s = args.search.trim().toLowerCase();
          filtered = all.filter(
        (d) =>
          d.name.toLowerCase().includes(s) ||
          d.slug.toLowerCase().includes(s)
      );
    }
    const { numItems, cursor } = args.paginationOpts;
    let startIndex = 0;
    if (cursor) {
      const idx = filtered.findIndex((r) => r._id.toString() === cursor);
      startIndex = idx === -1 ? 0 : idx + 1;
    }
    const page = filtered.slice(startIndex, startIndex + numItems);
    const continueCursor: string =
      page.length === numItems && startIndex + numItems < filtered.length
        ? page[page.length - 1]._id.toString()
        : "";
    return { page, continueCursor, isDone: continueCursor === "" };
  },
});

export const getDestination = query({
  args: { id: v.id("destinations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createDestination = mutation({
  args: {
    name: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("destinations", {
      name: args.name,
      latitude: args.latitude,
      longitude: args.longitude,
      slug: args.slug,
    });
  },
});

export const seedDestinations = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("destinations").collect();
    if (existing.length > 0) {
      return "Destinations already exist";
    }

    const cities = [
      { name: "New York", latitude: 40.7128, longitude: -74.006, slug: "new-york" },
      { name: "Miami", latitude: 25.7617, longitude: -80.1918, slug: "miami" },
      { name: "Los Angeles", latitude: 34.0522, longitude: -118.2437, slug: "los-angeles" },
    ];

    for (const city of cities) {
      await ctx.db.insert("destinations", city);
    }

    return "Destinations created successfully";
  },
});
