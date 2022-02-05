import { Router } from "express";
import * as context from "../controllers/context";

const router = Router();

router.get('/contexts', context.get);
router.get('/contexts/:id', context.getById);
router.post('/contexts/create', context.create);
router.get('/variants/:id', context.getVariants);
router.get('/variants', context.getContextVariants);

export default router;