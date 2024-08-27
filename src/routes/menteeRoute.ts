import { Router } from 'express';
import MenteeRepository from '../repositories/menteeRepository';
import MenteeService from '../services/menteeService';
import MenteeController from '../controllers/menteeController';
import MentorController from '../controllers/mentorController';

const router = Router();


const menteeRepository = new MenteeRepository();
const menteeService = new MenteeService(menteeRepository);
const menteeController = new MenteeController(menteeService);

router.post('/register', async (req, res) => menteeController.menteeRegister(req, res));
router.post('/login',async (req,res)=>menteeController.menteeLogin(req,res));
router.post('/verify-otp',async(req,res)=>menteeController.menteeOtp(req,res))
router.post('/resend-otp',async (req,res)=>menteeController.resendOtp(req,res))
router.post('/forgot-password',async(req,res)=>menteeController.resetWithEmail(req,res))
router.post('/reset-password-verify-otp', async(req,res)=>menteeController.resetPassswordOtp(req,res))
router.post('/reset-password-reset',async(req,res)=>menteeController.resetPasssword(req,res))
router.get('/getMentors',async(req,res)=>menteeController.getMentorData(req,res))
router.get('/getMentorData/:id',async(req,res)=>menteeController.getMentorSlots(req,res))

export default router;

