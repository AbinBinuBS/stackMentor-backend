import { IMentee } from "../../models/menteeModel";
import { IMessage } from "../../models/messageModel";



export interface IMessageRepository {
    getAllMessage(chatId: string): Promise<IMessage[]>
    saveMessage(messageData: any,newNotification:any): Promise<any>
    findMessageById(messageId: string): Promise<any>
}