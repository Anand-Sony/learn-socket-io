import React, { useEffect, useMemo, useState } from 'react'
import {io} from "socket.io-client"

import { Container, Typography, TextField, Button } from '@mui/material';
import { Box , Stack} from '@mui/material';

const App = () => {

  const [message, setMessage] = useState(""); 
  const [room, setRoom] = useState("");  
  const [socketId, setSocketId] = useState("");  

  const [messages, setMessages] = useState([]);
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e)=>{
    e.preventDefault();
    socket.emit("message", {message, room})
    setMessage("");
  }

  const joinRoomHandler = (e)=>{
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  }

  //  const socket = io("http://localhost:8000"); this is changed to below line
  const socket = useMemo(()=> 
    io("http://localhost:8000", {
      withCredentials:true,
    }), []);

  useEffect(()=>{
    socket.on("connect", ()=>{
      setSocketId(socket.id);
      console.log("Connected", socket.id);
    })

    socket.on("receive-message", (data)=>{
      console.log(data);

      setMessages((messages)=> [...messages, data])
    })

    socket.on("Welcome", (s)=>{
      console.log(s);
    })

    return()=>{
      socket.disconnect();
    };

  }, [])

  return ( 
  <Container maxWidth="sm">
    <Box sx={{height:500}} />

    <Typography variant="h6" component="div" gutterBottom >
      User-Id: {socketId}
    </Typography>


    <form onSubmit={joinRoomHandler} >
      <h5>Join Room</h5>
        <TextField id="outlined-basic" label="Room Name" varient="outlined" value={roomName} onChange={e=> setRoomName(e.target.value)} />
        <Button type='submit' variant="contained" color="primary">Join</Button>
    </form>


  <form onSubmit={handleSubmit} >
    <TextField id="outlined-basic" label="Message" varient="outlined" value={message} onChange={e=> setMessage(e.target.value)} />
    <TextField id="outlined-basic" label="Room" varient="outlined" value={room} onChange={e=> setRoom(e.target.value)} />
    <Button type='submit' variant="contained" color="primary">Send</Button>
  </form>

  <Stack>
    {messages.map((m,i) => (
      <Typography key={i} variant='h6' component="div" gutterBottom >
        {m}
      </Typography>
    ))}
  </Stack>
  
  </Container>
  )
  
}

export default App