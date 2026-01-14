---
title: Authentication Endpoints
description: Complete API reference for authentication, authorization, and organization management
category: api
priority: high
---

# Authentication Endpoints

All authentication endpoints are available under `/api/v1/auth`.

## Public Endpoints

### POST /signup

Create a new user account with an organization. The user becomes the owner of the organization.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "organizationName": "ABC School",
  "organizationType": "school"
}
```

**Organization Types:** `other`, `school`, `college`, `tuition`, `training_institute`

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe"
  },
  "organization": {
    "id": "uuid",
    "name": "ABC School",
    "slug": "abc-school-1234567890",
    "organizationType": "school"
  },
  "session": {
    "token": "session-token"
  }
}
```

### POST /signin

Sign in with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "session": {
    "token": "session-token"
  }
}
```

### POST /forget-password

Request a password reset email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true
}
```

### POST /reset-password

Reset password using the token from the email.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true
}
```

## Protected Endpoints

All endpoints below require authentication. Include the session token in cookies or Authorization header.

### POST /signout

Sign out the current user.

**Response (200):**
```json
{
  "success": true
}
```

### GET /session

Get current session with user info and organization memberships.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": false,
    "image": null
  },
  "organizations": [
    {
      "id": "uuid",
      "name": "ABC School",
      "slug": "abc-school",
      "organizationType": "school",
      "role": "owner",
      "logo": null
    }
  ],
  "activeOrganizationId": "uuid"
}
```

### POST /change-password

Change password for the authenticated user.

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Response (200):**
```json
{
  "success": true
}
```

### PATCH /profile

Update user profile.

**Request:**
```json
{
  "firstName": "Johnny",
  "lastName": "Doe",
  "image": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "Johnny",
    "lastName": "Doe",
    "image": "https://example.com/avatar.jpg"
  }
}
```

## Organization Endpoints

### GET /organizations/:organizationId

Get organization details. Requires membership.

**Response (200):**
```json
{
  "organization": {
    "id": "uuid",
    "name": "ABC School",
    "slug": "abc-school",
    "organizationType": "school",
    "logo": null,
    "addressLine1": "123 Main St",
    "addressLine2": null,
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA",
    "phone": "+1234567890",
    "email": "contact@abcschool.com",
    "website": "https://abcschool.com",
    "description": "A great school",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "role": "owner"
}
```

### PATCH /organizations/:organizationId

Update organization. Requires `organization:update` permission.

**Request:**
```json
{
  "name": "ABC School Updated",
  "addressLine1": "456 New St",
  "city": "Los Angeles",
  "state": "CA"
}
```

**Response (200):**
```json
{
  "organization": {
    "id": "uuid",
    "name": "ABC School Updated",
    "slug": "abc-school",
    "organizationType": "school"
  }
}
```

### DELETE /organizations/:organizationId

Soft delete an organization. Requires `organization:delete` permission.

**Response (200):**
```json
{
  "success": true
}
```

### POST /organizations/:organizationId/switch

Switch the active organization for the current session.

**Response (200):**
```json
{
  "activeOrganizationId": "uuid"
}
```

## Member Endpoints

### GET /organizations/:organizationId/members

List all members of an organization. Requires `member:read` permission.

**Response (200):**
```json
{
  "members": [
    {
      "id": "member-uuid",
      "userId": "user-uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "owner",
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### DELETE /organizations/:organizationId/members/:memberId

Remove a member from the organization. Requires `member:delete` permission.

**Response (200):**
```json
{
  "success": true
}
```

## Invitation Endpoints

### POST /organizations/:organizationId/invitations

Invite a user to the organization. Requires `invitation:create` permission.

**Request:**
```json
{
  "email": "jane@example.com",
  "role": "teacher"
}
```

**Roles:** `owner`, `admin`, `teacher`, `student`, `parent`, `staff`

**Response (201):**
```json
{
  "invitation": {
    "id": "uuid",
    "email": "jane@example.com",
    "role": "teacher",
    "expiresAt": "2024-01-08T00:00:00Z"
  }
}
```

### GET /organizations/:organizationId/invitations

List all invitations for an organization. Requires `invitation:read` permission.

**Response (200):**
```json
{
  "invitations": [
    {
      "id": "uuid",
      "email": "jane@example.com",
      "role": "teacher",
      "status": "pending",
      "expiresAt": "2024-01-08T00:00:00Z",
      "inviterEmail": "john@example.com",
      "inviterName": "John Doe",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### DELETE /organizations/:organizationId/invitations/:invitationId

Cancel a pending invitation. Requires `invitation:delete` permission.

**Response (200):**
```json
{
  "success": true
}
```

### POST /invitations/accept

Accept an invitation (authenticated user).

**Request:**
```json
{
  "invitationId": "uuid"
}
```

**Response (200):**
```json
{
  "organization": {
    "id": "uuid",
    "name": "ABC School"
  },
  "role": "teacher"
}
```

## Role Permissions

| Role | organization | member | invitation |
|------|--------------|--------|------------|
| owner | update, delete | create, read, update, delete | create, read, delete |
| admin | update | create, read, update, delete | create, read, delete |
| teacher | - | read | - |
| student | - | read | - |
| parent | - | read | - |
| staff | - | create, read, update | create, read, delete |

## Error Responses

All endpoints return errors in this format:

```json
{
  "code": "VALIDATION_ERROR",
  "details": {
    "fieldErrors": {
      "email": ["EMAIL_INVALID"]
    }
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR` (400) - Invalid input
- `UNAUTHORIZED` (401) - Not authenticated
- `FORBIDDEN` (403) - Not authorized
- `RESOURCE_NOT_FOUND` (404) - Resource not found
- `DUPLICATE_RESOURCE` (409) - Already exists
