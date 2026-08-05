import { z } from "zod";

export const restaurantSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio").max(100),
  description: z.string().max(500).optional(),
  theme: z.enum(["default", "modern"]).default("default"),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido").default("#f59e0b"),
  is_active: z.coerce.boolean().default(true),
});

export const menuSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  description: z.string().max(500).default(""),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  category: z.string().min(1, "La categoría es obligatoria").max(100),
  available: z.coerce.boolean().default(true),
});
