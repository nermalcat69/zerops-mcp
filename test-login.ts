import { z } from "zod";

const BASE_URL = "https://api.app-prg1.zerops.io/api/rest/public";

const LoginResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    token: z.string(),
    user: z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
    }),
  }),
  error: z.string().optional(),
});

async function testLogin(email: string, password: string) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    const result = LoginResponseSchema.safeParse(data);

    if (result.success) {
      console.log("Login successful!");
      console.log("Token:", result.data.data.token);
      console.log("User:", result.data.data.user);
    } else {
      console.error("Login failed:", result.error);
      console.error("Response:", data);
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}

// Get credentials from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: ts-node test-login.ts <email> <password>");
  process.exit(1);
}

testLogin(email, password); 