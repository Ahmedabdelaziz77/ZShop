import express, { Router } from "express";
import {
  addNewAdmin,
  banUser,
  getAllCustomizations,
  getAllEvents,
  getAllProducts,
  getAllSellers,
  getAllUsers,
  unbanUser,
} from "../controllers/adminController";
import isAuthenticated from "packages/middleware/isAuthenticated";
import { isAdmin } from "packages/middleware/authorizeRoles";

const router: Router = express.Router();

router.get("/get-all-products", isAuthenticated, isAdmin, getAllProducts);
router.get("/get-all-events", isAuthenticated, isAdmin, getAllEvents);
router.get("/get-all-sellers", isAuthenticated, isAdmin, getAllSellers);
router.get("/get-all-users", isAuthenticated, isAdmin, getAllUsers);
router.put("/add-new-admin", isAuthenticated, isAdmin, addNewAdmin);

router.get("/get-all", getAllCustomizations);

router.put("/ban-user/:id", isAuthenticated, isAdmin, banUser);
router.put("/unban-user/:id", isAuthenticated, isAdmin, unbanUser);

export default router;
