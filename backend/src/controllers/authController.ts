import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

// @desc    User Signup
// @route   POST /api/auth/signup
export const signup = async (req: Request, res: Response) => {
  try {
    // 1. name 대신 firstName, lastName을 구조 분해 할당으로 받습니다.
    const { firstName, lastName, email, password } = req.body;

    // 2. Password validation (기존 로직 유지)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.",
      });
    }

    // 3. Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create user (모델 변경사항 반영)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        message: "Signup successful!",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          // 모델에서 설정한 virtual 필드인 fullName도 사용 가능합니다.
          fullName: (user as any).fullName,
          email: user.email,
        },
      });
    }
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error occurred during signup." });
  }
};

// @desc    User Login
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "30d" },
    );

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: (user as any).fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error occurred during login." });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req: any, res: Response) => {
  try {
    // 비밀번호 제외하고 유저 정보 가져오기
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching user data." });
  }
};
