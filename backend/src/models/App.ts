import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IApp {
  userId: mongoose.Types.ObjectId;
  appName: string;
  description?: string;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppDocument extends IApp, Document {}

const AppSchema = new Schema<AppDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appName: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    config: { type: Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  }
);

export const App: Model<AppDocument> = mongoose.model<AppDocument>("App", AppSchema);
