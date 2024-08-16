import mongoose from 'mongoose';

const dbURI: string = 'mongodb+srv://abinbinu1827:wdFeE2ZAzGWDXH4k@cluster0.pjuxrgp.mongodb.net/stackMentor';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://abinbinu1827:wdFeE2ZAzGWDXH4k@cluster0.pjuxrgp.mongodb.net/stackMentor');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};  

export default connectDB;
