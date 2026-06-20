import { z } from "zod";

export const ContactFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.email({ message: "Enter a valid email address" }),
  message: z
    .string()
    .trim()
    .min(10, "Tell me a little more (10+ characters)")
    .max(2000, "Message is a bit long (2000 character max)"),
  // Honeypot: real users leave this empty; bots tend to fill every field.
  company: z.string().max(0).optional(),
});

export type ContactFormValues = z.infer<typeof ContactFormSchema>;
