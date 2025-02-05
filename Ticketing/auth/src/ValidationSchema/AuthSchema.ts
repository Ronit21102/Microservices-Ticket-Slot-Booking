import { z } from "zod";


export const signupSchema = z.object({
    email: z.string().email("Email must be valid"),
    password: z.string().min(4, "Password must be at least 4 characters").max(20, "Password must be at most 20 characters"),
  });
  