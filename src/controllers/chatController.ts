

import { Request, Response } from "express";
import Chat from "../models/chatModel";
import mongoose from "mongoose"; 
import ChatService from "../services/chatService";
import MentorVerifyModel from "../models/mentorValidate";

class ChatController {
    constructor(private chatService : ChatService) {}

    async menteeConnectChat(req: Request, res: Response): Promise<void> {
        try {
            const mentee = (req as any).mentee; 
            const mentorId = req.body.mentorData?._id; 
            const Chat = await this.chatService.menteeConnectChat(mentee,mentorId)
            res.status(200).json({message:"Success",chat:Chat});
        } catch (error) {
            console.error("Error in menteeConnectChat:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async mentorConnectChat(req: Request, res: Response): Promise<void> {
        try {
            const mentorId = req.body.mentorId;
            const mentee = req.body.userId;            
            const Chat = await this.chatService.mentorConnectChat(mentee,mentorId)
            res.status(200).json({message:"Success",chat:Chat})
        } catch (error) {
            console.error("Error in mentorConnectChat:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
    
    
    
}

export default ChatController;
