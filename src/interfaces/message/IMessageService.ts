import { IMessage } from "../../models/messageModel"
import { IMessageCombined } from "../../types/servicesInterfaces/IMentor"



export interface IMessageService {
    getAllMessage(chatId: string): Promise<IMessage[]>
    sendMessage(content: string, chatId: string, senderId: string):Promise<IMessageCombined>
}