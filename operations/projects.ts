import { z } from "zod";
import { zeropsRequest, validateProjectName } from "../common/utils.js";
import {
  ProjectSchema,
  CreateProjectSchema,
  ApiResponseSchema,
  type Project,
  type ApiResponse,
} from "../common/types.js";

// Schema definitions
export const ListProjectsResponseSchema = ApiResponseSchema.extend({
  data: z.array(ProjectSchema),
});

export const GetProjectResponseSchema = ApiResponseSchema.extend({
  data: ProjectSchema,
});

export const CreateProjectResponseSchema = ApiResponseSchema.extend({
  data: ProjectSchema,
});

// Project operations
export async function listProjects(): Promise<Project[]> {
  const response = await zeropsRequest<ApiResponse>("/projects");
  return ListProjectsResponseSchema.parse(response).data;
}

export async function getProject(projectId: string): Promise<Project> {
  const response = await zeropsRequest<ApiResponse>(`/projects/${projectId}`);
  return GetProjectResponseSchema.parse(response).data;
}

export async function createProject(
  name: string,
  description?: string
): Promise<Project> {
  const validatedName = validateProjectName(name);
  const response = await zeropsRequest<ApiResponse>("/projects", {
    method: "POST",
    body: JSON.stringify(CreateProjectSchema.parse({ name: validatedName, description })),
  });
  return CreateProjectResponseSchema.parse(response).data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await zeropsRequest<ApiResponse>(`/projects/${projectId}`, {
    method: "DELETE",
  });
}

export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>
): Promise<Project> {
  const response = await zeropsRequest<ApiResponse>(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return GetProjectResponseSchema.parse(response).data;
} 