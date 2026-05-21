import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("teacher"), v.literal("student")),
    createdAt: v.number(),
    xp: v.optional(v.number()),
    streak: v.optional(v.number()),
    lastActivityDate: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("dropped"))),
    droppedReason: v.optional(v.string()),
    droppedAt: v.optional(v.number()),
    droppedBy: v.optional(v.id("users")),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  tracks: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    color: v.string(),
    icon: v.string(),
    order: v.number(),
    published: v.boolean(),
  }).index("by_slug", ["slug"]),

  lessons: defineTable({
    trackId: v.id("tracks"),
    title: v.string(),
    content: v.string(),
    type: v.union(v.literal("content"), v.literal("quiz"), v.literal("game"), v.literal("mandatory")),
    order: v.number(),
    published: v.boolean(),
  }).index("by_track", ["trackId"]),

  quizQuestions: defineTable({
    lessonId: v.id("lessons"),
    question: v.string(),
    options: v.array(v.string()),
    correctIndex: v.number(),
    explanation: v.optional(v.string()),
    order: v.number(),
  }).index("by_lesson", ["lessonId"]),

  attempts: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    trackId: v.id("tracks"),
    score: v.number(),
    maxScore: v.number(),
    answers: v.optional(v.array(v.number())),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_lesson", ["userId", "lessonId"])
    .index("by_user_track", ["userId", "trackId"]),

  calendarEvents: defineTable({
    date: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    createdBy: v.id("users"),
  }).index("by_date", ["date"]),

  emailLogs: defineTable({
    subject: v.string(),
    body: v.string(),
    recipientIds: v.array(v.id("users")),
    sentBy: v.id("users"),
    sentAt: v.number(),
    recipientCount: v.number(),
  }).index("by_sent_at", ["sentAt"]),

  feedback: defineTable({
    studentId: v.id("users"),
    teacherId: v.id("users"),
    message: v.string(),
    trackId: v.optional(v.id("tracks")),
    lessonId: v.optional(v.id("lessons")),
    isRead: v.boolean(),
    createdAt: v.number(),
    acknowledgedAt: v.optional(v.number()),
    type: v.optional(v.union(
      v.literal("feedback"),
      v.literal("warning"),
      v.literal("notice"),
    )),
  })
    .index("by_student", ["studentId"])
    .index("by_student_unread", ["studentId", "isRead"]),

  quoteOfWeek: defineTable({
    text: v.string(),
    author: v.optional(v.string()),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }),

  assignments: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    trackId: v.optional(v.id("tracks")),
    dueDate: v.number(),
    createdBy: v.id("users"),
    assignedToAll: v.boolean(),
  })
    .index("by_created_by", ["createdBy"])
    .index("by_due_date", ["dueDate"]),
});
