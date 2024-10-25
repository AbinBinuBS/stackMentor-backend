import { IMessageRepository } from "../interfaces/message/IMessageRepository";
import Chat from "../models/chatModel";
import Mentee, { IMentee } from "../models/menteeModel";
import MentorVerifyModel from "../models/mentorValidate";
import Message, { IMessage } from "../models/messageModel";
import NotificationModel from "../models/notificationModel";


class MessageRepository implements IMessageRepository {
    async getAllMessage(chatId: string): Promise<IMessage[]> {
        try {
            const messages = await Message.find({ chat: chatId })
                .populate("sender", "name pic email")
                .populate("chat");
            return messages as IMessage[]; 
        } catch (error) {
            console.error("Error in getAllMessage:", error);
            return []; 
        }
    }

    async saveMessage(messageData: any,newNotification:any): Promise<any> {
        const newMessage = new Message(messageData);
         const newNOtifications = new NotificationModel(newNotification)
         await newNOtifications.save()
        return await newMessage.save();
    }

    async findMessageById(messageId: string): Promise<any> {
        return await Message.findById(messageId)
            .populate("sender", "name pic email")
            .populate("chat");
    }
    
}

export default MessageRepository





