import type { ComponentType } from "react";
import type { Field } from "../../types";
import CheckboxField from "./CheckboxField";
import DateField from "./DateField";
import DropdownField from "./DropdownField";
import EmailField from "./EmailField";
import NumberField from "./NumberField";
import TextareaField from "./TextareaField";
import TextField from "./TextField";
import UnknownField from "./UnknownField";

export type FieldComponentProps = {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  darkMode?: boolean;
};

const fieldMap: Partial<Record<Field["type"], ComponentType<FieldComponentProps>>> = {
  text: TextField,
  number: NumberField,
  email: EmailField,
  date: DateField,
  textarea: TextareaField,
  checkbox: CheckboxField,
  dropdown: DropdownField,
};

export const getFieldComponent = (type: string) =>
  fieldMap[type as Field["type"]] ?? UnknownField;
