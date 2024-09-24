import Chat from "../models/chatModel";
import { IMessage } from "../models/messageModel";
import MessageRepository from "../repositories/messageRepository";

class MessageService {
    constructor(private messageRepository: MessageRepository) {}

    async getAllMessage(chatId: string): Promise<IMessage[]> {
        try {
            return await this.messageRepository.getAllMessage(chatId); 
        } catch (error) {
            console.error("Error in getAllMessage:", error);
            return []; 
        }
    }

    async sendMessage(content: string, chatId: string, senderId: string) {
        const newMessageData = {
            sender: senderId,
            senderModel: "Mentee",
            content: content,
            chat: chatId,
        };

        const savedMessage = await this.messageRepository.saveMessage(newMessageData);
        const populatedMessage = await this.messageRepository.findMessageById(savedMessage._id);
        
        await Chat.findByIdAndUpdate(chatId, { latestMessage: savedMessage._id });
        
        return populatedMessage;
    }

}

export default MessageService;
