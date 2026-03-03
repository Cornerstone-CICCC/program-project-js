import express from "express";
const router = express.Router();

router.post("/generate", (req, res) => res.send("recipe generate"));

export default router;
