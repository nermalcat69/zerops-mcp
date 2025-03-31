import { z } from "zod";
import { zeropsRequest } from "../common/utils.js";
import {
  ApiResponseSchema,
  type ApiResponse,
} from "../common/types.js";

// Response schemas
const EnvironmentVariablesResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    variables: z.record(z.string()),
  }),
});

const EnvironmentSecretsResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    secrets: z.array(z.object({
      key: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })),
  }),
});

/**
 * Get environment variables
 * @param projectId - The ID of the project
 * @param environmentId - The ID of the environment
 */
export async function getEnvironmentVariables(
  projectId: string,
  environmentId: string
): Promise<ApiResponse> {
  const response = await zeropsRequest<EnvironmentVariablesResponseSchema>({
    endpoint: `/project-env/${projectId}/${environmentId}/variables`,
    method: "GET",
  });
  return response;
}

/**
 * Update environment variables
 * @param projectId - The ID of the project
 * @param environmentId - The ID of the environment
 * @param variables - The variables to update
 */
export async function updateEnvironmentVariables(
  projectId: string,
  environmentId: string,
  variables: Record<string, string>
): Promise<ApiResponse> {
  const response = await zeropsRequest<EnvironmentVariablesResponseSchema>({
    endpoint: `/project-env/${projectId}/${environmentId}/variables`,
    method: "PUT",
    body: { variables },
  });
  return response;
}

/**
 * Get environment secrets
 * @param projectId - The ID of the project
 * @param environmentId - The ID of the environment
 */
export async function getEnvironmentSecrets(
  projectId: string,
  environmentId: string
): Promise<ApiResponse> {
  const response = await zeropsRequest<EnvironmentSecretsResponseSchema>({
    endpoint: `/project-env/${projectId}/${environmentId}/secrets`,
    method: "GET",
  });
  return response;
}

/**
 * Create environment secret
 * @param projectId - The ID of the project
 * @param environmentId - The ID of the environment
 * @param key - The secret key
 * @param value - The secret value
 */
export async function createEnvironmentSecret(
  projectId: string,
  environmentId: string,
  key: string,
  value: string
): Promise<ApiResponse> {
  const response = await zeropsRequest<EnvironmentSecretsResponseSchema>({
    endpoint: `/project-env/${projectId}/${environmentId}/secrets`,
    method: "POST",
    body: { key, value },
  });
  return response;
}

/**
 * Delete environment secret
 * @param projectId - The ID of the project
 * @param environmentId - The ID of the environment
 * @param key - The secret key to delete
 */
export async function deleteEnvironmentSecret(
  projectId: string,
  environmentId: string,
  key: string
): Promise<void> {
  await zeropsRequest({
    endpoint: `/project-env/${projectId}/${environmentId}/secrets/${key}`,
    method: "DELETE",
  });
} 