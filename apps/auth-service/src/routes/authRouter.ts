import express, { Router } from "express";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import {
  isAdmin,
  isSeller,
  isUser,
} from "../../../../packages/middleware/authorizeRoles";
import {
  addUserAddress,
  createShop,
  createStripeConnectLink,
  deleteUserAddress,
  getAdmin,
  getSeller,
  getUser,
  getUserAddresses,
  loginAdmin,
  loginSeller,
  loginUser,
  logout,
  refreshToken,
  registerSeller,
  RegisterUser,
  updateUserPassword,
  userForgotPassword,
  userResetPassword,
  verifySeller,
  verifyUser,
  verifyUserForgotPassword,
} from "../controllers/authController";

const router: Router = express.Router();

router.post("/user-registeration", RegisterUser);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token", refreshToken);
router.get("/logged-in-user", isAuthenticated, isUser, getUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/reset-password-user", userResetPassword);
router.post("/verify-forgot-password-user", verifyUserForgotPassword);

router.post("/seller-registeration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);
router.post("/create-stripe-link", createStripeConnectLink);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);

router.get("/shipping-addresses", isAuthenticated, getUserAddresses);
router.post("/add-address", isAuthenticated, addUserAddress);
router.delete("/delete-address/:addressId", isAuthenticated, deleteUserAddress);

router.post("/change-password", isAuthenticated, updateUserPassword);

router.post("/login-admin", loginAdmin);
router.get("/logged-in-admin", isAuthenticated, isAdmin, getAdmin);

router.get("/logout", isAuthenticated, logout);

export default router;
