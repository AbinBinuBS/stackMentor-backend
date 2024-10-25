import { Router } from "express";
import MenteeRepository from "../repositories/menteeRepository";
import MenteeService from "../services/menteeService";
import MenteeController from "../controllers/menteeController";
import menteeAuthMiddleware from "../middilewares/userAuth";
import PaymentRepository from "../repositories/paymentRepository";
import PaymentService from "../services/paymentService";
import PaymentController from "../controllers/paymentController";

const router = Router();

const menteeRepository = new MenteeRepository();
const menteeService = new MenteeService(menteeRepository);
const menteeController = new MenteeController(menteeService);


const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(paymentRepository);
const paymentController = new PaymentController(paymentService);

router.post("/register",menteeController.menteeRegister.bind(menteeController));
router.post("/googleRegister",menteeController.googleRegister.bind(menteeController));
router.post("/login",menteeController.menteeLogin.bind(menteeController));
router.post("/checkMail",menteeController.checkMenteeMail.bind(menteeController));
router.post("/verify-otp",menteeController.menteeOtp.bind(menteeController));
router.post("/resend-otp",menteeController.resendOtp.bind(menteeController));
router.post("/forgot-password",menteeController.resetWithEmail.bind(menteeController));
router.post("/reset-password-verify-otp",menteeController.resetPassswordOtp.bind(menteeController));
router.post("/reset-password-reset",menteeController.resetPasssword.bind(menteeController));
router.get("/getMentors", menteeAuthMiddleware,menteeController.getMentorData.bind(menteeController));
router.get("/getMentorData/:id",menteeController.getMentorSlots.bind(menteeController));
router.get("/getBookedSlots", menteeAuthMiddleware,menteeController.getBookedSlots.bind(menteeController));
router.get("/availableSlots/:id/:price",menteeAuthMiddleware,menteeController.getResheduleList.bind(menteeController));
router.post("/rescheduleBooking",menteeController.rescheduleBooking.bind(menteeController));
router.get("/getMenteeData", menteeAuthMiddleware,menteeController.getMenteeData.bind(menteeController));
router.get("/getWalletData", menteeAuthMiddleware,menteeController.getWalletData.bind(menteeController));
router.put("/cancelSlot", menteeAuthMiddleware,menteeController.cancelSlot.bind(menteeController));
router.post("/qaQuestion", menteeAuthMiddleware,menteeController.qaQuestion.bind(menteeController));
router.get("/getAllQuestions", menteeAuthMiddleware,menteeController.getAllQuestions.bind(menteeController));
router.get("/getMeets", menteeAuthMiddleware,menteeController.getMeets.bind(menteeController));
router.post("/checkAvailable",menteeController.checkIsBooked.bind(menteeController));
router.post("/getMenteeDetails",menteeAuthMiddleware,menteeController.getMenteeDetails.bind(menteeController));
router.put("/updateProfile",menteeAuthMiddleware,menteeController.editProfile.bind(menteeController));
router.post("/auth/refresh-token",menteeController.createNewRefreshToken.bind(menteeController));
router.put("/changePassword",menteeAuthMiddleware,menteeController.changePassword.bind(menteeController));
router.post("/review", menteeAuthMiddleware,menteeController.addReview.bind(menteeController));
router.get("/getNotifications", menteeAuthMiddleware,menteeController.getNotifications.bind(menteeController));
router.put("/readChat/:id", menteeAuthMiddleware,menteeController.markReadChat.bind(menteeController));

router.post("/menteePayment",paymentController.paymentMethod.bind(paymentController));
router.post("/proceedPayment",paymentController.proceedPayment.bind(paymentController));
router.post("/payUsingWallet", menteeAuthMiddleware,paymentController.walletPayment.bind(paymentController));


export default router;
