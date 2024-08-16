export interface userPayload{
    id:string;
    name:string;
    phone?:string;
    email:string;
    isActive:boolean;
    isAdmin?:boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


export interface mentorPayload{
    id:string;
    name:string;
    email:string;
    isActive:boolean;
    createdAt?: Date;
    updatedAt?: Date;
}