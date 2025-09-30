import express, { Router } from "express";
import {
  getCategories,
  createDiscountCodes,
  getDiscountCodes,
  deleteDiscountCodes,
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

export default router;
