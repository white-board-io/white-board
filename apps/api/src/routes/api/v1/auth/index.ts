import type { FastifyPluginAsync } from "fastify";
import { signUpWithOrgHandler } from "../../../../modules/auth/commands/signup-with-org.command";
import { signInHandler } from "../../../../modules/auth/commands/signin.command";
import { signOutHandler } from "../../../../modules/auth/commands/signout.command";
import { getSessionHandler } from "../../../../modules/auth/queries/get-session.query";
import { forgetPasswordHandler } from "../../../../modules/auth/commands/forget-password.command";
import { resetPasswordHandler } from "../../../../modules/auth/commands/reset-password.command";
import { changePasswordHandler } from "../../../../modules/auth/commands/change-password.command";
import { updateProfileHandler } from "../../../../modules/auth/commands/update-profile.command";
import { getOrganizationHandler } from "../../../../modules/auth/queries/get-organization.query";
import { updateOrganizationHandler } from "../../../../modules/auth/commands/update-organization.command";
import { deleteOrganizationHandler } from "../../../../modules/auth/commands/delete-organization.command";
import { switchOrganizationHandler } from "../../../../modules/auth/commands/switch-organization.command";
import { listMembersHandler } from "../../../../modules/auth/queries/list-members.query";
import { removeMemberHandler } from "../../../../modules/auth/commands/remove-member.command";
import { inviteMemberHandler } from "../../../../modules/auth/commands/invite-member.command";
import { acceptInvitationHandler } from "../../../../modules/auth/commands/accept-invitation.command";
import { listInvitationsHandler } from "../../../../modules/auth/queries/list-invitations.query";
import { cancelInvitationHandler } from "../../../../modules/auth/commands/cancel-invitation.command";
import { requireAuth } from "../../../../modules/auth/middleware/require-auth.middleware";
import { createErrorHandler } from "../../../../shared/utils/error-handler";
import { forwardAuthHeaders } from "../../../../shared/utils/forward-auth-headers";
import rolesRoutes from "./roles";

