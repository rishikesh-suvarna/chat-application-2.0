import React, { useState, useEffect } from 'react'
import queryString from 'query-string'
import io from 'socket.io-client'
import InfoBar from '../InfoBar/InfoBar'
import Input from '../Input/Input'
import Messages from '../Messages/Messages'
import './Chat.css'
import TextContainer from '../TextContainer/TextContainer'
let socket;

const Chat = ({location}) => {

    const [name, setName] = useState('')
    const [room, setRoom] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [users, setUsers] = useState([])
    const URL = "localhost:8000"

    useEffect(() => {
        const {name, room} = queryString.parse(location.search);
        
        socket = io("/")
        console.log(socket);

        setName(name)
        setRoom(room)

        socket.emit('join', {
            name, room
        }, () => {

        })

        return () => {
            socket.emit('disconnect')
            socket.off();
        }
        
    }, [URL, location.search]);


    useEffect(() => {
        socket.on('message', (message) => {
            setMessages([...messages, message])
        })
        socket.on('roomData', (roomData) => {
            setUsers(roomData.users)
        })
        return () => {
            socket.off()
        }
    }, [messages, users])

    // sending messages
    const sendMessage = (event) => {
        event.preventDefault();
        if(message){
            socket.emit('sendMessage', message, () => {
                setMessage('')
            })
        }
    }

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
            <TextContainer users={users}/>
        </div>
    )
}

export default Chat
