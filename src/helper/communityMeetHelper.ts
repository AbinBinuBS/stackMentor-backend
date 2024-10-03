import CommunityMeet from "../models/communityMeetModel";
import crypto from "crypto"; 


const CommunityRoomId = async(): Promise<string> =>{
    let roomId: string;
    let existingSlot: any;
  
    do {
      roomId = crypto.randomBytes(12).toString("hex"); 
      existingSlot = await CommunityMeet.findOne({ roomId });
    } while (existingSlot); 
  
    return roomId;
  }

  export default CommunityRoomId