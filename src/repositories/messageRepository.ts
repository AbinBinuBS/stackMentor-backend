import Chat from "../models/chatModel";
import MentorVerifyModel from "../models/mentorValidate";
import Message, { IMessage } from "../models/messageModel";


class MessageRepository {
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

    async saveMessage(messageData: any): Promise<any> {
        const newMessage = new Message(messageData);
        return await newMessage.save();
    }

    async findMessageById(messageId: string): Promise<any> {
        return await Message.findById(messageId)
            .populate("sender", "name pic email")
            .populate("chat");
    }
    
}

export default MessageRepository





