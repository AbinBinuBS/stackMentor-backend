import { Router } from "express";
import MenteeRepository from "../repositories/menteeRepository";
import MenteeService from "../services/menteeService";
import MenteeController from "../controllers/menteeController";
import menteeAuthMiddleware from "../middilewares/userAuth";

const router = Router();

const menteeRepository = new MenteeRepository();
const menteeService = new MenteeService(menteeRepository);
const menteeController = new MenteeController(menteeService);

router.post("/register", async (req, res) =>
	menteeController.menteeRegister(req, res)
);
router.post("/googleRegister", async (req, res) =>
	menteeController.googleRegister(req, res)
);
router.post("/login", async (req, res) =>
	menteeController.menteeLogin(req, res)
);
router.post("/checkMail", async (req, res) =>
	menteeController.checkMenteeMail(req, res)
);
router.post("/verify-otp", async (req, res) =>
	menteeController.menteeOtp(req, res)
);
router.post("/resend-otp", async (req, res) =>
	menteeController.resendOtp(req, res)
);
router.post("/forgot-password", async (req, res) =>
	menteeController.resetWithEmail(req, res)
);
router.post("/reset-password-verify-otp", async (req, res) =>
	menteeController.resetPassswordOtp(req, res)
);
router.post("/reset-password-reset", async (req, res) =>
	menteeController.resetPasssword(req, res)
);
router.get("/getMentors", menteeAuthMiddleware, async (req, res) =>
	menteeController.getMentorData(req, res)
);
router.get("/getMentorData/:id", async (req, res) =>
	menteeController.getMentorSlots(req, res)
);
router.get("/getBookedSlots", menteeAuthMiddleware, async (req, res) =>
	menteeController.getBookedSlots(req, res)
);
router.get(
	"/availableSlots/:id/:price",
	menteeAuthMiddleware,
	async (req, res) => menteeController.getResheduleList(req, res)
);
router.post("/rescheduleBooking", async (req, res) =>
	menteeController.rescheduleBooking(req, res)
);
router.get("/getMenteeData", menteeAuthMiddleware, async (req, res) =>
	menteeController.getMenteeData(req, res)
);
router.get("/getWalletData", menteeAuthMiddleware, async (req, res) =>
	menteeController.getWalletData(req, res)
);
router.put("/cancelSlot", menteeAuthMiddleware, async (req, res) =>
	menteeController.cancelSlot(req, res)
);
router.post("/qaQuestion", menteeAuthMiddleware, async (req, res) =>
	menteeController.qaQuestion(req, res)
);
router.get("/getAllQuestions", menteeAuthMiddleware, async (req, res) =>
	menteeController.getAllQuestions(req, res)
);
router.get("/getMeets", menteeAuthMiddleware, async (req, res) =>
	menteeController.getMeets(req, res)
);

router.post("/checkAvailable", async (req, res) =>
	menteeController.checkIsBooked(req, res)
);
router.post("/menteePayment", async (req, res) =>
	menteeController.paymentMethod(req, res)
);
router.post("/payUsingWallet", menteeAuthMiddleware, async (req, res) =>
	menteeController.walletPayment(req, res)
);

export default router;
