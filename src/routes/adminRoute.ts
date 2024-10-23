import { Router } from "express";
import AdminRepository from "../repositories/adminRepository";
import AdminController from "../controllers/adminController";
import AdminService from "../services/adminService";
import adminAuthMiddleware from "../middilewares/adminAuth";

const router = Router();

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

router.post("/login", adminController.adminLogin.bind(adminController));
router.post("/getMentor", adminController.getMentor.bind(adminController));
router.put("/blockMentor", adminAuthMiddleware,adminController.blockMentor.bind(adminController));
router.get("/getMentorDetails", adminAuthMiddleware,adminController.getMentorDetails.bind(adminController));
router.post("/updateMentorStatus", adminAuthMiddleware,adminController.updateMentorStatus.bind(adminController));
router.post("/getUser", adminAuthMiddleware,adminController.getUsers.bind(adminController));
router.put("/blockUser", adminAuthMiddleware,adminController.blockUser.bind(adminController));
router.get("/getgraphData", adminAuthMiddleware, adminController.getgraphData.bind(adminController));
router.get("/getAllQuestions", adminAuthMiddleware, adminController.getAllQuestions.bind(adminController));
router.put("/editAnswer", adminAuthMiddleware,adminController.editQAAnswer.bind(adminController));
router.delete("/removeQuestion/:id", adminAuthMiddleware,adminController.removeQuestion.bind(adminController));
router.get("/getMeets", adminAuthMiddleware, adminController.getMeets.bind(adminController));

export default router;
