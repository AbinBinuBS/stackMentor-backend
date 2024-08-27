

export interface IMentorLogin {
    email:string,
    password:string
}

export interface MentorVerifyData {
    name: string;
    dateOfBirth: Date;
    about: string;
    degree:string;
    college:string;
    yearOfGraduation:string;
    jobTitle:string;
    lastWorkedCompany:string;
    yearsOfExperience:string;
    stack:string;
    fileUrls:{
      resume:string,
      degreeCertificate:string,
      experienceCertificate:string,
      image: string;
    }
  }
  
  export interface MentorVerifyFiles {
    resume?: Express.Multer.File;
    degreeCertificate?: Express.Multer.File;
    experienceCertificate?: Express.Multer.File;
    image?:Express.Multer.File;
  }


  export interface ISlotsList {
    date:Date;
    startTime:String;
    endTime:String;
    id:string;
  }