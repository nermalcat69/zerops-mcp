import { createZeropsError, ZeropsAuthenticationError } from "./errors.js";
import { VERSION } from "./version.js";

const BASE_URL = "https://api.app-prg1.zerops.io/api/rest/public";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | undefined>;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export function buildUrl(baseUrl: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value.toString());
    }
  });
  return url.toString();
}

export async function zeropsRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": `zerops-mcp/${VERSION}`,
    ...options.headers,
  };

  const accessToken = process.env.ZEROPS_ACCESS_TOKEN;
  if (!accessToken) {
    throw new ZeropsAuthenticationError("ZEROPS_ACCESS_TOKEN environment variable is not set");
  }
  headers["Authorization"] = `Bearer ${accessToken}`;

  const url = options.params ? buildUrl(`${BASE_URL}${endpoint}`, options.params) : `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw createZeropsError(response.status, responseBody);
  }

  return responseBody as T;
}

export function validateProjectName(name: string): string {
  const sanitized = name.trim().toLowerCase();
  if (!sanitized) {
    throw new Error("Project name cannot be empty");
  }
  if (!/^[a-z0-9_.-]+$/.test(sanitized)) {
    throw new Error(
      "Project name can only contain lowercase letters, numbers, hyphens, periods, and underscores"
    );
  }
  return sanitized;
}

export function validateServiceName(name: string): string {
  const sanitized = name.trim().toLowerCase();
  if (!sanitized) {
    throw new Error("Service name cannot be empty");
  }
  if (!/^[a-z0-9_.-]+$/.test(sanitized)) {
    throw new Error(
      "Service name can only contain lowercase letters, numbers, hyphens, periods, and underscores"
    );
  }
  return sanitized;
}

export function validateEnvironmentName(name: string): string {
  const sanitized = name.trim().toLowerCase();
  if (!sanitized) {
    throw new Error("Environment name cannot be empty");
  }
  if (!/^[a-z0-9_.-]+$/.test(sanitized)) {
    throw new Error(
      "Environment name can only contain lowercase letters, numbers, hyphens, periods, and underscores"
    );
  }
  return sanitized;
}

export function buildProjectEndpoint(projectId: string, path: string = ""): string {
  return `/project/${projectId}${path}`;
}

export function buildServiceEndpoint(projectId: string, serviceId: string, path: string = ""): string {
  return `/service-stack/${projectId}/${serviceId}${path}`;
}

export function buildEnvironmentEndpoint(projectId: string, environmentId: string, path: string = ""): string {
  return `/project-env/${projectId}/${environmentId}${path}`;
}

export function buildUserDataEndpoint(projectId: string, path: string = ""): string {
  return `/user-data/${projectId}${path}`;
}

export function buildBillingEndpoint(path: string = ""): string {
  return `/billing${path}`;
}

export function buildClientEndpoint(path: string = ""): string {
  return `/client${path}`;
}

export function buildUserEndpoint(path: string = ""): string {
  return `/user${path}`;
}

export function buildAuthEndpoint(path: string = ""): string {
  return `/auth${path}`;
}

export function buildServiceLogsEndpoint(projectId: string, serviceId: string): string {
  return buildServiceEndpoint(projectId, serviceId, "/logs");
}

export function buildServiceMetricsEndpoint(projectId: string, serviceId: string): string {
  return buildServiceEndpoint(projectId, serviceId, "/metrics");
}

export function buildServiceConfigEndpoint(projectId: string, serviceId: string): string {
  return buildServiceEndpoint(projectId, serviceId, "/config");
}

export function buildEnvironmentVariablesEndpoint(projectId: string, environmentId: string): string {
  return buildEnvironmentEndpoint(projectId, environmentId, "/variables");
}

export function buildEnvironmentSecretsEndpoint(projectId: string, environmentId: string): string {
  return buildEnvironmentEndpoint(projectId, environmentId, "/secrets");
}