import { IExistingMessage, menteeChatData } from "../../types/servicesInterfaces/IMentee";

export interface IChatService {
    menteeConnectChat(mentee: menteeChatData, mentorId: string): Promise<IExistingMessage | null>;
    mentorConnectChat(menteeId: string, mentorId: string): Promise<IExistingMessage | null>;
}