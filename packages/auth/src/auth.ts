import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { db } from "@repo/database";
import * as todoSchema from "@repo/database/schema/todo";
import * as authSchema from "@repo/database/schema/auth";
import { ac, roles } from "./permissions";

const schema = { ...todoSchema, ...authSchema };

const mockSendEmail = ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  console.log("=".repeat(60));
  console.log("📧 MOCK EMAIL SERVICE");
  console.log("=".repeat(60));
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log("-".repeat(60));
  console.log(text || html || "(no content)");
  console.log("=".repeat(60));
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
        fieldName: "firstName",
      },
      lastName: {
        type: "string",
        required: false,
        fieldName: "lastName",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      void mockSendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Hello ${user.name},\n\nClick the link below to reset your password:\n${url}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
        html: `
          <h2>Reset Your Password</h2>
          <p>Hello ${user.name},</p>
          <p>Click the button below to reset your password:</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
          <p>Or copy this link: ${url}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });
    },
    resetPasswordTokenExpiresIn: 3600,
  },
  plugins: [
    organization({
      ac,
      roles,
      allowUserToCreateOrganization: true,
      sendInvitationEmail: async (data) => {
        const { email, organization, inviter, role, invitation } = data;
        const inviterName = inviter.user?.name || "Someone";
        const inviteUrl = `${process.env.CLIENT_ORIGIN || "http://localhost:3000"}/accept-invitation?token=${invitation.id}`;

        void mockSendEmail({
          to: email,
          subject: `You've been invited to join ${organization.name}`,
          text: `Hello,\n\n${inviterName} has invited you to join ${organization.name} as a ${role}.\n\nClick the link below to accept the invitation:\n${inviteUrl}\n\nThis invitation will expire in 7 days.`,
          html: `
            <h2>You're Invited!</h2>
            <p>${inviterName} has invited you to join <strong>${organization.name}</strong> as a <strong>${role}</strong>.</p>
            <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">Accept Invitation</a>
            <p>Or copy this link: ${inviteUrl}</p>
            <p>This invitation will expire in 7 days.</p>
          `,
        });
      },
    }),
  ],
});

export type Auth = typeof auth;
