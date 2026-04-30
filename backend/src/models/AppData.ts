import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IAppData {
  appId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  data: Record<string, unknown>;
  createdAt: Date;
}

export interface AppDataDocument extends IAppData, Document {}

const AppDataSchema = new Schema<AppDataDocument>(
  {
    appId: { type: Schema.Types.ObjectId, ref: "App", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  {
    strict: false,
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AppData: Model<AppDataDocument> = mongoose.model<AppDataDocument>(
  "AppData",
  AppDataSchema
);
