import { Router } from "express";
import * as home from "../controllers/home";
import * as conference from "../controllers/conference";
import * as user from "../controllers/user";
import * as post from "../controllers/post";

const router = Router();

router.get('/', home.index);

router.get('/conferences', conference.get);
router.get('/conferences/invitations', conference.getWithInvitations);
router.get('/conferences/:id', conference.getById);
router.post('/conferences', conference.post);
router.post('/conferences/invite', conference.invite);
router.post('/conferences/withdraw', conference.withdraw);
router.post('/conferences/attend', conference.attend);
router.post('/conferences/absend', conference.absend);

router.get('/users/:namespace/:username', user.getById);
router.get('/users/badge/:namespace/:username', user.getBadge);
router.get('/users/stat', user.getStat);
router.put('/users', user.put);
router.post('/users', user.post);

router.get('/posts', post.get);
router.get('/posts/details', post.getDetailed);
router.get('/posts/invitations', post.getWithInvitations);
router.get('/posts/stat', post.getStat);

export default router;