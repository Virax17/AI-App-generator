import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../models/User.js";

interface AuthPayload extends JwtPayload {
  id: string;
  email: string;
}

const getTokenFromHeader = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "JWT secret is not configured" });
  }

  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthPayload;
    if (!decoded?.id || !decoded?.email) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("_id email");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = { id: user.id, email: user.email };
    return next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid token";
    return res.status(401).json({ error: message });
  }
};
