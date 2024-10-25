import stripe from "../config/stripe";
import { IPaymentService } from "../interfaces/payment/IPaymentService";
import { Request, Response } from "express";


class PaymentController {
	constructor(private paymentService:IPaymentService) {}
    async  paymentMethod(req: Request, res: Response): Promise<void> {
        try {
            const { amount } = req.body;
            const amountInPaise = amount * 100; 
            if (amountInPaise < 50) {
                res.status(400).json({ message: "Amount must be at least 50 paise (0.50 INR)." });
                return;
            }
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInPaise,
                currency: 'inr',
                payment_method_types: ['card'],
            });
            res.status(200).send({
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "An error occurred while processing your request." });
        }
    }

    async proceedPayment(req:Request,res:Response):Promise<void>{ 
        try{
            const accessToken = req.headers['authorization'] as string;
            const { sessionId } = req.body
            const bookSlot = await this.paymentService.proceedPayment(sessionId,accessToken)
            res.status(200).json({message:"Success"})
        }catch(error){
            if (error instanceof Error) {
                console.error( error.message);
                res.status(500).json({ message: error.message });
            } else {
                console.error('Unknown error during  :', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    async walletPayment(req:Request,res:Response): Promise<void> {
        try{
            const menteeId = ( req as any).mentee.id
            const slotId = req.body.sessionId
            const bookSlot = await this.paymentService.walletPayment(menteeId,slotId)
            if(bookSlot){
                res.status(200).json({message:"Success"})
                return
            }
        }catch(error){
            if(error instanceof Error){
                if(error.message == "Slot is already booked"){
                    res.status(409).json({message:" This slot is already booked."})
                    return
                }else if(error.message == "insufficient balance"){
                    res.status(403).json({message:"insufficient balance"})
                    return
                }else{
                    res.status(500).json({ message: "An error occurred while processing your request." });
                    return
                }
            }else{
                res.status(500).json({ message: "An error occurred while processing your request." });
            }
        }
    }
}

export default PaymentController