import express from 'express';
import cors from 'cors';
import menteeRouter from './routes/menteeRoute'; 
import adminRouter from './routes/adminRoute';
import connectDB from './config/db';
import mentorRouter from './routes/mentorRoute'
const cloudinary = require('cloudinary').v2;


const app = express();

connectDB();

app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type','Authorization'], 
    credentials: true 
}));

cloudinary.config({
    secure: true
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/mentees', menteeRouter)
app.use('/api/admin', adminRouter);
app.use('/api/mentor',mentorRouter)
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
});
