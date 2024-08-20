import { Router } from "express";
import MentorRepository from "../repositories/mentorRepository";
import MentorService from "../services/mentorService";
import MentorController from "../controllers/mentorController";
import { multipleUpload, upload } from "../middilewares/multerAuth";
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
router.get('/checkVerify',mentorAuthMiddleware ,async (req,res)=>mentorController.verifyCheck(req,res))
router.post('/verify-mentor',multipleUpload,async(req,res)=> mentorController.verifymentor(req,res));
router.post('/auth/refresh-token',async (req,res)=>mentorController.createNewRefreshToken(req,res))
router.post('/scheduleTime',mentorAuthMiddleware,upload.single('image'), async (req, res) => mentorController.scheduleTimeForMentor(req, res));
router.get('/getSlots',mentorAuthMiddleware ,async (req,res)=>mentorController.getScheduledSlots(req,res))
router.delete('/deleteSlot/:id',mentorAuthMiddleware ,async (req,res)=>mentorController.deleteScheduledSlot(req,res))



export default router;