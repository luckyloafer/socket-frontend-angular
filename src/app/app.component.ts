import { Component, ElementRef, ViewChild, HostListener  } from '@angular/core';
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
  onlineUsers: number = 0;

  ngOnInit() {
   
    this.userId = this.generateUserId();
    // https://backend-ny0k.onrender.com/
    this.socket = io('https://backend-ny0k.onrender.com/');
    this.socket.emit('registerUser', this.userId);
    
    this.socket.on('message', (message: { message: string; sendStatus: boolean; senderId: string }) => {
      this.messages.push(message);
    });

    this.socket.on('onlineUsers', (count: number) => {
      console.log('Unique online users:', count); // Debugging log
      this.onlineUsers = count;
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

  @ViewChild('messageInput') messageInput!: ElementRef;

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'm') {
      event.preventDefault(); // Prevent any default behavior like minimizing window
      this.focusInput();
    }
  }

  focusInput(): void {
    this.messageInput.nativeElement.focus();
  }
}
