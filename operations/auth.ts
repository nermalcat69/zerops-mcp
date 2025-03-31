import { z } from "zod";
import { zeropsRequest } from "../common/utils.js";
import {
  LoginRequestSchema,
  LoginResponseSchema,
  AuthInfoSchema,
  type LoginRequest,
  type LoginResponse,
  type AuthInfo,
} from "../common/types.js";

/**
 * Login to Zerops API
 * @param email - User's email
 * @param password - User's password
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await zeropsRequest<LoginResponseSchema>({
    endpoint: "/auth/login",
    method: "POST",
    body: LoginRequestSchema.parse({ email, password }),
  });
  return response;
}

/**
 * Get current user's authentication information
 */
export async function getAuthInfo(): Promise<AuthInfo> {
  const response = await zeropsRequest<AuthInfoSchema>({
    endpoint: "/auth/info",
    method: "GET",
  });
  return response;
}

/**
 * Logout from Zerops API
 */
export async function logout(): Promise<void> {
  await zeropsRequest({
    endpoint: "/auth/logout",
    method: "POST",
  });
} 