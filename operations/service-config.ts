import { z } from "zod";
import { zeropsRequest } from "../common/utils.js";
import {
  ApiResponseSchema,
  type ApiResponse,
} from "../common/types.js";

// Response schemas
const ServiceConfigResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    config: z.record(z.unknown()),
    ports: z.array(z.object({
      port: z.number(),
      protocol: z.string(),
    })),
    volumes: z.array(z.object({
      source: z.string(),
      target: z.string(),
    })),
  }),
});

/**
 * Get service configuration
 * @param projectId - The ID of the project
 * @param serviceId - The ID of the service
 */
export async function getServiceConfig(
  projectId: string,
  serviceId: string
): Promise<ApiResponse> {
  const response = await zeropsRequest<ServiceConfigResponseSchema>({
    endpoint: `/service-stack/${projectId}/${serviceId}/config`,
    method: "GET",
  });
  return response;
}

/**
 * Update service configuration
 * @param projectId - The ID of the project
 * @param serviceId - The ID of the service
 * @param config - The configuration to update
 */
export async function updateServiceConfig(
  projectId: string,
  serviceId: string,
  config: {
    config?: Record<string, unknown>;
    ports?: Array<{
      port: number;
      protocol: string;
    }>;
    volumes?: Array<{
      source: string;
      target: string;
    }>;
  }
): Promise<ApiResponse> {
  const response = await zeropsRequest<ServiceConfigResponseSchema>({
    endpoint: `/service-stack/${projectId}/${serviceId}/config`,
    method: "PUT",
    body: config,
  });
  return response;
}

/**
 * Get service ports
 * @param projectId - The ID of the project
 * @param serviceId - The ID of the service
 */
export async function getServicePorts(
  projectId: string,
  serviceId: string
): Promise<ApiResponse> {
  const response = await zeropsRequest<ServiceConfigResponseSchema>({
    endpoint: `/service-stack/${projectId}/${serviceId}/ports`,
    method: "GET",
  });
  return response;
}

/**
 * Update service ports
 * @param projectId - The ID of the project
 * @param serviceId - The ID of the service
 * @param ports - The ports to update
 */
export async function updateServicePorts(
  projectId: string,
  serviceId: string,
  ports: Array<{
    port: number;
    protocol: string;
  }>
): Promise<ApiResponse> {
  const response = await zeropsRequest<ServiceConfigResponseSchema>({
    endpoint: `/service-stack/${projectId}/${serviceId}/ports`,
    method: "PUT",
    body: { ports },
  });
  return response;
}

/**
 * Get service volumes
 * @param projectId - The ID of the project
 * @param serviceId - The ID of the service
 */
export async function getServiceVolumes(
  projectId: string,
  serviceId: string
): Promise<ApiResponse> {
  const response = await zeropsRequest<ServiceConfigResponseSchema>({
    endpoint: `/service-stack/${projectId}/${serviceId}/volumes`,
    method: "GET",
  });
  return response;
}

/**
 * Update service volumes
 * @param projectId - The ID of the project
 * @param serviceId - The ID of the service
 * @param volumes - The volumes to update
 */
export async function updateServiceVolumes(
  projectId: string,
  serviceId: string,
  volumes: Array<{
    source: string;
    target: string;
  }>
): Promise<ApiResponse> {
  const response = await zeropsRequest<ServiceConfigResponseSchema>({
    endpoint: `/service-stack/${projectId}/${serviceId}/volumes`,
    method: "PUT",
    body: { volumes },
  });
  return response;
} 