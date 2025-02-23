import express from "express";
import { analyzePDFs,getQuestions,upload } from "../controller/extract.js";
const router = express.Router();
router.post("/analyze",upload.array('pdfs'),analyzePDFs);
router.get("/questions",getQuestions)
export default router;