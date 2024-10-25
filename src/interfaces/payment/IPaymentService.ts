





export interface IPaymentService  {
    proceedPayment(sessionId:string,accessToken:string): Promise< boolean>
    walletPayment(menteeId:string,slotId:string): Promise<boolean>

}