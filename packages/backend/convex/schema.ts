import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
  }),

  destinations: defineTable({
    name: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    slug: v.string(),
  }),

  carparks: defineTable({
    name: v.string(),
    description: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    pricePerNight: v.number(),
    amenities: v.array(v.string()),
    imageUrls: v.array(v.string()),
    destinationId: v.id("destinations"),
  }).index("by_destination", ["destinationId"]),

  // Stores Google Places "photo.name" resources per carpark.
  // Actual image URLs are loaded on demand via an API route.
  selectedPlacePhoto: defineTable({
    carparkId: v.id("carparks"),
    photoName: v.string(),
    sortOrder: v.number(),
  }).index("by_carpark", ["carparkId", "sortOrder"]),

  parkingSpaces: defineTable({
    carparkId: v.id("carparks"),
  }).index("by_carpark", ["carparkId"]),

  bookings: defineTable({
    carparkId: v.id("carparks"),
    userId: v.string(),
    checkInDay: v.string(),
    checkOutDay: v.string(),
    guestCount: v.number(),
    totalPrice: v.number(),
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),
  })
    .index("by_carpark", ["carparkId"])
    .index("by_user", ["userId"])
    .index("by_carpark_and_days", ["carparkId", "checkInDay", "checkOutDay"]),

  destinationRequests: defineTable({
    userId: v.string(),
    placeId: v.string(),
    name: v.string(),
    address: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
    types: v.optional(v.array(v.string())),
    createdAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});
