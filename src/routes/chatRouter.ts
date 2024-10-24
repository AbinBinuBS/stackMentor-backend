import { Router } from "express";
import ChatRepository from "../repositories/chatRepository";
import ChatService from "../services/chatService";
import ChatController from "../controllers/chatController";
import menteeAuthMiddleware from "../middilewares/userAuth";
import mentorAuthMiddleware from "../middilewares/mentorAuth";

const router = Router();

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

router.post("/mentee",menteeAuthMiddleware,chatController.menteeConnectChat.bind(chatController));

router.post("/mentor",mentorAuthMiddleware,chatController.mentorConnectChat.bind(chatController));

export default router;
