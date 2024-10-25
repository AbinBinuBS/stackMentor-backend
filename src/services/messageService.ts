import { IMessageRepository } from "../interfaces/message/IMessageRepository";
import { IMessageService } from "../interfaces/message/IMessageService";
import Chat from "../models/chatModel";
import Mentee from "../models/menteeModel";
import { IMessage } from "../models/messageModel";
import MessageRepository from "../repositories/messageRepository";
import { IMessageCombined } from "../types/servicesInterfaces/IMentor";

class MessageService implements IMessageService {
    constructor(private messageRepository: IMessageRepository) {}

    async getAllMessage(chatId: string): Promise<IMessage[]> {
        try {
            return await this.messageRepository.getAllMessage(chatId); 
        } catch (error) {
            console.error("Error in getAllMessage:", error);
            return []; 
        }
    }

    async sendMessage(content: string, chatId: string, senderId: string):Promise<IMessageCombined> {
        const menteeData = await Mentee.findById({_id:senderId})
        
        const chatData  = await Chat.findById({_id:chatId})
        if (!chatData) {
            throw new Error("something unexpected happened")
        }
        if(!menteeData){
            throw new Error("something unexpected happened")
        }
        const mentorId = chatData.mentor
        const newMessageData = {
            sender: senderId,
            reciver:mentorId,
            reciverModel:'MentorVarify',
            senderModel: "Mentee",
            content: content,
            chat: chatId,
        };
        const newNotification ={
            senderName:menteeData.name,
            sender: senderId,
            reciver:mentorId,
            reciverModel:'MentorVarify',
            senderModel: "Mentee", 
            content: content,
            chat: chatId,
        }

        const savedMessage = await this.messageRepository.saveMessage(newMessageData,newNotification);
        const populatedMessage = await this.messageRepository.findMessageById(savedMessage._id);
        
        await Chat.findByIdAndUpdate(chatId, { latestMessage: savedMessage._id });
        return populatedMessage;
    }

}

export default MessageService;
