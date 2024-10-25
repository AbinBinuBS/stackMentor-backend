import { Router } from "express";
import MentorRepository from "../repositories/mentorRepository";
import MentorService from "../services/mentorService";
import MentorController from "../controllers/mentorController";
import {
	multipleUpload,
	singleImageUpload,
	upload,
} from "../middilewares/multerAuth";
import mentorAuthMiddleware from "../middilewares/mentorAuth";

const router = Router();

const mentorRepository = new MentorRepository();
const mentorService = new MentorService(mentorRepository);
const mentorController = new MentorController(mentorService);

router.post("/register", mentorController.mentorRegister.bind(mentorController));
router.post("/verify-otp", mentorController.mentorOtp.bind(mentorController));
router.post("/resend-otp", mentorController.resendOtp.bind(mentorController));
router.post("/login", mentorController.mentorLogin.bind(mentorController));
router.post("/forgot-password", mentorController.resetWithEmail.bind(mentorController));
router.post("/reset-password-verify-otp", mentorController.resetPassswordOtp.bind(mentorController));
router.post("/reset-password-reset", mentorController.resetPasssword.bind(mentorController));
router.get("/checkVerify", mentorController.verifyCheck.bind(mentorController));
router.post("/verify-mentor", multipleUpload, mentorController.verifymentor.bind(mentorController));
router.post("/auth/refresh-token", mentorController.createNewRefreshToken.bind(mentorController));
router.post("/scheduleTime", mentorAuthMiddleware, mentorController.scheduleTimeForMentor.bind(mentorController));
router.get("/getSlots", mentorAuthMiddleware, mentorController.getScheduledSlots.bind(mentorController));
router.delete("/deleteSlot/:id", mentorAuthMiddleware, mentorController.deleteScheduledSlot.bind(mentorController));
router.get("/getBookedSlots", mentorAuthMiddleware, mentorController.getBookedSlots.bind(mentorController));
router.get("/getMentorData", mentorAuthMiddleware, mentorController.getMentorData.bind(mentorController));
router.put("/editProfile",mentorAuthMiddleware,singleImageUpload, mentorController.editProfile.bind(mentorController));
router.put("/changePassword", mentorAuthMiddleware, mentorController.changePassword.bind(mentorController));
router.put("/cancelSlot", mentorAuthMiddleware, mentorController.cancelSlot.bind(mentorController));
router.post("/allowConnection", mentorAuthMiddleware, mentorController.allowConnection.bind(mentorController));
router.post("/endConnection", mentorAuthMiddleware, mentorController.endConnection.bind(mentorController));
router.get("/getAllQuestions", mentorAuthMiddleware, mentorController.getAllQuestions.bind(mentorController));
router.post("/submitAnswer", mentorAuthMiddleware, mentorController.submitQAAnswer.bind(mentorController));
router.put("/editAnswer", mentorAuthMiddleware, mentorController.editQAAnswer.bind(mentorController));
router.post("/createComminityMeet",mentorAuthMiddleware,singleImageUpload, mentorController.createComminityMeet.bind(mentorController));
router.get("/getAllCommunityMeet", mentorAuthMiddleware, mentorController.getAllCommunityMeet.bind(mentorController));
router.get("/getMyCommunityMeet", mentorAuthMiddleware, mentorController.getMyCommunityMeet.bind(mentorController));
router.put("/cancelCommunityMeet/:meetId",mentorAuthMiddleware, mentorController.cancelCommunityMeet.bind(mentorController));
router.get("/getRatings", mentorAuthMiddleware, mentorController.getMentorRating.bind(mentorController));
router.get("/getNotifications", mentorAuthMiddleware, mentorController.getNotifications.bind(mentorController));
router.put("/readChat/:id", mentorAuthMiddleware, mentorController.markReadChat.bind(mentorController));


export default router;
