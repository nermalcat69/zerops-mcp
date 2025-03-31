import { z } from "zod";
import { zeropsRequest } from "../common/utils.js";
import {
  ApiResponseSchema,
  type ApiResponse,
} from "../common/types.js";

// Response schemas
const ServiceLogsResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    logs: z.array(z.object({
      timestamp: z.string(),
      level: z.string(),
      message: z.string(),
      serviceId: z.string(),
    })),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
    }),
  }),
});

const ServiceMetricsResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    metrics: z.array(z.object({
      timestamp: z.string(),
      cpu: z.number(),
      memory: z.number(),
      disk: z.number(),
      network: z.object({
        in: z.number(),
        out: z.number(),
      }),
    })),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
    }),
  }),
});

/**
 * Get service logs
 * @param projectId - The ID of the project
 * @param serviceId - The ID of the service
 * @param options - Query options
 */
export async function getServiceLogs(
  projectId: string,
  serviceId: string,
  options: {
    page?: number;
    perPage?: number;
    level?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<ApiResponse> {
  const response = await zeropsRequest<ServiceLogsResponseSchema>({
    endpoint: `/service-stack/${projectId}/${serviceId}/logs`,
    method: "GET",
    params: options,
  });
  return response;
}

/**
 * Get service metrics
 * @param projectId - The ID of the project
 * @param serviceId - The ID of the service
 * @param options - Query options
 */
export async function getServiceMetrics(
  projectId: string,
  serviceId: string,
  options: {
    page?: number;
    perPage?: number;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<ApiResponse> {
  const response = await zeropsRequest<ServiceMetricsResponseSchema>({
    endpoint: `/service-stack/${projectId}/${serviceId}/metrics`,
    method: "GET",
    params: options,
  });
  return response;
}

/**
 * Stream service logs
 * @param projectId - The ID of the project
 * @param serviceId - The ID of the service
 * @param options - Query options
 */
export async function streamServiceLogs(
  projectId: string,
  serviceId: string,
  options: {
    level?: string;
    onLog: (log: { timestamp: string; level: string; message: string }) => void;
  }
): Promise<void> {
  const response = await fetch(
    `https://api.app-prg1.zerops.io/api/rest/public/service-stack/${projectId}/${serviceId}/logs/stream`,
    {
      headers: {
        "Authorization": `Bearer ${process.env.ZEROPS_ACCESS_TOKEN}`,
        "Accept": "text/event-stream",
      },
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to stream logs: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get response reader");
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = new TextDecoder().decode(value);
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const log = JSON.parse(line.slice(6));
          if (!options.level || log.level === options.level) {
            options.onLog(log);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
} 