import { Request, Response } from "express";
import MessageService from "../services/messageService";
import Message from "../models/messageModel";
import MentorVerifyModel from "../models/mentorValidate";
import Chat from "../models/chatModel";
import NotificationModel from "../models/notificationModel";
import { IMessageService } from "../interfaces/message/IMessageService";

class MessageController {
	constructor(private messageService: IMessageService) {}

	async getAllMessage(req: Request, res: Response): Promise<void> {
		try {
			const chatId = req.params.chatId
			const messages = await this.messageService.getAllMessage(chatId)
			res.json(messages);
		} catch (error) {
			console.error("Error in getAllMessage:", error);
			res.status(500).json({ message: "Internal Server Error" });
		}
	}

	async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { content, chatId } = req.body;
            const mentee = (req as any).mentee;

            if (!content || !chatId) {
                res.status(400).json({ error: "Invalid data. Content and chatId are required." });
                return;
            }
            const populatedMessage = await this.messageService.sendMessage(content, chatId, mentee.id);
            if (!populatedMessage) {
                res.status(404).json({ error: "Message not found after saving" });
                return;
            }

            res.status(201).json(populatedMessage);
        } catch (error) {
            console.error("Error in sendMessage: ", error);
            res.status(500).json({ error: "An error occurred while sending the message" });
        }
    }

	async mentorSendMessage(req: Request, res: Response): Promise<void> {
    try {
        const { content, chatId } = req.body;
        const mentor = (req as any).mentor; 
		const mentorId = mentor.id

		const mentorVerification = await MentorVerifyModel.findOne({ mentorId }).populate('mentorId');
        if (!content || !chatId) {
            console.log("Invalid data passed into request");
            res.status(400).json({ error: "Invalid data. Content and chatId are required." });
            return;
        }

        const chatData  = await Chat.findById({_id:chatId})
        if (!chatData) {
            console.log("Invalid data passed into request");
            res.status(400).json({ error: "Invalid data. Content and chatId are required." });
            return;
        }
        const menteeId = chatData.mentee
        const newMessage = new Message({
            sender: mentorVerification?._id,
            reciver:menteeId,
            reciverModel:'Mentee',
            senderModel: "MentorVarify", 
            content: content,
            chat: chatId,
        });
        const newNotification = new NotificationModel({
            senderName:mentorVerification?.name,
            sender: mentorVerification?._id,
            reciver:menteeId,
            reciverModel:'Mentee',
            senderModel: "MentorVarify", 
            content: content,
            chat: chatId,
        });
        await newNotification.save()
        let savedMessage = await newMessage.save();

        let populatedMessage = await Message.findById(savedMessage._id)
            .populate("sender", "name pic email")
            .populate("chat");

        if (!populatedMessage) {
            res.status(404).json({ error: "Message not found after saving" });
            return;
        }

        await Chat.findByIdAndUpdate(chatId, { latestMessage: savedMessage._id });

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Error in sendMessage: ", error);
        res.status(500).json({ error: "An error occurred while sending the message" });
    }
}

}

export default MessageController;
