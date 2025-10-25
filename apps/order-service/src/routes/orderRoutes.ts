import express, { Router } from "express";

import isAuthenticated from "packages/middleware/isAuthenticated";
import {
  createOrder,
  createPaymentIntent,
  createPaymentSession,
  verifyPaymentSession,
} from "../controller/orderController";

const router: Router = express.Router();

router.post("/create-payment-intent", isAuthenticated, createPaymentIntent);
router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get("/verifying-payment-session", isAuthenticated, verifyPaymentSession);
router.post("/create-order", isAuthenticated, createOrder);
export default router;
