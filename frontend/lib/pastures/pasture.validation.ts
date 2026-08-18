import { z } from "zod";

const latLngCoordinateSchema = z.tuple([
  z.number().finite().min(-90).max(90),
  z.number().finite().min(-180).max(180),
]);

const coordinatesSchema = z
  .array(latLngCoordinateSchema)
  .min(3, "A pasture boundary requires at least three points.")
  .max(5000, "A pasture boundary cannot exceed 5,000 points.")
  .superRefine((coordinates, context) => {
    const uniquePoints = new Set(
      coordinates.map(([lat, lng]) => `${lat.toFixed(8)},${lng.toFixed(8)}`),
    );

    if (uniquePoints.size < 3) {
      context.addIssue({
        code: "custom",
        message: "A pasture boundary requires at least three unique points.",
      });
    }
  });

const nameSchema = z.string().trim().min(1).max(255);
const descriptionSchema = z.string().trim().max(10_000).nullable();
const grassTypeSchema = z.string().trim().min(1).max(150);
const colorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a six-digit hexadecimal value.");
const landUseSchema = z.enum(["GRAZING", "HAY", "MIXED", "OTHER"]);

export const pastureIdSchema = z
  .string()
  .uuid("Pasture ID must be a valid UUID.");

export const createPastureSchema = z
  .object({
    name: nameSchema,
    description: descriptionSchema.optional().default(null),
    landUse: landUseSchema.optional().default("GRAZING"),
    grassType: grassTypeSchema,
    color: colorSchema.optional().default("#28A8CF"),
    coordinates: coordinatesSchema,
    grazeableAreaAcres: z.number().finite().positive(),
  })
  .strict();

export const updatePastureSchema = z
  .object({
    version: z.number().int().positive(),
    name: nameSchema.optional(),
    description: descriptionSchema.optional(),
    landUse: landUseSchema.optional(),
    grassType: grassTypeSchema.optional(),
    color: colorSchema.optional(),
    coordinates: coordinatesSchema.optional(),
    grazeableAreaAcres: z.number().finite().positive().optional(),
  })
  .strict()
  .refine(
    (input) =>
      input.name !== undefined ||
      input.description !== undefined ||
      input.landUse !== undefined ||
      input.grassType !== undefined ||
      input.color !== undefined ||
      input.coordinates !== undefined ||
      input.grazeableAreaAcres !== undefined,
    { message: "At least one pasture field must be supplied." },
  );

export type CreatePastureInput = z.infer<typeof createPastureSchema>;
export type UpdatePastureInput = z.infer<typeof updatePastureSchema>;
