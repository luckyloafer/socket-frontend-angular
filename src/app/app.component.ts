import { Component } from '@angular/core';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
  socket: any;
  messages: string[] = [];
  newMessage = '';

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
    this.socket.on('message', (message: string) => {
      this.messages.push(message);
    });
  }
  sendMessage() {
    if (this.newMessage.trim()) {
      // Emit the message to the server
      
      this.socket.emit('message', this.newMessage);
      this.newMessage = '';
    }
  }
}
