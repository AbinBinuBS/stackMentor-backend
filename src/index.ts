import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import connectDB from './config/db';
import menteeRouter from './routes/menteeRoute'; 
import adminRouter from './routes/adminRoute';
import mentorRouter from './routes/mentorRoute';
import chatRouter from './routes/chatRouter';
import messageRouter from './routes/messageRoute';
import passportAuth from './config/passport'
import Chat from './models/chatModel';
import authRouter from './routes/authRouter'
import cookieParser = require('cookie-parser')
import session from 'express-session'



// Define a User type
interface User {
  _id: string;
  name: string;
}

// Initialize Express app
const app = express();
const PORT = 3001;

// Connect to the database
connectDB();

// Middleware setup
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'refresh-token'],
  credentials: true,
}));

app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, refresh-token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passportAuth.initialize());
app.use(passportAuth.session());

app.use('/auth',authRouter)
app.use('/api/mentees', menteeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/mentor', mentorRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);


const httpServer = http.createServer(app);


const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('A user connected to socket.io');


  socket.on('setup', (user: User) => {
    socket.join(user._id);
    console.log(`User connected with ID: ${user._id}`);
    socket.emit('connected');
  });


  socket.on('join chat', (room: string) => {
    socket.join(room);
    console.log(`User joined chat room: ${room}`);
  });

  socket.on('typing', (room: string) => {
    socket.in(room).emit("typing");
  });

  socket.on('stop typing', (room: string) => {
    socket.in(room).emit("stop typing");
  });


  socket.on('new message', async (newMessageReceived: any) => {
    const chatId = newMessageReceived.chat._id;

    try {
        const chat = await Chat.findById(chatId);

        if (!chat) {
            console.error("Chat not found for ID:", chatId);
            return;
        }


        const senderId = newMessageReceived.sender._id;
        const recipientIds = [chat.mentor, chat.mentee];

        recipientIds.forEach(recipientId => {
            if (recipientId.toString() !== senderId) {
                console.log(`Sending message to recipient:`, recipientId);
                socket.in(recipientId.toString()).emit('message received', newMessageReceived);
            }
        });

    } catch (error) {
        console.error("Error in new message event:", error);
    }
});





  socket.on('disconnect', () => {
    console.log('User disconnected from socket.io');
  });
});


httpServer.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});

