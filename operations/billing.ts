import { z } from "zod";
import { zeropsRequest } from "../common/utils.js";
import {
  BillingPlanSchema,
  BillingUsageSchema,
  ApiResponseSchema,
  type BillingPlan,
  type BillingUsage,
} from "../common/types.js";

// Response schemas
const ListPlansResponseSchema = ApiResponseSchema.extend({
  data: z.array(BillingPlanSchema),
});

const ListUsageResponseSchema = ApiResponseSchema.extend({
  data: z.array(BillingUsageSchema),
});

/**
 * List available billing plans
 */
export async function listPlans(): Promise<BillingPlan[]> {
  const response = await zeropsRequest<ListPlansResponseSchema>({
    endpoint: "/billing/plans",
    method: "GET",
  });
  return response.data;
}

/**
 * Get billing usage for a service
 * @param projectId - The ID of the project
 * @param serviceId - The ID of the service
 * @param startDate - Start date for usage data (ISO string)
 * @param endDate - End date for usage data (ISO string)
 */
export async function getServiceUsage(
  projectId: string,
  serviceId: string,
  startDate: string,
  endDate: string
): Promise<BillingUsage[]> {
  const response = await zeropsRequest<ListUsageResponseSchema>({
    endpoint: `/billing/usage/${projectId}/${serviceId}`,
    method: "GET",
    params: {
      startDate,
      endDate,
    },
  });
  return response.data;
}

/**
 * Get billing usage for a project
 * @param projectId - The ID of the project
 * @param startDate - Start date for usage data (ISO string)
 * @param endDate - End date for usage data (ISO string)
 */
export async function getProjectUsage(
  projectId: string,
  startDate: string,
  endDate: string
): Promise<BillingUsage[]> {
  const response = await zeropsRequest<ListUsageResponseSchema>({
    endpoint: `/billing/usage/${projectId}`,
    method: "GET",
    params: {
      startDate,
      endDate,
    },
  });
  return response.data;
} 