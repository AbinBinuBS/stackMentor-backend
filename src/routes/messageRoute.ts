import { Router } from 'express'
import MessageRepository from '../repositories/messageRepository';
import MessageService from '../services/messageService';
import MessageController from '../controllers/messageController';
import menteeAuthMiddleware from '../middilewares/userAuth';
import mentorAuthMiddleware from '../middilewares/mentorAuth';


const router = Router()

const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService);


router.get('/:chatId', async(req,res)=>messageController.getAllMessage(req,res))
router.post('/',menteeAuthMiddleware,async(req,res)=>messageController.sendMessage(req,res))
router.post('/mentor',mentorAuthMiddleware,async(req,res)=>messageController.mentorSendMessage(req,res))





export default router
