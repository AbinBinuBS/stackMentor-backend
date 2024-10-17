import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  senderName:string;
  recipient: mongoose.Schema.Types.ObjectId; 
  recipientModel: string; 
  sender?: mongoose.Schema.Types.ObjectId;
  senderModel?: string; 
  chat: mongoose.Schema.Types.ObjectId; 
  content: string;
  read: boolean;
  createdAt?: Date; 
  updatedAt?: Date; 
}

const notificationSchema: Schema = new Schema(
  {
    senderName: {
      type: String,
      required: true,
    },
    reciver: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientModel",
      required: true,
    },
    reciverModel: {
      type: String,
      required: true,
      enum: ["MentorVarify", "Mentee"], 
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel", 
    },
    senderModel: {
      type: String,
      enum: ["MentorVarify", "Mentee"], 
    },
    content: {
      type: String,
      required: true,
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat", 
        required: true,
    },
    read: {
      type: Boolean,
      default: false, 
    },
  },
  { timestamps: true } 
);

const NotificationModel = mongoose.model<INotification>("Notification", notificationSchema);

export default NotificationModel;
