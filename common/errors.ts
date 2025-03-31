export class ZeropsError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response: unknown
  ) {
    super(message);
    this.name = "ZeropsError";
  }
}

export class ZeropsAuthenticationError extends ZeropsError {
  constructor(message = "Authentication failed") {
    super(message, 401, { message });
    this.name = "ZeropsAuthenticationError";
  }
}

export class ZeropsPermissionError extends ZeropsError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, { message });
    this.name = "ZeropsPermissionError";
  }
}

export class ZeropsRateLimitError extends ZeropsError {
  constructor(
    message = "Rate limit exceeded",
    public readonly resetAt: Date
  ) {
    super(message, 429, { message, reset_at: resetAt.toISOString() });
    this.name = "ZeropsRateLimitError";
  }
}

export function createZeropsError(status: number, response: any): ZeropsError {
  switch (status) {
    case 401:
      return new ZeropsAuthenticationError(response?.message);
    case 403:
      return new ZeropsPermissionError(response?.message);
    case 429:
      return new ZeropsRateLimitError(
        response?.message,
        new Date(response?.reset_at || Date.now() + 60000)
      );
    default:
      return new ZeropsError(
        response?.message || "Zerops API error",
        status,
        response
      );
  }
}