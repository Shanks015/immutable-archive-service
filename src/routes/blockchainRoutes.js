import express from "express";
import { retreiveAll, retreiveById, upload } from "../controllers/blockchainnController.js";

const router = express.Router();

router.post("/blockchain/registry", upload);
router.post("/blockchain/registry/access-log", retreiveById);
router.get("/blockchain/registry/user/:userAddress", retreiveAll);
//
export default router;
