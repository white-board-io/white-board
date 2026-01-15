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

function convertHeaders(request: { headers: Record<string, string | string[] | undefined> }): Headers {
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

  fastify.post("/signup", async (request, reply) => {
    try {
      const result = await signUpWithOrgHandler(
        request.body,
        convertHeaders(request),
        fastify.logger
      );
      return reply.status(201).send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post("/signin", async (request, reply) => {
    try {
      const result = await signInHandler(
        request.body,
        convertHeaders(request),
        fastify.logger
      );
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post("/signout", async (request, reply) => {
    try {
      const result = await signOutHandler(convertHeaders(request), fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.get("/session", async (request, reply) => {
    try {
      const result = await getSessionHandler(convertHeaders(request), fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post("/forget-password", async (request, reply) => {
    try {
      const result = await forgetPasswordHandler(request.body, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post("/reset-password", async (request, reply) => {
    try {
      const result = await resetPasswordHandler(request.body, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post("/change-password", async (request, reply) => {
    try {
      await requireAuth(request);
      const result = await changePasswordHandler(
        request.body,
        request,
        fastify.logger
      );
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.patch("/profile", async (request, reply) => {
    try {
      await requireAuth(request);
      const result = await updateProfileHandler(
        request.body,
        convertHeaders(request),
        fastify.logger
      );
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.get("/organizations/:organizationId", async (request, reply) => {
    try {
      await requireAuth(request);
      const { organizationId } = request.params as { organizationId: string };
      const result = await getOrganizationHandler(organizationId, request, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.patch("/organizations/:organizationId", async (request, reply) => {
    try {
      await requireAuth(request);
      const { organizationId } = request.params as { organizationId: string };
      const result = await updateOrganizationHandler(
        organizationId,
        request.body,
        request,
        fastify.logger
      );
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.delete("/organizations/:organizationId", async (request, reply) => {
    try {
      await requireAuth(request);
      const { organizationId } = request.params as { organizationId: string };
      const result = await deleteOrganizationHandler(organizationId, request, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post("/organizations/:organizationId/switch", async (request, reply) => {
    try {
      await requireAuth(request);
      const { organizationId } = request.params as { organizationId: string };
      const result = await switchOrganizationHandler(
        organizationId,
        request,
        convertHeaders(request),
        fastify.logger
      );
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.get("/organizations/:organizationId/members", async (request, reply) => {
    try {
      await requireAuth(request);
      const { organizationId } = request.params as { organizationId: string };
      const result = await listMembersHandler(organizationId, request, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.delete("/organizations/:organizationId/members/:memberId", async (request, reply) => {
    try {
      await requireAuth(request);
      const { organizationId, memberId } = request.params as {
        organizationId: string;
        memberId: string;
      };
      const result = await removeMemberHandler(
        { organizationId, memberId },
        request,
        fastify.logger
      );
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post("/organizations/:organizationId/invitations", async (request, reply) => {
    try {
      await requireAuth(request);
      const { organizationId } = request.params as { organizationId: string };
      const body = request.body as Record<string, unknown>;
      const result = await inviteMemberHandler(
        { ...body, organizationId },
        request,
        fastify.logger
      );
      return reply.status(201).send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.get("/organizations/:organizationId/invitations", async (request, reply) => {
    try {
      await requireAuth(request);
      const { organizationId } = request.params as { organizationId: string };
      const result = await listInvitationsHandler(organizationId, request, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.delete("/organizations/:organizationId/invitations/:invitationId", async (request, reply) => {
    try {
      await requireAuth(request);
      const { organizationId, invitationId } = request.params as {
        organizationId: string;
        invitationId: string;
      };
      const result = await cancelInvitationHandler(
        { organizationId, invitationId },
        request,
        fastify.logger
      );
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.post("/invitations/accept", async (request, reply) => {
    try {
      await requireAuth(request);
      const result = await acceptInvitationHandler(request.body, request, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });
};

export default authRoutes;
