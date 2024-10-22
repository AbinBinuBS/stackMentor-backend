import { Router } from "express";
import AdminRepository from "../repositories/adminRepository";
import AdminController from "../controllers/adminController";
import AdminService from "../services/adminService";
import adminAuthMiddleware from "../middilewares/adminAuth";

const router = Router();

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

router.post("/login", async (req, res) => adminController.adminLogin(req, res));
router.post("/getMentor", async (req, res) =>
	adminController.getMentor(req, res)
);
router.put("/blockMentor", adminAuthMiddleware, async (req, res) =>
	adminController.blockMentor(req, res)
);
router.get("/getMentorDetails", adminAuthMiddleware, async (req, res) =>
	adminController.getMentorDetails(req, res)
);
router.post("/updateMentorStatus", adminAuthMiddleware, async (req, res) =>
	adminController.updateMentorStatus(req, res)
);
router.post("/getUser", adminAuthMiddleware, async (req, res) =>
	adminController.getUsers(req, res)
);
router.put("/blockUser", adminAuthMiddleware, async (req, res) =>
	adminController.blockUser(req, res)
);
router.get("/getgraphData", adminAuthMiddleware, async (req, res) =>
	adminController.getgraphData(req, res)
);
router.post("/auth/refresh-token", async (req, res) =>
	adminController.createNewRefreshToken(req, res)
);
router.get("/getAllQuestions", adminAuthMiddleware, async (req, res) =>
	adminController.getAllQuestions(req, res)
);
router.put("/editAnswer", adminAuthMiddleware, async (req, res) =>
	adminController.editQAAnswer(req, res)
);
router.delete("/removeQuestion/:id", adminAuthMiddleware, async (req, res) =>
	adminController.removeQuestion(req, res)
);
router.get("/getMeets", adminAuthMiddleware, async (req, res) =>
	adminController.getMeets(req, res)
);

export default router;
