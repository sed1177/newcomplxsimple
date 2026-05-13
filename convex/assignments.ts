import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireTeacher } from "./_lib/auth";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    trackId: v.optional(v.id("tracks")),
    dueDate: v.number(),
    assignedToAll: v.boolean(),
  },
  handler: async (ctx, args) => {
    const teacher = await requireTeacher(ctx);
    return await ctx.db.insert("assignments", {
      title: args.title,
      description: args.description,
      trackId: args.trackId,
      dueDate: args.dueDate,
      createdBy: teacher._id,
      assignedToAll: args.assignedToAll,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("assignments") },
  handler: async (ctx, args) => {
    await requireTeacher(ctx);
    await ctx.db.delete(args.id);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const teacher = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!teacher || teacher.role !== "teacher") return [];
    return await ctx.db.query("assignments").order("desc").collect();
  },
});

export const listForStudent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user) return [];
    // Students see all assignments (assigned to all)
    return await ctx.db.query("assignments").order("desc").collect();
  },
});

export const getStatusForStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const teacher = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!teacher || teacher.role !== "teacher") return [];

    const assignments = await ctx.db.query("assignments").order("desc").collect();
    const now = Date.now();

    return await Promise.all(
      assignments.map(async (a) => {
        if (!a.trackId) return { ...a, status: "no-track" as const };

        const attempts = await ctx.db
          .query("attempts")
          .withIndex("by_user_track", (q) => q.eq("userId", args.studentId).eq("trackId", a.trackId!))
          .collect();

        const completedBeforeDue = attempts.some((att) => att.completedAt <= a.dueDate);

        let status: "complete" | "late" | "pending" | "empty";
        if (completedBeforeDue) {
          status = "complete";
        } else if (attempts.length === 0) {
          status = now > a.dueDate ? "empty" : "pending";
        } else {
          status = now > a.dueDate ? "late" : "pending";
        }

        return { ...a, status };
      })
    );
  },
});

export const getMyStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!user) return [];

    const assignments = await ctx.db.query("assignments").order("desc").collect();
    const now = Date.now();
    const tracks = await ctx.db.query("tracks").collect();

    return await Promise.all(
      assignments.map(async (a) => {
        const track = a.trackId ? tracks.find((t) => t._id === a.trackId) : null;

        if (!a.trackId) return { ...a, track: null, status: "pending" as const };

        const attempts = await ctx.db
          .query("attempts")
          .withIndex("by_user_track", (q) => q.eq("userId", user._id).eq("trackId", a.trackId!))
          .collect();

        const completedBeforeDue = attempts.some((att) => att.completedAt <= a.dueDate);

        let status: "complete" | "late" | "pending" | "empty";
        if (completedBeforeDue) {
          status = "complete";
        } else if (attempts.length === 0) {
          status = now > a.dueDate ? "empty" : "pending";
        } else {
          status = now > a.dueDate ? "late" : "pending";
        }

        return { ...a, track, status };
      })
    );
  },
});

export const getAllStudentStatuses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const teacher = await ctx.db.query("users").withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject)).unique();
    if (!teacher || teacher.role !== "teacher") return [];

    const assignments = await ctx.db.query("assignments").order("desc").collect();
    const students = await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", "student")).collect();
    const tracks = await ctx.db.query("tracks").collect();
    const now = Date.now();

    return await Promise.all(
      assignments.map(async (a) => {
        const track = a.trackId ? tracks.find((t) => t._id === a.trackId) : null;
        const studentStatuses = await Promise.all(
          students.filter((s) => s.status !== "dropped").map(async (s) => {
            if (!a.trackId) return { student: s, status: "pending" as const };
            const attempts = await ctx.db
              .query("attempts")
              .withIndex("by_user_track", (q) => q.eq("userId", s._id).eq("trackId", a.trackId!))
              .collect();
            const completedBeforeDue = attempts.some((att) => att.completedAt <= a.dueDate);
            let status: "complete" | "late" | "pending" | "empty";
            if (completedBeforeDue) { status = "complete"; }
            else if (attempts.length === 0) { status = now > a.dueDate ? "empty" : "pending"; }
            else { status = now > a.dueDate ? "late" : "pending"; }
            return { student: s, status };
          })
        );
        return { assignment: { ...a, track }, studentStatuses };
      })
    );
  },
});
