import { IExistingMessage, menteeChatData } from "../interfaces/servicesInterfaces/IMentee";
import ChatRepository from "../repositories/chatRepository";


class ChatService {
    constructor(private chatRepository: ChatRepository) {}

    async menteeConnectChat (mentee:menteeChatData,mentorId:string):Promise<IExistingMessage | undefined>{
        try{
            if (!mentorId) {
                throw new Error("mentor id is missing");
            }
            const chat = await this.chatRepository.menteeConnectChat(mentee, mentorId);
            if (chat) {
                return chat
            } else {
                throw new Error("something unexpected happened please try again")
            }
        }catch(error){
            console.log(error)
        }
    }


    async mentorConnectChat (mentee:string,mentorId:string):Promise<IExistingMessage | undefined>{
        try{
            if (!mentorId) {
                throw new Error("mentor id is missing");
            }
            const chat = await this.chatRepository.mentorConnectChat(mentee, mentorId);
            if (chat) {
                return chat
            } else {
                throw new Error("something unexpected happened please try again")
            }
        }catch(error){
            console.log(error)
        }
    }


    
}

export default ChatService



