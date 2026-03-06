import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Response, NextFunction } from "express";

export const protect = async (req: any, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret",
      );

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      res.status(401).json({ message: "Invalid or unauthorized token." });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ message: "Authentication required. No token provided." });
  }
};
