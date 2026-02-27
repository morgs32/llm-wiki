import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function toUTCYYYYMMDD(dateInput: string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) throw new Error("Invalid date");
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getUserId(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
}) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.subject ?? null;
}

export const createBooking = mutation({
  args: {
    carparkId: v.id("carparks"),
    checkInDay: v.string(),
    checkOutDay: v.string(),
    guestCount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to book");
    }

    const checkInDay = toUTCYYYYMMDD(args.checkInDay);
    const checkOutDay = toUTCYYYYMMDD(args.checkOutDay);

    const carpark = await ctx.db.get(args.carparkId);
    if (!carpark) {
      throw new Error("Carpark not found");
    }

    const overlappingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_carpark", (q) => q.eq("carparkId", args.carparkId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.and(
            q.lte(q.field("checkInDay"), checkOutDay),
            q.gte(q.field("checkOutDay"), checkInDay)
          )
        )
      )
      .collect();

    const parkingSpaces = await ctx.db
      .query("parkingSpaces")
      .withIndex("by_carpark", (q) => q.eq("carparkId", args.carparkId))
      .collect();
    const totalSpaces = parkingSpaces.length;
    const bookedSpaces = overlappingBookings.length;
    const availableSpaces = totalSpaces - bookedSpaces;

    if (availableSpaces <= 0) {
      throw new Error("No parking spaces available for selected dates");
    }

    const checkIn = new Date(checkInDay);
    const checkOut = new Date(checkOutDay);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = nights * carpark.pricePerNight;

    return await ctx.db.insert("bookings", {
      carparkId: args.carparkId,
      userId,
      checkInDay,
      checkOutDay,
      guestCount: args.guestCount,
      totalPrice,
      status: "confirmed",
    });
  },
});

export const getUserBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return [];
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const bookingsWithCarparks = [];
    for (const booking of bookings) {
      const carpark = await ctx.db.get(booking.carparkId);
      if (carpark) {
        bookingsWithCarparks.push({
          ...booking,
          carpark,
        });
      }
    }

    return bookingsWithCarparks.sort(
      (a, b) =>
        new Date(b.checkInDay).getTime() - new Date(a.checkInDay).getTime()
    );
  },
});
