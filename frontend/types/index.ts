export type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "dropdown" | "email" | "textarea" | "checkbox" | (string & {});
  required: boolean;
  options?: string[];
  placeholder?: string;
};

export type AppConfig = {
  appName: string;
  description?: string;
  fields: Field[];
  auth?: boolean;
};

export type App = {
  _id: string;
  appName: string;
  description?: string;
  config: AppConfig;
  createdAt: string;
};

export type AppData = {
  _id: string;
  appId: string;
  data: Record<string, unknown>;
  createdAt: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};
