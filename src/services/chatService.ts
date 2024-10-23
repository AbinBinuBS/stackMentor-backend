import { IChatRepository } from "../interfaces/chats/IChatRepository";
import { IChatService } from "../interfaces/chats/IChatService";
import { IExistingMessage, menteeChatData } from "../types/servicesInterfaces/IMentee";


export class ChatService implements IChatService {
    constructor(private chatRepository: IChatRepository) {}

    async menteeConnectChat(mentee: menteeChatData, mentorId: string): Promise<IExistingMessage | null> {

        if (!mentorId) {
            throw new Error("Mentor ID is missing");
        }

        const chat = await this.chatRepository.menteeConnectChat(mentee, mentorId);
        if (!chat) {
            throw new Error("Chat creation failed");
        }
        return chat;
    }

    async mentorConnectChat(menteeId: string, mentorId: string): Promise<IExistingMessage | null> {
        if (!mentorId) {
            throw new Error("Mentor ID is missing");
        }

        const chat = await this.chatRepository.mentorConnectChat(menteeId, mentorId);
        if (!chat) {
            throw new Error("Chat creation failed");
        }
        return chat;
    }
}

export default ChatService;
