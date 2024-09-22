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
  messages: { message: string; sendStatus: boolean; senderId: string }[] = [];
  newMessage = '';
  userId: string = '';

  ngOnInit() {
   
    this.userId = this.generateUserId();

    
    this.socket = io('https://backend-ny0k.onrender.com/');

    
    this.socket.on('message', (message: { message: string; sendStatus: boolean; senderId: string }) => {
      this.messages.push(message);
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
     
      const message = { message: this.newMessage, sendStatus: true, senderId: this.userId };
      this.socket.emit('message', message);
      this.newMessage = '';
    }
  }
  
  generateUserId(): string {
    return 'user-' + Math.random().toString(36).substr(2, 9);
  }
}
