import { z } from "zod";

export const AuthValidationErrorCodes = {
  FIRST_NAME_REQUIRED: "FIRST_NAME_REQUIRED",
  LAST_NAME_REQUIRED: "LAST_NAME_REQUIRED",
  EMAIL_REQUIRED: "EMAIL_REQUIRED",
  EMAIL_INVALID: "EMAIL_INVALID",
  PASSWORD_REQUIRED: "PASSWORD_REQUIRED",
  PASSWORD_MIN_LENGTH: "PASSWORD_MIN_LENGTH",
  PASSWORD_MAX_LENGTH: "PASSWORD_MAX_LENGTH",
  ORGANIZATION_NAME_REQUIRED: "ORGANIZATION_NAME_REQUIRED",
  ORGANIZATION_TYPE_INVALID: "ORGANIZATION_TYPE_INVALID",
  TOKEN_REQUIRED: "TOKEN_REQUIRED",
  CURRENT_PASSWORD_REQUIRED: "CURRENT_PASSWORD_REQUIRED",
  INVITATION_ID_REQUIRED: "INVITATION_ID_REQUIRED",
  ORGANIZATION_ID_INVALID: "ORGANIZATION_ID_INVALID",
  MEMBER_ID_INVALID: "MEMBER_ID_INVALID",
  ROLE_INVALID: "ROLE_INVALID",
  IMAGE_URL_INVALID: "IMAGE_URL_INVALID",
  WEBSITE_URL_INVALID: "WEBSITE_URL_INVALID",
  PHONE_INVALID: "PHONE_INVALID",
  ZIP_INVALID: "ZIP_INVALID",
} as const;

export const OrganizationTypeEnum = z.enum(
  ["other", "school", "college", "tuition", "training_institute"],
  { message: AuthValidationErrorCodes.ORGANIZATION_TYPE_INVALID }
);

export type OrganizationType = z.infer<typeof OrganizationTypeEnum>;

export const RoleEnum = z.enum(
  ["owner", "admin", "teacher", "student", "parent", "staff"],
  { message: AuthValidationErrorCodes.ROLE_INVALID }
);

export type Role = z.infer<typeof RoleEnum>;

export const SignUpWithOrgInputSchema = z.object({
  firstName: z.string().min(1, { message: AuthValidationErrorCodes.FIRST_NAME_REQUIRED }),
  lastName: z.string().min(1, { message: AuthValidationErrorCodes.LAST_NAME_REQUIRED }),
  email: z.string()
    .min(1, { message: AuthValidationErrorCodes.EMAIL_REQUIRED })
    .email({ message: AuthValidationErrorCodes.EMAIL_INVALID }),
  password: z.string()
    .min(8, { message: AuthValidationErrorCodes.PASSWORD_MIN_LENGTH })
    .max(128, { message: AuthValidationErrorCodes.PASSWORD_MAX_LENGTH }),
  organizationName: z.string().min(1, { message: AuthValidationErrorCodes.ORGANIZATION_NAME_REQUIRED }),
  organizationType: OrganizationTypeEnum,
});

export type SignUpWithOrgInput = z.infer<typeof SignUpWithOrgInputSchema>;

export const SignInInputSchema = z.object({
  email: z.string()
    .min(1, { message: AuthValidationErrorCodes.EMAIL_REQUIRED })
    .email({ message: AuthValidationErrorCodes.EMAIL_INVALID }),
  password: z.string().min(1, { message: AuthValidationErrorCodes.PASSWORD_REQUIRED }),
});

export type SignInInput = z.infer<typeof SignInInputSchema>;

export const ForgotPasswordInputSchema = z.object({
  email: z.string()
    .min(1, { message: AuthValidationErrorCodes.EMAIL_REQUIRED })
    .email({ message: AuthValidationErrorCodes.EMAIL_INVALID }),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

export const ResetPasswordInputSchema = z.object({
  token: z.string().min(1, { message: AuthValidationErrorCodes.TOKEN_REQUIRED }),
  newPassword: z.string()
    .min(8, { message: AuthValidationErrorCodes.PASSWORD_MIN_LENGTH })
    .max(128, { message: AuthValidationErrorCodes.PASSWORD_MAX_LENGTH }),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

export const ChangePasswordInputSchema = z.object({
  currentPassword: z.string().min(1, { message: AuthValidationErrorCodes.CURRENT_PASSWORD_REQUIRED }),
  newPassword: z.string()
    .min(8, { message: AuthValidationErrorCodes.PASSWORD_MIN_LENGTH })
    .max(128, { message: AuthValidationErrorCodes.PASSWORD_MAX_LENGTH }),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>;

export const UpdateProfileInputSchema = z.object({
  firstName: z.string().min(1, { message: AuthValidationErrorCodes.FIRST_NAME_REQUIRED }).optional(),
  lastName: z.string().min(1, { message: AuthValidationErrorCodes.LAST_NAME_REQUIRED }).optional(),
  image: z.string().url({ message: AuthValidationErrorCodes.IMAGE_URL_INVALID }).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

export const UpdateOrganizationInputSchema = z.object({
  name: z.string().min(1, { message: AuthValidationErrorCodes.ORGANIZATION_NAME_REQUIRED }).optional(),
  organizationType: OrganizationTypeEnum.optional(),
  logo: z.string().url({ message: AuthValidationErrorCodes.IMAGE_URL_INVALID }).optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: AuthValidationErrorCodes.EMAIL_INVALID }).optional().nullable(),
  website: z.string().url({ message: AuthValidationErrorCodes.WEBSITE_URL_INVALID }).optional().nullable(),
  description: z.string().optional().nullable(),
});

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationInputSchema>;

export const InviteMemberInputSchema = z.object({
  email: z.string()
    .min(1, { message: AuthValidationErrorCodes.EMAIL_REQUIRED })
    .email({ message: AuthValidationErrorCodes.EMAIL_INVALID }),
  role: z.string().min(1, { message: AuthValidationErrorCodes.ROLE_INVALID }),
  organizationId: z.string().uuid({ message: AuthValidationErrorCodes.ORGANIZATION_ID_INVALID }),
});

export type InviteMemberInput = z.infer<typeof InviteMemberInputSchema>;

export const AcceptInvitationInputSchema = z.object({
  invitationId: z.string().min(1, { message: AuthValidationErrorCodes.INVITATION_ID_REQUIRED }),
});

export type AcceptInvitationInput = z.infer<typeof AcceptInvitationInputSchema>;

export const RemoveMemberInputSchema = z.object({
  memberId: z.string().uuid({ message: AuthValidationErrorCodes.MEMBER_ID_INVALID }),
  organizationId: z.string().uuid({ message: AuthValidationErrorCodes.ORGANIZATION_ID_INVALID }),
});

export type RemoveMemberInput = z.infer<typeof RemoveMemberInputSchema>;

export const OrganizationIdParamSchema = z.object({
  organizationId: z.string().uuid({ message: AuthValidationErrorCodes.ORGANIZATION_ID_INVALID }),
});

export type OrganizationIdParam = z.infer<typeof OrganizationIdParamSchema>;
