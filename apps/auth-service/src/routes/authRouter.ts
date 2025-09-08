import express, { Router } from "express";
import { userRegister } from "../controllers/authController";

const router: Router = express.Router();

router.post("/user-registeration", userRegister);

export default router;
