import { z } from "zod";
import { zeropsRequest } from "../common/utils.js";
import {
  ClientSchema,
  ApiResponseSchema,
  type Client,
} from "../common/types.js";

// Response schemas
const GetClientResponseSchema = ApiResponseSchema.extend({
  data: ClientSchema,
});

const ListClientsResponseSchema = ApiResponseSchema.extend({
  data: z.array(ClientSchema),
});

/**
 * List all clients
 */
export async function listClients(): Promise<Client[]> {
  const response = await zeropsRequest<ListClientsResponseSchema>({
    endpoint: "/clients",
    method: "GET",
  });
  return response.data;
}

/**
 * Get a specific client by ID
 * @param clientId - The ID of the client to retrieve
 */
export async function getClient(clientId: string): Promise<Client> {
  const response = await zeropsRequest<GetClientResponseSchema>({
    endpoint: `/clients/${clientId}`,
    method: "GET",
  });
  return response.data;
}

/**
 * Create a new client
 * @param name - The name of the client
 */
export async function createClient(name: string): Promise<Client> {
  const response = await zeropsRequest<GetClientResponseSchema>({
    endpoint: "/clients",
    method: "POST",
    body: { name },
  });
  return response.data;
}

/**
 * Update a client
 * @param clientId - The ID of the client to update
 * @param name - The new name for the client
 */
export async function updateClient(
  clientId: string,
  name: string
): Promise<Client> {
  const response = await zeropsRequest<GetClientResponseSchema>({
    endpoint: `/clients/${clientId}`,
    method: "PATCH",
    body: { name },
  });
  return response.data;
}

/**
 * Delete a client
 * @param clientId - The ID of the client to delete
 */
export async function deleteClient(clientId: string): Promise<void> {
  await zeropsRequest({
    endpoint: `/clients/${clientId}`,
    method: "DELETE",
  });
} 