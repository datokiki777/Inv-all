import { z } from "zod";

/**
 * Shared cross-field rule: a company client needs a company name, an
 * individual client needs a first + last name. Both the persisted-entity
 * schema and the form-input schema below run this same refinement so
 * validation can't drift between "what's saved" and "what's typed".
 */
function refineClientNameByType(
  data: { type: "company" | "individual"; companyName?: string; firstName?: string; lastName?: string },
  ctx: z.RefinementCtx
) {
  if (data.type === "company" && !data.companyName?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["companyName"], message: "companyNameRequired" });
  }
  if (data.type === "individual") {
    if (!data.firstName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["firstName"], message: "firstNameRequired" });
    }
    if (!data.lastName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lastName"], message: "lastNameRequired" });
    }
  }
}

const clientBaseObject = z.object({
  id: z.string().uuid(),
  type: z.enum(["company", "individual"]),
  companyName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  addressLine1: z.string().min(1, "addressRequired"),
  addressLine2: z.string().optional(),
  postalCode: z.string().min(1, "postalCodeRequired"),
  city: z.string().min(1, "cityRequired"),
  country: z.string().min(1, "countryRequired"),
  email: z.string().email("invalidEmail").optional().or(z.literal("")),
  phone: z.string().optional(),
  vatId: z.string().optional(),
  taxNumber: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const clientSchema = clientBaseObject.superRefine(refineClientNameByType);

/** Same shape as the Client entity, minus createdAt/updatedAt/notes — used to type ClientSnapshot. */
export const clientSnapshotBaseSchema = clientBaseObject.omit({
  createdAt: true,
  updatedAt: true,
  notes: true
});

/** Input schema used by the Client form (no id/createdAt/updatedAt). */
export const clientFormSchema = clientBaseObject
  .omit({ id: true, createdAt: true, updatedAt: true })
  .superRefine(refineClientNameByType);

export type ClientFormValues = z.infer<typeof clientFormSchema>;
