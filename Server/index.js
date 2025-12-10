// Load environment variables FIRST before any other imports
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const router = require("./Routers/getAddressRouter");
const app = express();
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const connectDB = require("./Config/mongodb");
const http = require("http");
const server = http.createServer(app);
const myRouter = require("./Routers/authRoutes");
const router3 = require("./Routers/userDataRoutes");
const router8 = require("./Routers/appointmentRoutes");
const Router9 = require("./Routers/DashboardRoutes");
const HealthRecordRouter = require("./Routers/HealthRecordRoutes");
const Router12 = require("./Routers/ContactRoutes");
const router1 = require("./Routers/MoodDetectorRouter");
const RouterJournal = require("./Routers/JournalRoutes");
const QuestionnaireRouter = require("./Routers/QuestionnaireRoutes");
const mentalHealthRouter = require("./Routers/mentalHealthRoutes");
const moodDetectionRouter = require("./Routers/moodDetectionRoutes");


// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// CORS configuration - allow production and development URLs
app.use(cors({
    origin: function (origin, callback) {
        // Allowed origins for production and development
        const allowedOrigins = [
            'https://mental-health-theta-woad.vercel.app',  // Production frontend
            'https://mental-health-two-kohl.vercel.app',    // New Production frontend
            'https://mental-health-3-0ydf.onrender.com',    // Production backend
            'http://localhost:5173',                         // Local development
            'https://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5000',
            process.env.FRONTEND_URL                         // Environment variable
        ].filter(Boolean); // Remove undefined values
        
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        console.warn('Blocked CORS request from origin:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow credentials (cookies)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control'],
    exposedHeaders: ['set-cookie']
}));

// Connect to MongoDB
connectDB(); 

const io = new Server(server, {
    cors: {
        origin: [
            'https://mental-health-theta-woad.vercel.app',
            'https://mental-health-two-kohl.vercel.app',
            'https://mental-health-3-0ydf.onrender.com',
            'http://localhost:5173',
            'https://localhost:5173',
            'http://127.0.0.1:5173',
            process.env.FRONTEND_URL
        ].filter(Boolean),
        methods: ["GET", "POST"],
        credentials: true // 👈 this is REQUIRED to allow cookies
    }
});


app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", myRouter);
app.use("/api/userData", router3);
app.use("/api", router);
app.use("/api/appointment", router8);
app.use("/api/dashboard", Router9);
app.use("/api/record", HealthRecordRouter);
app.use("/api/feedback", Router12);
app.use("/api/mood_analysis", router1);
app.use("/api/journal", RouterJournal);
app.use("/api/questionnaire", QuestionnaireRouter);
app.use("/api/mental-health", mentalHealthRouter);
app.use("/api/mood-detection", moodDetectionRouter);

const PORT = process.env.PORT || 5000;
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

const dataMappings = {};

const helper = async (roomid) => {
  const room = io.sockets.adapter.rooms.get(roomid);
  if (!room) return [];

  return Array.from(room).map((socketid) => ({
    username: dataMappings[socketid] || null,
    socketid: socketid,
  }));
};

io.on("connection", (socket) => {
    // console.log("User joined room:", socket.id);
    socket.on("room:join", async (data) => {
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        dataMappings[socket.id] = email;
        await socket.join(room);
        console.log("Current name is : "+email);
        const allClients = await helper(room);
        // console.log(allClients);
        io.to(room).emit("user:joined", { email, id: socket.id });
        io.to(socket.id).emit("room:join", data);
        console.log("Sending all:users to room", room, "with data:", allClients);
        io.to(room).emit("all:users",allClients);
    });

    socket.on("request:users", async (data) => {
        const { room } = data;
        console.log(`User ${socket.id} requesting users for room ${room}`);
        const allClients = await helper(room);
        console.log("Sending requested all:users to", socket.id, "with data:", allClients);
        io.to(socket.id).emit("all:users", allClients);
    });


    socket.on("user:call", ({ to, offer }) => {
        console.log(`📞 Call from ${socket.id} to ${to}`);
        io.to(to).emit("incomming:call", { from: socket.id, offer });
        console.log(`📤 Sent incomming:call event to ${to}`);
    });

    socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
        // console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
        // console.log("peer:nego:done", ans);
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });

    socket.on("call:ended", ({ to }) => {
        io.to(to).emit("call:ended");
    });

    socket.on("camera:toggle", ({ to, email, newCameraState }) => {
        socket
            .to(to)
            .emit("camera:toggle", { from: socket.id, email, newCameraState });
    });

    socket.on("messages:sent", ({ to, currMsg }) => {
        // console.log(currMsg);
        socket.broadcast.emit("messages:sent", { from: socket.id, currMsg });
    });

    socket.on("micMsg", ({ socketid, micMsg }) => {
        socket.broadcast.emit("micMsg", { from: socket.id, micMsg });
    })

    socket.on("send:opponent_from_calling",({opponentName})=>{
        // console.log("backend se bhejra hu bhai m opponent ka name");
        socket.broadcast.emit("get:opponent_from_calling",{from:socket.id,opponentName});
    })

})

app.get("/", (req, res) => {
    res.send("Server is running fine");
  });

server.listen(process.env.PORT || 8000, () => {
    // console.log("Server is running...");
});

// app.listen(PORT, () => {
//     // console.log(`Server is running on port ${PORT}`);
// })