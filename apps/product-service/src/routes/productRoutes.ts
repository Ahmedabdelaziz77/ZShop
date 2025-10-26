import express, { Router } from "express";
import {
  getCategories,
  createDiscountCodes,
  getDiscountCodes,
  deleteDiscountCodes,
  uploadProductImage,
  deleteProductImage,
  createProduct,
  getShopProducts,
  deleteProduct,
  restoreProduct,
  getAllProducts,
  getProductDetails,
  getFilteredProducts,
  getFilteredEvents,
  getFilteredShops,
  searchProducts,
  getTopShops,
  getAllEvents,
  createEvent,
  getShopEvents,
} from "../controllers/productController";
import isAuthenticated from "packages/middleware/isAuthenticated";
import { isSeller } from "packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCodes);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete(
  "/delete-discount-code/:id",
  isAuthenticated,
  deleteDiscountCodes
);

router.post("/upload-product-image", isAuthenticated, uploadProductImage);
router.delete("/delete-product-image", isAuthenticated, deleteProductImage);

router.post("/create-product", isAuthenticated, isSeller, createProduct);
router.post("/create-event", isAuthenticated, isSeller, createEvent);
router.get("/get-shop-products", isAuthenticated, getShopProducts);
router.get("/get-shop-events", isAuthenticated, getShopEvents);
router.delete("/delete-product/:productId", isAuthenticated, deleteProduct);
router.put("/restore-product/:productId", isAuthenticated, restoreProduct);

router.get("/get-all-products", getAllProducts);
router.get("/get-all-events", getAllEvents);
router.get("/get-product/:slug", getProductDetails);
router.get("/get-filtered-products", getFilteredProducts);

router.get("/get-filtered-offers", getFilteredEvents);
router.get("/get-filtered-shops", getFilteredShops);
router.get("/search-products", searchProducts);
router.get("/top-shops", getTopShops);

export default router;
