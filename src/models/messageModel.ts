import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Schema.Types.ObjectId; 
  content: string; 
  chat: mongoose.Schema.Types.ObjectId; 
  readBy: mongoose.Schema.Types.ObjectId[]; 
  createdAt?: Date; 
  updatedAt?: Date; 
}

const messageSchema: Schema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel", 
      required: true,
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["MentorVarify", "Mentee"],
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat", 
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "readByModel",
      },
    ],
    readByModel: {
      type: String,
      enum: ["MentorVarify", "Mentee"], 
    },
  },
  { timestamps: true } 
);

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
