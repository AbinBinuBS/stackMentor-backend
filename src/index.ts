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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'refresh-token'],
    credentials: true
}));
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, refresh-token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(204);
});




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
