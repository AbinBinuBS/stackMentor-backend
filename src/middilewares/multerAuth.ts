import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    let allowedFileTypes: string[];

    switch (file.fieldname) {
        case 'resume':
        case 'degreeCertificate':
        case 'experienceCertificate':
            allowedFileTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            break;
        case 'image':
            allowedFileTypes = [
                'image/jpeg',
                'image/png'
            ];
            break;
        default:
            return cb(new Error('Invalid field name.'));
    }

    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type for ${file.fieldname}.`));
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export const multipleUpload = upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'degreeCertificate', maxCount: 1 },
    { name: 'experienceCertificate', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]);


export const singleImageUpload = upload.single('image');