import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Schema.Types.ObjectId; // Reference to the user sending the message
  content: string; // Message content
  chat: mongoose.Schema.Types.ObjectId; // Reference to the chat
  readBy: mongoose.Schema.Types.ObjectId[]; // Users who have read the message
  createdAt?: Date; // Timestamp for when the message was created
  updatedAt?: Date; // Timestamp for when the message was updated
}

const messageSchema: Schema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel", // This allows dynamic reference based on senderModel
      required: true,
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["MentorVarify", "Mentee"], // Ensure these match your actual model names
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat", // This should match your Chat model
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "readByModel", // This allows dynamic reference based on readByModel
      },
    ],
    readByModel: {
      type: String,
      enum: ["MentorVarify", "Mentee"], // Ensure these match your actual model names
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
