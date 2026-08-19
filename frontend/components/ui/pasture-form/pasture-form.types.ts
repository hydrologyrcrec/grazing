import type { FormEvent, ReactNode } from "react";
import type {
  COLOR_OPTIONS,
  GRASS_TYPE_OPTIONS,
} from "@/components/ui/pasture-form/pasture-form.constants";
import type { Pasture, PastureDraft } from "@/types/pasture";

export type PastureColor = (typeof COLOR_OPTIONS)[number]["value"];
export type GrassType = (typeof GRASS_TYPE_OPTIONS)[number]["value"];

export type PastureFormValues = Readonly<{
  name: string;
  grazeableArea: string;
  landUse: Pasture["landUse"];
  grassType: GrassType;
  color: PastureColor;
  description: string;
  fsaIds: string;
}>;

export type PastureFieldChangeHandler = <
  Field extends keyof PastureFormValues,
>(
  field: Field,
  value: PastureFormValues[Field],
) => void;

export type AppPastureFormDraft = PastureDraft | null | undefined;

export type PastureFormCardProps = Readonly<{
  draft: PastureDraft;
}>;

export type PastureFormHeaderProps = Readonly<{
  onClose: () => void;
}>;

export type PastureFormFieldsProps = Readonly<{
  draft: PastureDraft;
  values: PastureFormValues;
  onFieldChange: PastureFieldChangeHandler;
}>;

export type PastureAreaFieldsProps = Readonly<{
  draft: PastureDraft;
  grazeableArea: string;
  onGrazeableAreaChange: (value: string) => void;
}>;

export type PastureClassificationFieldsProps = Readonly<{
  landUse: Pasture["landUse"];
  grassType: GrassType;
  color: PastureColor;
  onFieldChange: PastureFieldChangeHandler;
}>;

export type PastureNotesFieldsProps = Readonly<{
  description: string;
  fsaIds: string;
  onFieldChange: PastureFieldChangeHandler;
}>;

export type PastureFormActionsProps = Readonly<{
  onCancel: () => void;
}>;

export type PastureFormErrorProps = Readonly<{
  message: string;
}>;

export type FormFieldProps = Readonly<{
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
}>;

export type AreaInputProps = Readonly<{
  id: string;
  value: string;
  readOnly?: boolean;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  onChange?: (value: string) => void;
}>;

export type PastureFormValidationResult =
  | Readonly<{
      valid: true;
      grazeableAreaAcres: number;
    }>
  | Readonly<{
      valid: false;
      error: string;
    }>;

export type BuildPastureContext = Readonly<{
  id: string;
  deviceId: string;
  updatedAt: string;
}>;

export type UsePastureFormResult = Readonly<{
  values: PastureFormValues;
  error: string | null;
  updateField: PastureFieldChangeHandler;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  cancel: () => void;
}>;
