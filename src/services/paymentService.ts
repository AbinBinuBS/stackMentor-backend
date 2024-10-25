import { JWT_SECRET } from "../config/middilewareConfig";
import { IPaymentRepository } from "../interfaces/payment/IPaymentRepository";
import { IPaymentService } from "../interfaces/payment/IPaymentService";
import jwt, { JwtPayload } from "jsonwebtoken";



class PaymentService implements IPaymentService{
	constructor(private paymentRepository:IPaymentRepository) {}

	async proceedPayment(sessionId:string,accessToken:string): Promise< boolean>{
		try{
		  if (accessToken.startsWith("Bearer ")) {
					accessToken = accessToken.split(" ")[1];
				}
				const decoded = jwt .verify(accessToken,JWT_SECRET as string) as JwtPayload;
				const { id } = decoded;
		  const bookSlot = await this.paymentRepository.proceedPayment(sessionId,id)
		  return true
		}catch(error){
		  if (error instanceof Error) {
			console.error(error.message);
			throw new Error(error.message)
		  } else {
			console.error("error to fetch data:", error);
			throw new Error("Unable to fetch data at this moment.")
		  }
		}
	  }

	async walletPayment(menteeId:string,slotId:string): Promise<boolean>{
		try{
		  await this.paymentRepository.walletPayment(menteeId,slotId)
		  return true
		}catch(error){
		  if (error instanceof Error) {
			console.error(error.message);
			throw new Error(error.message)
		  } else {
			console.error("error to fetch data:", error);
			throw new Error("Unable to fetch data at this moment.")
		  }
		}
	  }
    
}

export default PaymentService