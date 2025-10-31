import prisma from "packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["access_token"] ||
      req.cookies["seller-access-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Unauthorized! Token missing." });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: "user" | "seller" | "admin";
    };

    if (!decoded)
      return res.status(401).json({ message: "Unauthorized! Invalid Token." });

    const { id, role } = decoded;
    req.role = role;

    if (role === "user") {
      const user = await prisma.users.findUnique({ where: { id } });
      if (!user) return res.status(401).json({ message: "Account not found!" });

      if (user.isBanned) {
        return res.status(403).json({
          message: "Access denied: This user account has been banned.",
          bannedAt: user.bannedAt,
          reason: user.banReason,
        });
      }

      req.user = user;
      return next();
    }

    if (role === "admin") {
      const admin = await prisma.users.findUnique({ where: { id } });
      if (!admin)
        return res.status(401).json({ message: "Admin account not found!" });

      if (admin.isBanned) {
        return res.status(403).json({
          message: "Access denied: This admin account has been banned.",
          bannedAt: admin.bannedAt,
          reason: admin.banReason,
        });
      }

      req.admin = admin;
      return next();
    }

    if (role === "seller") {
      const seller = await prisma.sellers.findUnique({
        where: { id },
        include: { shop: true },
      });
      if (!seller)
        return res.status(401).json({ message: "Seller account not found!" });

      const blocked = await prisma.blocked_seller_emails.findUnique({
        where: { email: seller.email },
      });

      if (blocked) {
        return res.status(403).json({
          message: "Access denied: This seller account has been blocked.",
          reason: blocked.reason,
          blockedAt: blocked.createdAt,
        });
      }

      req.seller = seller;
      return next();
    }

    return res.status(401).json({ message: "Invalid role!" });
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized! Token invalid or expired.",
    });
  }
};

export default isAuthenticated;
