
import { Router } from "express";
import AdminRepository from "../repositories/adminRepository";
import AdminController from "../controllers/adminController";
import AdminService from "../services/adminService";




const router = Router();


const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);


router.post('/login',async(req,res)=>adminController.adminLogin(req,res))

export default router