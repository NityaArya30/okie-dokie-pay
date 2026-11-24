import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [incomingAlert, setIncomingAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio tone generator for incoming messages
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  useEffect(() => {
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    s.on('connect', () => {
      console.log('[Socket] Connected to backend gateway');
      setConnected(true);
    });

    s.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setConnected(false);
    });

    s.on('parent_incoming_reply', (data) => {
      console.log('[Socket] Incoming parent reply received:', data);
      playNotificationSound();
      setIncomingAlert({
        id: Date.now(),
        type: 'parent_reply',
        title: `New Reply from ${data.message.senderName || 'Parent'}`,
        text: data.message.text,
        recipient: data.recipient,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [soundEnabled]);

  const clearAlert = () => setIncomingAlert(null);

  return (
    <SocketContext.Provider value={{ socket, connected, incomingAlert, clearAlert, soundEnabled, setSoundEnabled }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
