import express from "express";
import { setBudget, getBudgets, deleteBudget } from "../controllers/budgetController.js";
import protect from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(protect);
router.post("/set", setBudget);
router.get("/get", getBudgets);
router.delete("/:id", deleteBudget);
export default router;
