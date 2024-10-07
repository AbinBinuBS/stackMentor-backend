"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var http_1 = require("http");
var cors_1 = require("cors");
var socket_io_1 = require("socket.io");
var db_1 = require("./config/db");
var menteeRoute_1 = require("./routes/menteeRoute");
var adminRoute_1 = require("./routes/adminRoute");
var mentorRoute_1 = require("./routes/mentorRoute");
var chatRouter_1 = require("./routes/chatRouter");
var messageRoute_1 = require("./routes/messageRoute");
var passport_1 = require("./config/passport");
var chatModel_1 = require("./models/chatModel");
var authRouter_1 = require("./routes/authRouter");
var cookie_parser_1 = require("cookie-parser");
var express_session_1 = require("express-session");
var app = (0, express_1.default)();
var PORT = 3000;
(0, db_1.default)();
app.use((0, cors_1.default)({
    origin: 'https://stack-mentor.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'refresh-token'],
    credentials: true,
}));
app.options('*', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://stack-mentor.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, refresh-token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(204);
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use('/auth', authRouter_1.default);
app.use('/api/mentees', menteeRoute_1.default);
app.use('/api/admin', adminRoute_1.default);
app.use('/api/mentor', mentorRoute_1.default);
app.use('/api/chat', chatRouter_1.default);
app.use('/api/message', messageRoute_1.default);
var httpServer = http_1.default.createServer(app);
var io = new socket_io_1.Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: 'https://stack-mentor.vercel.app',
        credentials: true,
    },
});
io.on('connection', function (socket) {
    console.log('A user connected to socket.io');
    socket.on('setup', function (user) {
        socket.join(user._id);
        console.log("User connected with ID: ".concat(user._id));
        socket.emit('connected');
    });
    socket.on('join chat', function (room) {
        socket.join(room);
        console.log("User joined chat room: ".concat(room));
    });
    socket.on('typing', function (room) {
        socket.in(room).emit("typing");
    });
    socket.on('stop typing', function (room) {
        socket.in(room).emit("stop typing");
    });
    socket.on('new message', function (newMessageReceived) { return __awaiter(void 0, void 0, void 0, function () {
        var chatId, chat, senderId_1, recipientIds, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    chatId = newMessageReceived.chat._id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, chatModel_1.default.findById(chatId)];
                case 2:
                    chat = _a.sent();
                    if (!chat) {
                        console.error("Chat not found for ID:", chatId);
                        return [2 /*return*/];
                    }
                    senderId_1 = newMessageReceived.sender._id;
                    recipientIds = [chat.mentor, chat.mentee];
                    recipientIds.forEach(function (recipientId) {
                        if (recipientId.toString() !== senderId_1) {
                            console.log("Sending message to recipient:", recipientId);
                            socket.in(recipientId.toString()).emit('message received', newMessageReceived);
                        }
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error in new message event:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    socket.on('disconnect', function () {
        console.log('User disconnected from socket.io');
    });
});
httpServer.listen(PORT, function () {
    console.log("Running on Port ".concat(PORT));
});
