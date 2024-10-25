import { Router } from "express";
import MessageRepository from "../repositories/messageRepository";
import MessageService from "../services/messageService";
import MessageController from "../controllers/messageController";
import menteeAuthMiddleware from "../middilewares/userAuth";
import mentorAuthMiddleware from "../middilewares/mentorAuth";

const router = Router();

const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService);

router.get("/:chatId", messageController.getAllMessage.bind(messageController));
router.post("/", menteeAuthMiddleware, messageController.sendMessage.bind(messageController));
router.post("/mentor", mentorAuthMiddleware, messageController.mentorSendMessage.bind(messageController));

export default router;
