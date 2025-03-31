import { z } from "zod";
import { zeropsRequest, validateEnvironmentName } from "../common/utils.js";
import {
  EnvironmentSchema,
  UpdateEnvironmentSchema,
  ApiResponseSchema,
  type Environment,
  type ApiResponse,
} from "../common/types.js";

// Schema definitions
export const ListEnvironmentsResponseSchema = ApiResponseSchema.extend({
  data: z.array(EnvironmentSchema),
});

export const GetEnvironmentResponseSchema = ApiResponseSchema.extend({
  data: EnvironmentSchema,
});

export const CreateEnvironmentResponseSchema = ApiResponseSchema.extend({
  data: EnvironmentSchema,
});

// Environment operations
export async function listEnvironments(projectId: string): Promise<Environment[]> {
  const response = await zeropsRequest<ApiResponse>(`/projects/${projectId}/environments`);
  return ListEnvironmentsResponseSchema.parse(response).data;
}

export async function getEnvironment(
  projectId: string,
  environmentId: string
): Promise<Environment> {
  const response = await zeropsRequest<ApiResponse>(
    `/projects/${projectId}/environments/${environmentId}`
  );
  return GetEnvironmentResponseSchema.parse(response).data;
}

export async function createEnvironment(
  projectId: string,
  name: string,
  variables?: Record<string, string>
): Promise<Environment> {
  const validatedName = validateEnvironmentName(name);
  const response = await zeropsRequest<ApiResponse>(
    `/projects/${projectId}/environments`,
    {
      method: "POST",
      body: JSON.stringify({
        name: validatedName,
        variables,
      }),
    }
  );
  return CreateEnvironmentResponseSchema.parse(response).data;
}

export async function deleteEnvironment(
  projectId: string,
  environmentId: string
): Promise<void> {
  await zeropsRequest<ApiResponse>(
    `/projects/${projectId}/environments/${environmentId}`,
    {
      method: "DELETE",
    }
  );
}

export async function updateEnvironment(
  projectId: string,
  environmentId: string,
  updates: Partial<Omit<Environment, "id" | "createdAt" | "updatedAt" | "projectId">>
): Promise<Environment> {
  const response = await zeropsRequest<ApiResponse>(
    `/projects/${projectId}/environments/${environmentId}`,
    {
      method: "PUT",
      body: JSON.stringify(UpdateEnvironmentSchema.parse(updates)),
    }
  );
  return GetEnvironmentResponseSchema.parse(response).data;
} 