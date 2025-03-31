import { z } from "zod";

// Base schemas for common types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.string(),
  clientId: z.string().optional(),
});

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  projectId: z.string(),
  environmentId: z.string(),
  config: z.record(z.unknown()).optional(),
  ports: z.array(z.object({
    port: z.number(),
    protocol: z.string(),
  })).optional(),
  volumes: z.array(z.object({
    source: z.string(),
    target: z.string(),
  })).optional(),
});

export const EnvironmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  projectId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  variables: z.record(z.string()).optional(),
  status: z.string(),
});

// Auth schemas
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    token: z.string(),
    user: UserSchema,
  }),
  error: z.string().optional(),
});

export const AuthInfoSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: UserSchema,
    permissions: z.array(z.string()),
  }),
  error: z.string().optional(),
});

// Billing schemas
export const BillingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  features: z.array(z.string()),
});

export const BillingUsageSchema = z.object({
  serviceId: z.string(),
  resourceType: z.string(),
  amount: z.number(),
  unit: z.string(),
  timestamp: z.string(),
});

// Client schemas
export const ClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Request schemas
export const CreateProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  clientId: z.string().optional(),
});

export const CreateServiceSchema = z.object({
  name: z.string(),
  type: z.string(),
  projectId: z.string(),
  environmentId: z.string(),
  config: z.record(z.unknown()).optional(),
  ports: z.array(z.object({
    port: z.number(),
    protocol: z.string(),
  })).optional(),
  volumes: z.array(z.object({
    source: z.string(),
    target: z.string(),
  })).optional(),
});

export const UpdateEnvironmentSchema = z.object({
  name: z.string().optional(),
  variables: z.record(z.string()).optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

// Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type Environment = z.infer<typeof EnvironmentSchema>;
export type BillingPlan = z.infer<typeof BillingPlanSchema>;
export type BillingUsage = z.infer<typeof BillingUsageSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type AuthInfo = z.infer<typeof AuthInfoSchema>;