import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId } from "./notes";

export const createDestinationRequest = mutation({
  args: {
    placeId: v.string(),
    name: v.string(),
    address: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
    types: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");

    await ctx.db.insert("destinationRequests", {
      userId,
      placeId: args.placeId,
      name: args.name,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      types: args.types,
      createdAt: Date.now(),
    });
  },
});
