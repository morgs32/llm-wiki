import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const searchCarparks = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    checkInDay: v.string(),
    checkOutDay: v.string(),
    maxDistance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const carparks = await ctx.db.query("carparks").collect();
    const maxDist = args.maxDistance ?? 50;

    const nearbyCarparks = carparks.filter((carpark) => {
      const distance = calculateDistance(
        args.latitude,
        args.longitude,
        carpark.latitude,
        carpark.longitude
      );
      return distance <= maxDist;
    });

    const availableCarparks = [];
    for (const carpark of nearbyCarparks) {
      const parkingSpaces = await ctx.db
        .query("parkingSpaces")
        .withIndex("by_carpark", (q) => q.eq("carparkId", carpark._id))
        .collect();
      const totalSpaces = parkingSpaces.length;

      const overlappingBookings = await ctx.db
        .query("bookings")
        .withIndex("by_carpark", (q) => q.eq("carparkId", carpark._id))
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "confirmed"),
            q.and(
              q.lte(q.field("checkInDay"), args.checkOutDay),
              q.gte(q.field("checkOutDay"), args.checkInDay)
            )
          )
        )
        .collect();

      const bookedSpaces = overlappingBookings.length;
      const availableSpaces = totalSpaces - bookedSpaces;

      if (availableSpaces > 0) {
        const distance = calculateDistance(
          args.latitude,
          args.longitude,
          carpark.latitude,
          carpark.longitude
        );
        availableCarparks.push({
          ...carpark,
          availableSpaces,
          distance: Math.round(distance * 10) / 10,
        });
      }
    }

    return availableCarparks.sort((a, b) => a.distance - b.distance);
  },
});

export const getCarpark = query({
  args: { carparkId: v.id("carparks") },
  handler: async (ctx, args) => {
    const carpark = await ctx.db.get(args.carparkId);
    if (!carpark) return null;
    const spaces = await ctx.db
      .query("parkingSpaces")
      .withIndex("by_carpark", (q) => q.eq("carparkId", args.carparkId))
      .collect();
    return { ...carpark, parkingSpaceCount: spaces.length };
  },
});

export const listCarparks = query({
  args: {},
  handler: async (ctx) => {
    const carparks = await ctx.db.query("carparks").collect();
    const destinations = await ctx.db.query("destinations").collect();
    const allSpaces = await ctx.db.query("parkingSpaces").collect();
    const spaceCountByCarpark = new Map<
      (typeof allSpaces)[0]["carparkId"],
      number
    >();
    for (const space of allSpaces) {
      spaceCountByCarpark.set(
        space.carparkId,
        (spaceCountByCarpark.get(space.carparkId) ?? 0) + 1
      );
    }
    const destMap = new Map(destinations.map((d) => [d._id, d]));
    return carparks.map((c) => ({
      ...c,
      destinationName: destMap.get(c.destinationId)?.name ?? "",
      parkingSpaceCount: spaceCountByCarpark.get(c._id) ?? 0,
    }));
  },
});

const carparkCreateValidator = {
  name: v.string(),
  description: v.string(),
  address: v.string(),
  latitude: v.number(),
  longitude: v.number(),
  pricePerNight: v.number(),
  amenities: v.array(v.string()),
  imageUrls: v.array(v.string()),
  parkingSpaceCount: v.number(),
  destinationId: v.id("destinations"),
};

export const createCarpark = mutation({
  args: carparkCreateValidator,
  handler: async (ctx, args) => {
    const carparkId = await ctx.db.insert("carparks", {
      name: args.name,
      description: args.description,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      pricePerNight: args.pricePerNight,
      amenities: args.amenities,
      imageUrls: args.imageUrls,
      destinationId: args.destinationId,
    });
    for (let i = 0; i < args.parkingSpaceCount; i++) {
      await ctx.db.insert("parkingSpaces", { carparkId });
    }
    return carparkId;
  },
});

