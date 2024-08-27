export interface FileUrls {
    resume: string | null;
    degreeCertificate: string | null;
    experienceCertificate: string | null;
    image:string | null
}

export type UploadResult = { [key: string]: string | null };