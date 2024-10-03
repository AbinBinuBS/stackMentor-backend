import crypto from "crypto"; 
import BookedSlots from "../models/bookedSlots";

const generateRoomId = async(): Promise<string> =>{
  let roomId: string;
  let existingSlot: any;

  do {
    roomId = crypto.randomBytes(12).toString("hex"); 
    existingSlot = await BookedSlots.findOne({ roomId });
  } while (existingSlot); 

  return roomId;
}

export default generateRoomId