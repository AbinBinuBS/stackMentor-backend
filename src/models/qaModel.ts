import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQa extends Document {
  title: string;
  body: string;
  reply?: string;
  isAnswered?:boolean
  menteeId?: mongoose.Types.ObjectId
  mentorId?: Types.ObjectId
}

const qaSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    reply: {
      type: String,
    },
    menteeId: {
      type: mongoose.Types.ObjectId,
      ref: 'Mentee',
    },
    mentorId: {
      type: mongoose.Types.ObjectId,
      ref: 'Mentor',
    },
    isAnswered : {
      type: Boolean,
      default:false
    }
  },
  { timestamps: true }
);

const QA = mongoose.model<IQa>("QA", qaSchema);

export default QA;
