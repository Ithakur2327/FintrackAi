import express from "express";
import { getAIInsights, askAIQuestion } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(protect);
router.get("/insights", getAIInsights);
router.post("/ask", askAIQuestion);
export default router;
