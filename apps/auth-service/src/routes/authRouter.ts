import express, { Router } from "express";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import {
  getUser,
  loginUser,
  refreshTokenUser,
  RegisterUser,
  userForgotPassword,
  userResetPassword,
  verifyUser,
  verifyUserForgotPassword,
} from "../controllers/authController";

const router: Router = express.Router();

router.post("/user-registeration", RegisterUser);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);
router.post("/refresh-token-user", refreshTokenUser);
router.get("/logged-in-user", isAuthenticated, getUser);
router.post("/forgot-password-user", userForgotPassword);
router.post("/reset-password-user", userResetPassword);
router.post("/verify-forgot-password-user", verifyUserForgotPassword);

export default router;
