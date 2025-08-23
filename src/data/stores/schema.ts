import { z } from "zod";

const storeSchema = z.object({
  name: z.string(),
  openingHours: z.array(
    z.object({
      day: z.string(),
      open: z.string().optional(),
      close: z.string().optional(),
      closed: z.boolean(),
    })
  ),
  services: z.array(
    z.object({
      name: z.string().optional(),
      type: z.string().optional(),
    })
  ),
  address: z.object({
    street: z.string().optional(),
    zip: z.string().optional(),
    city: z.string(),
  }),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
    url: z.string().optional(),
  }),
});

export type Store = z.infer<typeof storeSchema>;
