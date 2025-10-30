import express, { Router } from "express";

import { isSeller } from "packages/middleware/authorizeRoles";
import isAuthenticated from "packages/middleware/isAuthenticated";
import {
  deleteSeller,
  getShopDeletionState,
  getShopSettings,
  getStripeAccount,
  restoreSeller,
  updateShopSettings,
} from "../controllers/sellerController";

const router: Router = express.Router();

router.get("/get-shop-settings", isAuthenticated, isSeller, getShopSettings);
router.put(
  "/update-shop-settings",
  isAuthenticated,
  isSeller,
  updateShopSettings
);
router.delete("/delete-shop", isAuthenticated, isSeller, deleteSeller);
router.get(
  "/get-shop-deletion-state",
  isAuthenticated,
  isSeller,
  getShopDeletionState
);
router.put("/restore-shop", isAuthenticated, isSeller, restoreSeller);

router.get("/get-stripe-account", isAuthenticated, getStripeAccount);

export default router;
