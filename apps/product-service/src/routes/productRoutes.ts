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
} from "../controllers/productController";
import isAuthenticated from "packages/middleware/isAuthenticated";

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

router.post("/create-product", isAuthenticated, createProduct);
router.get("/get-shop-products", isAuthenticated, getShopProducts);
router.delete("/delete-product/:productId", isAuthenticated, deleteProduct);
router.put("/restore-product/:productId", isAuthenticated, restoreProduct);
export default router;