export const updateCarpark = mutation({
  args: {
    carparkId: v.id("carparks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    pricePerNight: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
    imageUrls: v.optional(v.array(v.string())),
    parkingSpaceCount: v.optional(v.number()),
    destinationId: v.optional(v.id("destinations")),
  },
  handler: async (ctx, args) => {
    const { carparkId, ...updates } = args;
    const doc = await ctx.db.get(carparkId);
    if (!doc) throw new Error("Carpark not found");
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.address !== undefined) patch.address = updates.address;
    if (updates.latitude !== undefined) patch.latitude = updates.latitude;
    if (updates.longitude !== undefined) patch.longitude = updates.longitude;
    if (updates.pricePerNight !== undefined) patch.pricePerNight = updates.pricePerNight;
    if (updates.amenities !== undefined) patch.amenities = updates.amenities;
    if (updates.imageUrls !== undefined) patch.imageUrls = updates.imageUrls;
    if (updates.destinationId !== undefined) patch.destinationId = updates.destinationId;
    await ctx.db.patch(carparkId, patch);

    if (updates.parkingSpaceCount !== undefined) {
      const existing = await ctx.db
        .query("parkingSpaces")
        .withIndex("by_carpark", (q) => q.eq("carparkId", carparkId))
        .collect();
      const currentCount = existing.length;
      const targetCount = updates.parkingSpaceCount;
      if (targetCount < 0) throw new Error("Parking space count must be non-negative");
      if (targetCount < currentCount) {
        const overlappingBookings = await ctx.db
          .query("bookings")
          .withIndex("by_carpark", (q) => q.eq("carparkId", carparkId))
          .filter((q) => q.eq(q.field("status"), "confirmed"))
          .collect();
        if (targetCount < overlappingBookings.length) {
          throw new Error(
            "Cannot reduce parking spaces below current confirmed bookings"
          );
        }
        const toRemove = existing.slice(0, currentCount - targetCount);
        for (const space of toRemove) {
          await ctx.db.delete(space._id);
        }
      } else if (targetCount > currentCount) {
        for (let i = currentCount; i < targetCount; i++) {
          await ctx.db.insert("parkingSpaces", { carparkId });
        }
      }
    }
  },
});

export const removeCarpark = mutation({
  args: { carparkId: v.id("carparks") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.carparkId);
    if (!doc) throw new Error("Carpark not found");
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_carpark", (q) => q.eq("carparkId", args.carparkId))
      .collect();
    if (bookings.length > 0) {
      throw new Error("Cannot delete carpark with existing bookings");
    }
    const spaces = await ctx.db
      .query("parkingSpaces")
      .withIndex("by_carpark", (q) => q.eq("carparkId", args.carparkId))
      .collect();
    for (const space of spaces) {
      await ctx.db.delete(space._id);
    }
    await ctx.db.delete(args.carparkId);
  },
});

export const seedCarparks = mutation({
  args: {},
  handler: async (ctx) => {
    const existingCarparks = await ctx.db.query("carparks").collect();
    if (existingCarparks.length > 0) {
      return "Carparks already exist";
    }

    const destinations = await ctx.db.query("destinations").collect();
    if (destinations.length === 0) {
      return "Run seedDestinations first";
    }

    const ny = destinations.find((d) => d.slug === "new-york") ?? destinations[0];
    const miami = destinations.find((d) => d.slug === "miami") ?? destinations[0];

    const sampleCarparks = [
      {
        name: "Grand Plaza Carpark",
        description:
          "Central carpark in the heart of downtown with easy access",
        address: "123 Main St, Downtown",
        latitude: 40.7128,
        longitude: -74.006,
        pricePerNight: 250,
        amenities: ["WiFi", "Pool", "Gym", "Restaurant", "Spa"],
        imageUrls: [],
        destinationId: ny._id,
        parkingSpaceCount: 50,
      },
      {
        name: "Cozy Inn & Suites Carpark",
        description:
          "Convenient and affordable parking for business travelers",
        address: "456 Business Ave, Financial District",
        latitude: 40.7589,
        longitude: -73.9851,
        pricePerNight: 120,
        amenities: ["WiFi", "Business Center", "Breakfast"],
        imageUrls: [],
        destinationId: ny._id,
        parkingSpaceCount: 30,
      },
      {
        name: "Seaside Resort Carpark",
        description: "Beachfront parking perfect for vacation getaways",
        address: "789 Ocean Drive, Beachside",
        latitude: 40.6892,
        longitude: -74.0445,
        pricePerNight: 180,
        amenities: ["WiFi", "Beach Access", "Pool", "Restaurant", "Bar"],
        imageUrls: [],
        destinationId: ny._id,
        parkingSpaceCount: 75,
      },
      {
        name: "Mountain View Lodge Carpark",
        description: "Parking with easy access to mountain scenery",
        latitude: 40.8176,
        longitude: -74.1591,
        address: "321 Mountain Rd, Highlands",
        pricePerNight: 95,
        amenities: ["WiFi", "Hiking Trails", "Fireplace", "Restaurant"],
        imageUrls: [],
        destinationId: ny._id,
        parkingSpaceCount: 25,
      },
      {
        name: "Miami Beach Carpark",
        description: "Oceanfront parking with pool and spa access",
        address: "100 Ocean Dr, Miami Beach",
        latitude: 25.7907,
        longitude: -80.1300,
        pricePerNight: 220,
        amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Beach Access"],
        imageUrls: [],
        destinationId: miami._id,
        parkingSpaceCount: 60,
      },
    ];

    for (const carpark of sampleCarparks) {
      const { parkingSpaceCount, ...carparkData } = carpark;
      const carparkId = await ctx.db.insert("carparks", carparkData);
      for (let i = 0; i < parkingSpaceCount; i++) {
        await ctx.db.insert("parkingSpaces", { carparkId });
      }
    }

    return "Sample carparks created successfully";
  },
});
