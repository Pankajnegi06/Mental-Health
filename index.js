import express from "express"
import {Server} from "socket.io"
import {createServer} from "node:http"
import dotenv from 'dotenv'
import connection from "./src/dbs/index.js"
import { app } from "./app.js"


const env = dotenv.config({path:"./.env"})


 connection()
 
const server = createServer(app)

const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });
  
  io.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('message', (msg) => {
      console.log('Message from client:', msg);
      io.emit('message', msg);
    });
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
const PORT = process.env.PORT || 8000

app.get("/",(req,res)=>{
   res.send("Hi")
})

server.listen(PORT ,()=>{
    console.log(`Server started at PORT : http://localhost:${PORT}`)
})