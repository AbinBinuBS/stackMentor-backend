import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRating extends Document {
    ratingValue: number;  
    comment: string;     
    mentee: Types.ObjectId; 
    mentor: Types.ObjectId;
    createdAt: Date;      
    updatedAt: Date;
}

const ratingSchema: Schema = new Schema(
  {
    ratingValue: {
      type: Number,
      required: true,
      min: 1,
      max: 5, 
    },
    comment: {
      type: String,
      required: false, 
      trim: true,
    },
    mentee: {
      type: Types.ObjectId,
      ref: "Mentee", 
      required: true,
    },
    mentor: {
      type: Types.ObjectId,
      ref: "MentorVarify", 
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Rating = mongoose.model<IRating>("Rating", ratingSchema);

export default Rating;
