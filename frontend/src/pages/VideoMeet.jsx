import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import styles from '../styles/videoComponent.module.css';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import StopIcon from '@mui/icons-material/Stop';
import server from '../environment';

const server_url = server;

var connections = {};
const peerConfigConnections = { "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }] };

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoref = useRef();
  const videoRef = useRef([]);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState([]);
  const [audio, setAudio] = useState();
  const [screen, setScreen] = useState();
  const [showModal, setModal] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [newMessages, setNewMessages] = useState(3);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState('');
  const [speechActive, setSpeechActive] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setSpeechActive(false);
      };
    }
  }, []);

  const toggleSpeechToText = () => {
    if (speechActive) {
      recognitionRef.current.stop();
      setSpeechActive(false);
    } else {
      recognitionRef.current.start();
      setSpeechActive(true);
    }
  };

  const sendMessage = () => {
    socketRef.current.emit('chat-message', message, username);
    setMessage('');
  };

  return (
    <div>
      {askForUsername ? (
        <div>
          <h2>Enter into Lobby</h2>
          <TextField label='Username' value={username} onChange={(e) => setUsername(e.target.value)} />
          <Button variant='contained' onClick={() => setAskForUsername(false)}>Connect</Button>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          <div className={styles.chatContainer}>
            <div className={styles.chattingArea}>
              <TextField value={message} onChange={(e) => setMessage(e.target.value)} label='Enter Your chat' />
              <Button variant='contained' onClick={sendMessage}>Send</Button>
              <IconButton onClick={toggleSpeechToText} style={{ color: speechActive ? 'red' : 'white' }}>
                {speechActive ? <StopIcon /> : <RecordVoiceOverIcon />}
              </IconButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
