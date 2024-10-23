import { Request, Response } from "express";
import { IChatService } from "../interfaces/chats/IChatService";
import { HttpStatus } from "../enums/httpStatus";
import { ErrorMessages } from "../enums/errorMessages";
import { SuccessMessages } from "../enums/successMessage";



export class ChatController {
    constructor(private chatService: IChatService) {}

    async menteeConnectChat(req: Request, res: Response): Promise<void> {
        try {
            const mentee = (req as any).mentee;
            const mentorId = req.body.id;
            const chat = await this.chatService.menteeConnectChat(mentee, mentorId);
            
            if (chat) {
                res.status(HttpStatus.OK).json({ message: SuccessMessages.Success, chat });
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({ message: ErrorMessages.CHAT_CREATION_FAILED });
            }
        } catch (error: any) {
            console.error("Error in menteeConnectChat:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR });
        }
    }

    async mentorConnectChat(req: Request, res: Response): Promise<void> {
        try {
            const mentorId = (req as any).mentor.id;
            const menteeId = req.body.id;
            const chat = await this.chatService.mentorConnectChat(menteeId, mentorId);
            
            if (chat) {
                res.status(HttpStatus.OK).json({ message: SuccessMessages.Success, chat });
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({ message: ErrorMessages.CHAT_CREATION_FAILED });
            }
        } catch (error: any) {
            console.error("Error in mentorConnectChat:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || ErrorMessages.INTERNAL_SERVER_ERROR });
        }
    }
}

export default ChatController;