function convertHeaders(request: {
  headers: Record<string, string | string[] | undefined>;
}): Headers {
  const headers = new Headers();
  Object.entries(request.headers).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.append(key, value);
      }
    }
  });
  return headers;
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const handleError = createErrorHandler(fastify);

  fastify.post(
    "/signup",
    {
      schema: {
        tags: ["auth"],
        summary: "Sign up with organization",
        description:
          "Creates a new user account with an associated organization",
        body: {
          type: "object",
          required: [
            "email",
            "lastName",
            "firstName",
            "password",
            "organizationName",
            "organizationType",
          ],
          properties: {
            lastName: { type: "string", minLength: 1 },
            email: { type: "string", format: "email" },
            firstName: { type: "string", minLength: 1 },
            organizationName: { type: "string", minLength: 1 },
            password: { type: "string", minLength: 8, maxLength: 128 },
            organizationType: {
              type: "string",
              enum: [
                "other",
                "school",
                "college",
                "tuition",
                "training_institute",
              ],
            },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  email: { type: "string" },
                },
              },
              organization: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  organizationType: { type: "string" },
                },
              },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await signUpWithOrgHandler(
          request.body,
          convertHeaders(request),
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }

        if (result.responseHeaders) {
          forwardAuthHeaders(result.responseHeaders, reply);
        }
        return reply.status(201).send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.post(
    "/signin",
    {
      schema: {
        tags: ["auth"],
        summary: "Sign in",
        description: "Authenticates a user with email and password",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  email: { type: "string" },
                },
              },
              organizations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    role: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await signInHandler(
          request.body,
          convertHeaders(request),
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }

        if (result.responseHeaders) {
          forwardAuthHeaders(result.responseHeaders, reply);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.post(
    "/signout",
    {
      schema: {
        tags: ["auth"],
        summary: "Sign out",
        description: "Ends the user's current session",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await signOutHandler(
          convertHeaders(request),
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }

        if (result.responseHeaders) {
          forwardAuthHeaders(result.responseHeaders, reply);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.get(
    "/session",
    {
      schema: {
        tags: ["auth"],
        summary: "Get session",
        description: "Retrieves the current user's session information",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  email: { type: "string" },
                },
              },
              organizations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    role: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await getSessionHandler(
          convertHeaders(request),
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.post(
    "/forget-password",
    {
      schema: {
        tags: ["auth"],
        summary: "Forgot password",
        description: "Sends a password reset link to the user's email",
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await forgetPasswordHandler(
          request.body,
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.post(
    "/reset-password",
    {
      schema: {
        tags: ["auth"],
        summary: "Reset password",
        description: "Resets the user's password using a reset token",
        body: {
          type: "object",
          required: ["token", "newPassword"],
          properties: {
            token: { type: "string", minLength: 1 },
            newPassword: { type: "string", minLength: 8, maxLength: 128 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await resetPasswordHandler(request.body, fastify.logger);

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.post(
    "/change-password",
    {
      schema: {
        tags: ["auth"],
        summary: "Change password",
        description: "Changes the user's current password",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string", minLength: 1 },
            newPassword: { type: "string", minLength: 8, maxLength: 128 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const result = await changePasswordHandler(
          request.body,
          request,
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.patch(
    "/profile",
    {
      schema: {
        tags: ["auth"],
        summary: "Update profile",
        description: "Updates the user's profile information",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            firstName: { type: "string", minLength: 1 },
            lastName: { type: "string", minLength: 1 },
            image: { type: "string", format: "url" },
          },
          additionalProperties: false,
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              firstName: { type: "string" },
              lastName: { type: "string" },
              email: { type: "string" },
              image: { type: ["string", "null"] },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const result = await updateProfileHandler(
          request.body,
          convertHeaders(request),
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.get(
    "/organizations/:organizationId",
    {
      schema: {
        tags: ["auth"],
        summary: "Get organization",
        description: "Retrieves an organization's details",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["organizationId"],
          properties: {
            organizationId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              organization: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  organizationType: { type: "string" },
                  logo: { type: ["string", "null"] },
                  addressLine1: { type: ["string", "null"] },
                  addressLine2: { type: ["string", "null"] },
                  city: { type: ["string", "null"] },
                  state: { type: ["string", "null"] },
                  zip: { type: ["string", "null"] },
                  country: { type: ["string", "null"] },
                  phone: { type: ["string", "null"] },
                  email: { type: ["string", "null"] },
                  website: { type: ["string", "null"] },
                  description: { type: ["string", "null"] },
                },
              },
              role: { type: "string" },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const { organizationId } = request.params as { organizationId: string };
        const result = await getOrganizationHandler(
          organizationId,
          request,
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.patch(
    "/organizations/:organizationId",
    {
      schema: {
        tags: ["auth"],
        summary: "Update organization",
        description: "Updates an organization's details",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["organizationId"],
          properties: {
            organizationId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1 },
            organizationType: {
              type: "string",
              enum: [
                "other",
                "school",
                "college",
                "tuition",
                "training_institute",
              ],
            },
            logo: { type: ["string", "null"], format: "url" },
            addressLine1: { type: ["string", "null"] },
            addressLine2: { type: ["string", "null"] },
            city: { type: ["string", "null"] },
            state: { type: ["string", "null"] },
            zip: { type: ["string", "null"] },
            country: { type: ["string", "null"] },
            phone: { type: ["string", "null"] },
            email: { type: ["string", "null"], format: "email" },
            website: { type: ["string", "null"], format: "url" },
            description: { type: ["string", "null"] },
          },
          additionalProperties: false,
        },
        response: {
          200: {
            type: "object",
            properties: {
              organization: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  organizationType: { type: "string" },
                  logo: { type: ["string", "null"] },
                  addressLine1: { type: ["string", "null"] },
                  addressLine2: { type: ["string", "null"] },
                  city: { type: ["string", "null"] },
                  state: { type: ["string", "null"] },
                  zip: { type: ["string", "null"] },
                  country: { type: ["string", "null"] },
                  phone: { type: ["string", "null"] },
                  email: { type: ["string", "null"] },
                  website: { type: ["string", "null"] },
                  description: { type: ["string", "null"] },
                },
              },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const { organizationId } = request.params as { organizationId: string };
        const result = await updateOrganizationHandler(
          organizationId,
          request.body,
          request,
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.delete(
    "/organizations/:organizationId",
    {
      schema: {
        tags: ["auth"],
        summary: "Delete organization",
        description: "Deletes an organization",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["organizationId"],
          properties: {
            organizationId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const { organizationId } = request.params as { organizationId: string };
        const result = await deleteOrganizationHandler(
          organizationId,
          request,
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.post(
    "/organizations/:organizationId/switch",
    {
      schema: {
        tags: ["auth"],
        summary: "Switch organization",
        description: "Switches the user's active organization",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["organizationId"],
          properties: {
            organizationId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              activeOrganizationId: { type: "string" },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const { organizationId } = request.params as { organizationId: string };
        const result = await switchOrganizationHandler(
          organizationId,
          request,
          convertHeaders(request),
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.get(
    "/organizations/:organizationId/members",
    {
      schema: {
        tags: ["auth"],
        summary: "List members",
        description: "Retrieves a list of organization members",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["organizationId"],
          properties: {
            organizationId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              members: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    email: { type: "string" },
                    role: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const { organizationId } = request.params as { organizationId: string };
        const result = await listMembersHandler(
          organizationId,
          request,
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.delete(
    "/organizations/:organizationId/members/:memberId",
    {
      schema: {
        tags: ["auth"],
        summary: "Remove member",
        description: "Removes a member from the organization",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["organizationId", "memberId"],
          properties: {
            organizationId: { type: "string", format: "uuid" },
            memberId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const { organizationId, memberId } = request.params as {
          organizationId: string;
          memberId: string;
        };
        const result = await removeMemberHandler(
          { organizationId, memberId },
          request,
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.post(
    "/organizations/:organizationId/invitations",
    {
      schema: {
        tags: ["auth"],
        summary: "Invite member",
        description: "Invites a new member to the organization",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["organizationId"],
          properties: {
            organizationId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["email", "role"],
          properties: {
            email: { type: "string", format: "email" },
            role: { type: "string", minLength: 1 },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              invitation: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string" },
                  expiresAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const { organizationId } = request.params as { organizationId: string };
        const body = request.body as Record<string, unknown>;
        const result = await inviteMemberHandler(
          { ...body, organizationId },
          request,
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.status(201).send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.get(
    "/organizations/:organizationId/invitations",
    {
      schema: {
        tags: ["auth"],
        summary: "List invitations",
        description: "Retrieves a list of pending invitations",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["organizationId"],
          properties: {
            organizationId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              invitations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    email: { type: "string" },
                    role: { type: "string" },
                    status: { type: "string" },
                    inviterEmail: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const { organizationId } = request.params as { organizationId: string };
        const result = await listInvitationsHandler(
          organizationId,
          request,
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.delete(
    "/organizations/:organizationId/invitations/:invitationId",
    {
      schema: {
        tags: ["auth"],
        summary: "Cancel invitation",
        description: "Cancels a pending invitation",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["organizationId", "invitationId"],
          properties: {
            organizationId: { type: "string", format: "uuid" },
            invitationId: { type: "string", minLength: 1 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const { organizationId, invitationId } = request.params as {
          organizationId: string;
          invitationId: string;
        };
        const result = await cancelInvitationHandler(
          { organizationId, invitationId },
          request,
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.post(
    "/invitations/accept",
    {
      schema: {
        tags: ["auth"],
        summary: "Accept invitation",
        description: "Accepts a pending invitation",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["invitationId"],
          properties: {
            invitationId: { type: "string", minLength: 1 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
          400: {
            type: "array",
            items: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                path: { type: "array", items: { type: ["string", "number"] } },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await requireAuth(request);
        const result = await acceptInvitationHandler(
          request.body,
          request,
          fastify.logger,
        );

        if (!result.isSuccess) {
          return reply.status(400).send(result.errors);
        }
        return reply.send(result.data);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  await fastify.register(rolesRoutes, {
    prefix: "/organizations/:organizationId/roles",
  });
};

export default authRoutes;
