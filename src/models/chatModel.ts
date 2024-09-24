import mongoose, { Document, Schema } from "mongoose";

 
export interface IChat extends Document {
  chatName?: string;  
  mentor: mongoose.Schema.Types.ObjectId;  
  mentee: mongoose.Schema.Types.ObjectId; 
  latestMessage?: mongoose.Schema.Types.ObjectId;  
  createdAt?: Date;
  updatedAt?: Date;
}


const chatModel: Schema = new Schema(
  {
    chatName: {
      type: String,
      trim: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorVarify",  
      required: true,
  },
  
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentee",
      required: true,
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);


const Chat = mongoose.model<IChat>("Chat", chatModel);

export default Chat;
