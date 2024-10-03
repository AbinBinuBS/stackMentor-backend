import { Schema, model, Document } from 'mongoose';

export interface ICommunityMeet extends Document {
  date: Date;
  startTime: string;
  endTime: string;
  about: string;
  mentorId: Schema.Types.ObjectId; 
  RoomId:string;
  image:string ;
  stack:string;
}

const communityMeetSchema: Schema<ICommunityMeet> = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    stack: {
        type:String,
        required:true
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentor',
      required: true,
    },
    RoomId: {
      type:String,
      required:true
    },
    image: {
        type :String,
        required:true
    }
  },
  { timestamps: true }
);

const CommunityMeet = model<ICommunityMeet>('CommunityMeet', communityMeetSchema);

export default CommunityMeet;
