import { z } from "zod";
import { zeropsRequest, validateServiceName } from "../common/utils.js";
import {
  ServiceSchema,
  CreateServiceSchema,
  ApiResponseSchema,
  type Service,
  type ApiResponse,
} from "../common/types.js";

// Schema definitions
export const ListServicesResponseSchema = ApiResponseSchema.extend({
  data: z.array(ServiceSchema),
});

export const GetServiceResponseSchema = ApiResponseSchema.extend({
  data: ServiceSchema,
});

export const CreateServiceResponseSchema = ApiResponseSchema.extend({
  data: ServiceSchema,
});

// Service operations
export async function listServices(projectId: string): Promise<Service[]> {
  const response = await zeropsRequest<ApiResponse>(`/projects/${projectId}/services`);
  return ListServicesResponseSchema.parse(response).data;
}

export async function getService(
  projectId: string,
  serviceId: string
): Promise<Service> {
  const response = await zeropsRequest<ApiResponse>(
    `/projects/${projectId}/services/${serviceId}`
  );
  return GetServiceResponseSchema.parse(response).data;
}

export async function createService(
  projectId: string,
  name: string,
  type: string,
  environmentId: string,
  config?: Record<string, unknown>
): Promise<Service> {
  const validatedName = validateServiceName(name);
  const response = await zeropsRequest<ApiResponse>(
    `/projects/${projectId}/services`,
    {
      method: "POST",
      body: JSON.stringify(
        CreateServiceSchema.parse({
          name: validatedName,
          type,
          projectId,
          environmentId,
          config,
        })
      ),
    }
  );
  return CreateServiceResponseSchema.parse(response).data;
}

export async function deleteService(
  projectId: string,
  serviceId: string
): Promise<void> {
  await zeropsRequest<ApiResponse>(
    `/projects/${projectId}/services/${serviceId}`,
    {
      method: "DELETE",
    }
  );
}

export async function updateService(
  projectId: string,
  serviceId: string,
  updates: Partial<Omit<Service, "id" | "createdAt" | "updatedAt" | "projectId">>
): Promise<Service> {
  const response = await zeropsRequest<ApiResponse>(
    `/projects/${projectId}/services/${serviceId}`,
    {
      method: "PUT",
      body: JSON.stringify(updates),
    }
  );
  return GetServiceResponseSchema.parse(response).data;
}

export async function startService(
  projectId: string,
  serviceId: string
): Promise<Service> {
  const response = await zeropsRequest<ApiResponse>(
    `/projects/${projectId}/services/${serviceId}/start`,
    {
      method: "POST",
    }
  );
  return GetServiceResponseSchema.parse(response).data;
}

export async function stopService(
  projectId: string,
  serviceId: string
): Promise<Service> {
  const response = await zeropsRequest<ApiResponse>(
    `/projects/${projectId}/services/${serviceId}/stop`,
    {
      method: "POST",
    }
  );
  return GetServiceResponseSchema.parse(response).data;
} 