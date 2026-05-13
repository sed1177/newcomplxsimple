import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireTeacher } from "./_lib/auth";

export const listByMonth = query({
  args: { yearMonth: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const events = await ctx.db
      .query("calendarEvents")
      .collect();
    return events.filter((e) => e.date.startsWith(args.yearMonth));
  },
});

export const create = mutation({
  args: {
    date: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const teacher = await requireTeacher(ctx);
    return await ctx.db.insert("calendarEvents", {
      date: args.date,
      title: args.title,
      description: args.description,
      color: args.color ?? "#7C3AED",
      createdBy: teacher._id,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("calendarEvents"),
    title: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireTeacher(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("calendarEvents") },
  handler: async (ctx, args) => {
    await requireTeacher(ctx);
    await ctx.db.delete(args.id);
  },
});
