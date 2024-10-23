import { IChatRepository } from "../interfaces/chats/IChatRepository";
import Chat from "../models/chatModel";
import MentorVerifyModel from "../models/mentorValidate";
import { IExistingMessage, menteeChatData } from "../types/servicesInterfaces/IMentee";

export class ChatRepository implements IChatRepository {
    async menteeConnectChat(mentee: menteeChatData, mentorId: string): Promise<IExistingMessage | null> {
        try {

            const existingChat = await Chat.findOne({ mentee: mentee.id, mentor: mentorId })
                .populate("mentor", "-password")
                .populate("mentee", "-password")
                .populate("latestMessage");

            if (existingChat) return existingChat as unknown as IExistingMessage;

            const newChat = await Chat.create({ chatName: "Chat between mentor and mentee", mentee: mentee.id, mentor: mentorId });
            const fullChat = await Chat.findById(newChat._id)
                .populate("mentor", "-password")
                .populate("mentee", "-password")
                .populate("latestMessage");

            if (!fullChat) throw new Error("Chat creation failed");

            return fullChat as unknown as IExistingMessage;
        } catch (error) {
            console.error("Error in menteeConnectChat:", error);
            return null;
        }
    }

    async mentorConnectChat(menteeId: string, mentorId: string): Promise<IExistingMessage | null> {
        try {
            const mentorVerification = await MentorVerifyModel.findOne({ mentorId }).populate("mentorId");

            if (!mentorVerification) throw new Error("Mentor verification failed");

            const existingChat = await Chat.findOne({ mentee: menteeId, mentor: mentorVerification._id })
                .populate("mentee", "-password")
                .populate("mentor", "-password")
                .populate("latestMessage");

            if (existingChat) return existingChat  as unknown as IExistingMessage;

            const newChat = await Chat.create({ chatName: "Chat between mentor and mentee", mentee: menteeId, mentor: mentorVerification._id });
            const fullChat = await Chat.findById(newChat._id)
                .populate("mentor", "-password")
                .populate("mentee", "-password")
                .populate("latestMessage");

            if (!fullChat) throw new Error("Chat creation failed");

            return fullChat as unknown as IExistingMessage;
        } catch (error) {
            console.error("Error in mentorConnectChat:", error);
            return null;
        }
    }
}

export default ChatRepository;
