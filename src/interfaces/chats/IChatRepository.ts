import { IExistingMessage, menteeChatData } from "../../types/servicesInterfaces/IMentee";

export interface IChatRepository {
    menteeConnectChat(mentee: menteeChatData, mentorId: string): Promise<IExistingMessage | null>;
    mentorConnectChat(menteeId: string, mentorId: string): Promise<IExistingMessage | null>;
}