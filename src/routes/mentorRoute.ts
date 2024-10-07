import { Router } from "express";
import MentorRepository from "../repositories/mentorRepository";
import MentorService from "../services/mentorService";
import MentorController from "../controllers/mentorController";
import { multipleUpload, singleImageUpload, upload } from "../middilewares/multerAuth";
import mentorAuthMiddleware from "../middilewares/mentorAuth";

const router = Router();

const mentorRepository = new MentorRepository();
const mentorService = new MentorService(mentorRepository);
const mentorController = new MentorController(mentorService);

router.post('/register',async (req, res) => mentorController.mentorRegister(req, res));
router.post('/verify-otp', async (req, res) => mentorController.mentorOtp(req, res));
router.post('/resend-otp', async (req, res) => mentorController.resendOtp(req, res));
router.post('/login', async (req, res) => mentorController.mentorLogin(req, res));
router.post('/forgot-password',async(req,res)=>mentorController.resetWithEmail(req,res))
router.post('/reset-password-verify-otp', async(req,res)=>mentorController.resetPassswordOtp(req,res))
router.post('/reset-password-reset',async(req,res)=>mentorController.resetPasssword(req,res))
router.get('/checkVerify' ,async (req,res)=>mentorController.verifyCheck(req,res))
router.post('/verify-mentor',multipleUpload,async(req,res)=> mentorController.verifymentor(req,res));
router.post('/auth/refresh-token',async (req,res)=>mentorController.createNewRefreshToken(req,res))
router.post('/scheduleTime',mentorAuthMiddleware, async (req, res) => mentorController.scheduleTimeForMentor(req, res));
router.get('/getSlots',mentorAuthMiddleware ,async (req,res)=>mentorController.getScheduledSlots(req,res))
router.delete('/deleteSlot/:id',mentorAuthMiddleware ,async (req,res)=>mentorController.deleteScheduledSlot(req,res))
router.get('/getBookedSlots',mentorAuthMiddleware ,async (req,res)=>mentorController.getBookedSlots(req,res))
router.get('/getMentorData',mentorAuthMiddleware ,async (req,res)=>mentorController.getMentorData(req,res))
router.put('/editProfile',mentorAuthMiddleware,singleImageUpload,async(req,res)=>mentorController.editProfile(req,res))
router.put('/changePassword',mentorAuthMiddleware,async(req,res)=>mentorController.changePassword(req,res))
router.put('/cancelSlot',mentorAuthMiddleware,async(req,res)=>mentorController.cancelSlot(req,res))
router.post('/allowConnection',mentorAuthMiddleware,async(req,res)=>mentorController.allowConnection(req,res))
router.post('/endConnection',mentorAuthMiddleware,async(req,res)=>mentorController.endConnection(req,res))
router.get('/getAllQuestions',mentorAuthMiddleware,async(req,res)=>mentorController.getAllQuestions(req,res))
router.post('/submitAnswer',mentorAuthMiddleware,async(req,res)=>mentorController.submitQAAnswer(req,res))
router.put('/editAnswer',mentorAuthMiddleware,async(req,res)=>mentorController.editQAAnswer(req,res))
router.post('/createComminityMeet',mentorAuthMiddleware,singleImageUpload,async(req,res)=>mentorController.createComminityMeet(req,res))
router.get('/getAllCommunityMeet',mentorAuthMiddleware ,async (req,res)=>mentorController.getAllCommunityMeet(req,res))
router.get('/getMyCommunityMeet',mentorAuthMiddleware ,async (req,res)=>mentorController.getMyCommunityMeet(req,res))
router.put('/cancelCommunityMeet/:meetId',mentorAuthMiddleware ,async (req,res)=>mentorController.cancelCommunityMeet(req,res))








export default router;