export interface TokenResponce{
    accessToken:string;
    refreshToken:string;
}

export interface IAdminLogin {
    email:string;
    password:string
}

export interface IAdminMentorList {
    _id: string; 
    name: string; 
    email: string; 
    isActive: boolean;
    isVerified:string;
}

export interface IAdminUserList {
    _id: string; 
    name: string; 
    email: string; 
    isActive: boolean;
    isVerified:string;
}