import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { User, type UserDocument } from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

type AuthResponseUser = {
  id: string;
  email: string;
  name: string;
  googleId?: string;
  createdAt: Date;
};

type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; message: string };

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

type LoginBody = {
  email?: string;
  password?: string;
};

type GoogleBody = {
  googleToken?: string;
};

const router = express.Router();

const getJwtSecret = (): string | null => {
  const secret = process.env.JWT_SECRET;
  return secret && secret.trim().length > 0 ? secret : null;
};

const signToken = (user: UserDocument): string => {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }
  return jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: "7d" });
};

const toAuthUser = (user: UserDocument): AuthResponseUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  googleId: user.googleId || undefined,
  createdAt: user.createdAt,
});

const badRequest = (res: Response, message: string) =>
  res.status(400).json({ success: false, message } satisfies ApiError);

const unauthorized = (res: Response, message: string) =>
  res.status(401).json({ success: false, message } satisfies ApiError);

router.post(
  "/register",
  async (req: Request<unknown, unknown, RegisterBody>, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return badRequest(res, "Name, email, and password are required");
    }

    try {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return badRequest(res, "Email already in use");
      }

      const user = new User({
        name,
        email: email.toLowerCase(),
        password,
      });
      await user.save();

      const token = signToken(user);
      const data: ApiSuccess<{ token: string; user: AuthResponseUser }> = {
        success: true,
        data: { token, user: toAuthUser(user) },
      };
      return res.status(201).json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      return res.status(500).json({ success: false, message } satisfies ApiError);
    }
  }
);

router.post(
  "/login",
  async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return badRequest(res, "Email and password are required");
    }

    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return unauthorized(res, "Invalid email or password");
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return unauthorized(res, "Invalid email or password");
      }

      const token = signToken(user);
      const data: ApiSuccess<{ token: string; user: AuthResponseUser }> = {
        success: true,
        data: { token, user: toAuthUser(user) },
      };
      return res.status(200).json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      return res.status(500).json({ success: false, message } satisfies ApiError);
    }
  }
);

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  if (!req.user) {
    return unauthorized(res, "Unauthorized");
  }

  try {
    const user = await User.findById(req.user.id).select("_id email name googleId createdAt");
    if (!user) {
      return unauthorized(res, "User not found");
    }

    const data: ApiSuccess<{ user: AuthResponseUser }> = {
      success: true,
      data: { user: toAuthUser(user) },
    };
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch user";
    return res.status(500).json({ success: false, message } satisfies ApiError);
  }
});

const fetchGoogleTokenInfo = async (token: string) => {
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`;
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Invalid Google token");
  }
  return (await response.json()) as {
    sub?: string;
    email?: string;
    name?: string;
  };
};

router.post(
  "/google",
  async (req: Request<unknown, unknown, GoogleBody>, res: Response) => {
    const { googleToken } = req.body;
    if (!googleToken) {
      return badRequest(res, "Google token is required");
    }

    try {
      const payload = await fetchGoogleTokenInfo(googleToken);
      if (!payload.sub || !payload.email) {
        return badRequest(res, "Invalid Google token payload");
      }

      let user = await User.findOne({
        $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
      });

      if (!user) {
        user = new User({
          name: payload.name || payload.email,
          email: payload.email.toLowerCase(),
          googleId: payload.sub,
        });
        await user.save();
      } else if (!user.googleId) {
        user.googleId = payload.sub;
        await user.save();
      }

      const token = signToken(user);
      const data: ApiSuccess<{ token: string; user: AuthResponseUser }> = {
        success: true,
        data: { token, user: toAuthUser(user) },
      };
      return res.status(200).json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google login failed";
      return res.status(401).json({ success: false, message } satisfies ApiError);
    }
  }
);

export default router;
