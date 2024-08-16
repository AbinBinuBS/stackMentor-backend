import { Router } from "express";
import MentorRepository from "../repositories/mentorRepository";
import MentorService from "../services/mentorService";
import MentorController from "../controllers/mentorController";
import { multipleUpload } from "../middilewares/multerAuth";

const router = Router();

const mentorRepository = new MentorRepository();
const mentorService = new MentorService(mentorRepository);
const mentorController = new MentorController(mentorService);


router.post('/register',async (req, res) => mentorController.mentorRegister(req, res));
router.post('/verify-otp', async (req, res) => mentorController.mentorOtp(req, res));
router.post('/resend-otp', async (req, res) => mentorController.resendOtp(req, res));
router.post('/login', async (req, res) => mentorController.mentorLogin(req, res));
router.post('/verify-mentor',multipleUpload,async(req,res)=> mentorController.verifymentor(req,res));




export default router;