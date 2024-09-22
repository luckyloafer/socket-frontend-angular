import { Component } from '@angular/core';
import { io } from 'socket.io-client';

interface message{
  message:string,
  sendStatus:string
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
  socket: any;
  messages: message[] = [];
  newMessage='';

  ngOnInit() {
    // Connect to the backend socket.io server
    console.log('initied')
    try {
      console.log("inside");
      
      this.socket = io('https://backend-ny0k.onrender.com/', {
        transports: ['websocket', 'polling'],  // Allow WebSocket and fallback to polling
        upgrade: true  // Allow Socket.IO to try upgrading from polling to WebSocket
      });
    } catch (error) {
      console.log(error)
    }
    // Listen for messages from the server
    this.socket.on('message', (message: message) => {
      this.messages.push(message);
    });
  }
  sendMessage() {
    if (this.newMessage.trim()) {
      // Emit the message to the server
      const sentMessage = {message:this.newMessage,sendStatus:'sent'} 
      this.socket.emit('message', sentMessage);
      this.newMessage = '';
    }
  }
}
