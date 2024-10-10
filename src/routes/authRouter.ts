import { Router } from "express";
import passportAuth from "../config/passport";
import {
	googleAuth,
	googleAuthCallback,
	authSuccess,
	authFailure,
} from "../controllers/authController";

const router: Router = Router();

router.get("/", googleAuth);
router.get("/callback", googleAuthCallback);
router.get("/callback/success", authSuccess);
router.get("/callback/failure", authFailure);

export default router;
