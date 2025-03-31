import { z } from "zod";
import { zeropsRequest } from "../common/utils.js";
import {
  UserSchema,
  ApiResponseSchema,
  UpdateUserSchema,
  type User,
} from "../common/types.js";

// Response schemas
const GetUserResponseSchema = ApiResponseSchema.extend({
  data: UserSchema,
});

const ListUsersResponseSchema = ApiResponseSchema.extend({
  data: z.array(UserSchema),
});

/**
 * Get the current user's information
 */
export async function getCurrentUser(): Promise<User> {
  const response = await zeropsRequest<GetUserResponseSchema>({
    endpoint: "/user",
    method: "GET",
  });
  return response.data;
}

/**
 * List all users in the organization
 */
export async function listUsers(): Promise<User[]> {
  const response = await zeropsRequest<ListUsersResponseSchema>({
    endpoint: "/users",
    method: "GET",
  });
  return response.data;
}

/**
 * Update the current user's information
 * @param updates - The fields to update
 */
export async function updateUser(updates: {
  name?: string;
  email?: string;
}): Promise<User> {
  const response = await zeropsRequest<GetUserResponseSchema>({
    endpoint: "/user",
    method: "PATCH",
    body: UpdateUserSchema.parse(updates),
  });
  return response.data;
}

/**
 * Get a specific user by ID
 * @param userId - The ID of the user to retrieve
 */
export async function getUser(userId: string): Promise<User> {
  const response = await zeropsRequest<GetUserResponseSchema>({
    endpoint: `/users/${userId}`,
    method: "GET",
  });
  return response.data;
} 