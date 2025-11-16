import express, { Router } from "express";

import { isSeller } from "packages/middleware/authorizeRoles";
import isAuthenticated from "packages/middleware/isAuthenticated";
import {
  deleteSeller,
  followShop,
  getSeller,
  getSellerEvents,
  getSellerProducts,
  getShopDeletionState,
  getShopSettings,
  getStripeAccount,
  isFollowingShop,
  markNotificationAsRead,
  restoreSeller,
  sellerNotifications,
  unfollowShop,
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

router.get("/get-seller-products/:shopId", getSellerProducts);
router.get("/get-seller-events/:shopId", getSellerEvents);
router.get("/is-following/:shopId", isAuthenticated, isFollowingShop);
router.post("/follow-shop", isAuthenticated, followShop);
router.post("/unfollow-shop", isAuthenticated, unfollowShop);
router.get("/get-seller/:id", getSeller);

router.get(
  "/seller-notifications",
  isAuthenticated,
  isSeller,
  sellerNotifications
);
router.post(
  "/mark-notification-as-read",
  isAuthenticated,
  markNotificationAsRead
);

export default router;
