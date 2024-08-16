

export interface TokenResponce{
    accessToken:string;
    refreshToken:string;
}

export interface IMenteeLogin {
    email:string;
    password:string
}

export interface IOtpVerify {
    email:string;
    otp:string
}