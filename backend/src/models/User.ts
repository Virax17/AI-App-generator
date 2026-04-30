import bcrypt from "bcryptjs";
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IUser {
  email: string;
  password?: string;
  googleId?: string;
  name: string;
  createdAt: Date;
}

export interface UserDocument extends IUser, Document {
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false },
    googleId: { type: String, required: false },
    name: { type: String, required: true, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    if (!this.password) {
      return next();
    }
    const hashed = await bcrypt.hash(this.password, 10);
    this.password = hashed;
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

UserSchema.methods.comparePassword = async function (password: string) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(password, this.password);
};

export const User: Model<UserDocument> = mongoose.model<UserDocument>("User", UserSchema);
