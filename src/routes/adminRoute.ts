
import { Router } from "express";
import AdminRepository from "../repositories/adminRepository";
import AdminController from "../controllers/adminController";
import AdminService from "../services/adminService";




const router = Router();


const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);


router.post('/login',async(req,res)=>adminController.adminLogin(req,res))
router.post('/getMentor' ,async(req,res)=>adminController.getMentor(req,res))
router.put('/blockMentor',async(req,res)=>adminController.blockMentor(req,res))
router.get('/getMentorDetails', async(req,res)=>adminController.getMentorDetails(req,res))
router.post('/updateMentorStatus' ,async(req,res)=>adminController.updateMentorStatus(req,res))
router.post('/getUser' ,async(req,res)=>adminController.getUsers(req,res))
router.put('/blockUser' ,async(req,res)=>adminController.blockUser(req,res))

export default router