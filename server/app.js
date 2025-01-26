import express from "express";
import { Server } from "socket.io";
import {createServer} from "http"; 

import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import cors from "cors"

const port =8000;
const secretKeyJWT = "asdasdasdasdasda";

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials:true,
    }
});

app.use(
        cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials:true,
}));

app.get("/", (req, res)=>{
    res.send("Hello World");
})

app.get("/login", (req,res)=>{
    const token = jwt.sign({_id:"asadasdasdsadsadsadas" },secretKeyJWT);
    res.cookie("token", token, {httpOnly:true , secure:true, sameSite:"none" })
    .json({message: "Login Successful!"})
})

io.use((socket, next) => {
    cookieParser()(socket.request, socket.request.res, (err)=>{
        if(err) return next(err)
        
        const token = socket.request.cookies.token;

        if(!token) return next(new Error("Authentication Error!"));

        const decoded = jwt.verify(token, secretKeyJWT);

        next();
    })
})

io.on("connection", (socket)=>{
    console.log("User connected", socket.id);

    // socket.emit("Welcome", `Welcome to the server, ${socket.id}`);
    // socket.broadcast.emit("Welcome", `${socket.id} joined the server`);  // this is used like in whatsapp grp: "person joined the chat"
    
    socket.on("message", ({room, message})=>{
        console.log({room, message});

        io.to(room).emit("receive-message", message)
    
        // note : io.emit() means message go to everyone and also itself
    // but in socket.broadcast.emit message will go to everyone but not to the person who is sending the message 
    })

    socket.on("join-room", (room)=> {
        socket.join(room);
        console.log(`User joined room ${room}`);
    })

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", socket.id);
    })
})

server.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})