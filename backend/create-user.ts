import mongoose from "mongoose";
import { User } from "./src/models/User";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

async function run() {
  if (!uri) throw new Error("No MONGODB_URI");
  await mongoose.connect(uri);
  const email = "test.user@local.dev";
  const password = "Test@12345";
  const user = await User.findOne({ email });
  if (user) {
    console.log("User already exists");
  } else {
    await User.create({ email, password, name: "Test User" });
    console.log("User created successfully");
  }
  await mongoose.disconnect();
}

run().catch(console.error);
