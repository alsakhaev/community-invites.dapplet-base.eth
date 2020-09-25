import { Router } from "express";
import * as home from "../controllers/home";
import * as conference from "../controllers/conference";
//import multer from "multer";

//const upload = multer();
const router = Router();

router.get('/', home.index);

router.get('/conferences', conference.get);
router.get('/conferences/participants', conference.getWithParticipants);
router.get('/conferences/:id', conference.getById);
router.post('/conferences', conference.post);
router.post('/conferences/invite', conference.invite);
router.post('/conferences/withdraw', conference.withdraw);
router.post('/conferences/attend', conference.attend);
router.post('/conferences/absend', conference.absend);

export default router;