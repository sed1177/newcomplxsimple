"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const sendEmail = action({
  args: {
    subject: v.string(),
    body: v.string(),
    recipientIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const allStudents = (await ctx.runQuery(api.users.listStudents)) as Array<{
      _id: Id<"users">;
      email: string;
      name: string;
    }>;

    const recipients =
      args.recipientIds.length > 0
        ? allStudents.filter((s) => (args.recipientIds as string[]).includes(s._id as string))
        : allStudents;

    if (recipients.length === 0) throw new Error("No recipients found");

    const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";

    await resend.emails.send({
      from: fromEmail,
      to: recipients.map((r) => r.email),
      subject: args.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #7C3AED, #06B6D4); padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ComplxSimple</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px;">A message from Cassandra Carter</p>
          </div>
          <div style="padding: 24px; background: #f9fafb; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            ${args.body.replace(/\n/g, "<br/>")}
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #6b7280; font-size: 13px; margin: 0;">Sent via ComplxSimple &mdash; Your interactive CS learning platform</p>
          </div>
        </div>
      `,
    });

    const sender = (await ctx.runQuery(api.users.getMyProfile)) as { _id: Id<"users"> } | null;
    if (!sender) throw new Error("Sender not found");

    await ctx.runMutation(internal.emailMutations.insertLog, {
      subject: args.subject,
      body: args.body,
      recipientIds: recipients.map((r) => r._id),
      recipientCount: recipients.length,
      sentBy: sender._id,
    });

    return { success: true, sent: recipients.length };
  },
});
