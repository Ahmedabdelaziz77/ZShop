import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import Stripe from "stripe";

import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegisterationData,
  verifyForogtPasswordOtp,
  verifyOtp,
} from "../utils/authHelper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import { setCookie } from "../utils/cookies/setCookie";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

export const RegisterUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegisterationData(req.body, "user");

    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your acc.",
    });
  } catch (err) {
    return next(err);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name)
      return next(
        new ValidationError("Email, OTP, Name and Password are required!")
      );

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser)
      return next(new ValidationError("User already exists with this email!"));

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    return next(err);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new ValidationError("Email and Password are required!"));

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new AuthError("User doesn't exist!"));

    const isMatching = await bcrypt.compare(password, user.password!);
    if (!isMatching) return next(new AuthError("Invalid Email or Password!"));

    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "30m",
      }
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    res.status(200).json({
      message: "Login successful!",
      user: { id: user.id, email: user.email, username: user.name },
    });
  } catch (err) {
    return next(err);
  }
};

export const refreshTokenUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken)
      throw new ValidationError("Unauthorized! No refresh token.");

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: string; role: string };
    if (!decoded || !decoded.id || !decoded.role)
      throw new JsonWebTokenError("Forbidden! Invalid refresh token.");

    // let acc;
    // if (decoded.role === "user")
    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
    });
    if (!user) throw new AuthError("Forbidden! User/Seller not found");

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
    setCookie(res, "access_token", newAccessToken);
    return res.status(201).json({
      success: true,
    });
  } catch (err) {
    return next(err);
  }
};

export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, "user");
};

export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForogtPasswordOtp(req, res, next);
};

export const userResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return next(new ValidationError("Email and new password are required!"));

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new ValidationError("User doesn't exist!"));

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword)
      return next(
        new ValidationError("New password must be different from the old one!")
      );

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message: "Password reset successfully!",
    });
  } catch (err) {
    return next(err);
  }
};

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegisterationData(req.body, "seller");
    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller)
      return next(
        new ValidationError("Seller already exists with this email!")
      );

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    await sendOtp(name, email, "seller-activation");

    res.status(200).json({
      message: "OTP sent to email. please verify yout account.",
    });
  } catch (err) {
    next(err);
  }
};

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;
    if (!email || !otp || !password || !name || !phone_number || !country)
      return next(new ValidationError("All Fields are required!"));

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller)
      return next(new ValidationError("Seller already exist with this email"));

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phone_number,
      },
    });

    res.status(201).json({
      seller,
      message: "Seller registered successfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;
    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !website ||
      !category ||
      !sellerId
    )
      return next(new ValidationError("All fields are required"));
    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };
    if (website && website.trim() !== "") shopData.website = website;
    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop,
    });
  } catch (err) {
    next(err);
  }
};

export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) return next(new ValidationError("Seller ID is required!"));

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
    if (!seller) return next(new ValidationError("Seller not found!"));
    if (!seller.email)
      return next(new ValidationError("Seller email is required for Stripe!"));

    const acc = await stripe.accounts.create({
      type: "express",
      email: seller.email,
      country: "AE", // fallback
      capabilities: {
        // card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: { id: sellerId },
      data: { stripeId: acc.id },
    });

    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const accLink = await stripe.accountLinks.create({
      account: acc.id,
      refresh_url: `${baseUrl}/reauth`,
      return_url: `${baseUrl}/success`,
      type: "account_onboarding",
    });

    return res.json({ url: accLink.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Stripe connection failed",
    });
  }
};

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new ValidationError("Email and Password are required!"));

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) return next(new ValidationError("Invalid email or password!"));

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch)
      return next(new ValidationError("Invalid email or password!"));

    const accessToken = jwt.sign(
      {
        id: seller.id,
        role: "seller",
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      {
        id: seller.id,
        role: "seller",
      },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    setCookie(res, "seller-refresh-token", refreshToken);
    setCookie(res, "seller-access-token", accessToken);

    res.status(200).json({
      message: "Login successful!",
      seller: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (err) {
    next(err);
  }
};

export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(201).json({
      success: true,
      seller,
    });
  } catch (err) {
    next(err);
  }
};
