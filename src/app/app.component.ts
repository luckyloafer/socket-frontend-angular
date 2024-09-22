import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'frontend';
  socket!: Socket;
  messages: { message: string; sendStatus: boolean; senderId: string }[] = [];
  onlineUsers = 0;
  newMessage = '';
  userId = this.generateUserId();

  // Add media constraints for video call
  mediaConstraints = {
    video: true,
    audio: true,
  };
  localStream: MediaStream | null = null;
  remoteStream: MediaStream | null = null;
  peerConnection: RTCPeerConnection | null = null;

  // Get references to video elements
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  ngOnInit() {
    this.initializeSocket();
    this.registerUser();

    // Listen for the onlineUsers event
    this.socket.on('onlineUsers', (count: number) => {
      console.log('Unique online users:', count);
      this.onlineUsers = count;
    });

    // Listen for video call offers and answers
    this.socket.on('offer', (offer: RTCSessionDescriptionInit) => {
      this.handleOffer(offer);
    });

    this.socket.on('answer', (answer: RTCSessionDescriptionInit) => {
      this.handleAnswer(answer);
    });

    this.socket.on('ice-candidate', (candidate: RTCIceCandidate) => {
      this.handleNewICECandidateMsg(candidate);
    });
  }

  initializeSocket() {
    this.socket = io('https://backend-ny0k.onrender.com/');
  }

  registerUser() {
    this.socket.emit('registerUser', this.userId);
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const message = { message: this.newMessage, sendStatus: true, senderId: this.userId };
      this.socket.emit('message', message);
      this.newMessage = '';
    }
  }

  // Function to start the video call
  startCall() {
    navigator.mediaDevices.getUserMedia(this.mediaConstraints)
      .then((stream) => {
        this.localStream = stream;

        // Display local stream in the video element
        this.localVideo.nativeElement.srcObject = stream;

        // Initialize RTCPeerConnection and handle video call setup
        this.peerConnection = new RTCPeerConnection();

        // Add local stream to the peer connection
        stream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, stream);
        });

        // Handle ICE candidate
        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            this.socket.emit('ice-candidate', event.candidate);
          }
        };

        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
          this.remoteStream = event.streams[0];
          this.remoteVideo.nativeElement.srcObject = this.remoteStream;
        };

        // Create offer
        this.peerConnection.createOffer()
          .then((offer) => {
            this.peerConnection!.setLocalDescription(offer);
            this.socket.emit('offer', offer);
          });
      })
      .catch((error) => console.error('Error accessing media devices.', error));
  }

  handleOffer(offer: RTCSessionDescriptionInit) {
    this.peerConnection = new RTCPeerConnection();

    // Add local stream to peer connection
    this.localStream?.getTracks().forEach(track => {
      this.peerConnection!.addTrack(track, this.localStream!);
    });

    // Handle ICE candidate
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', event.candidate);
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.remoteVideo.nativeElement.srcObject = this.remoteStream;
    };

    this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      .then(() => {
        // Create and send an answer
        return this.peerConnection!.createAnswer();
      })
      .then((answer) => {
        this.peerConnection!.setLocalDescription(answer);
        this.socket.emit('answer', answer);
      })
      .catch((error) => console.error('Error handling offer.', error));
  }

  handleAnswer(answer: RTCSessionDescriptionInit) {
    this.peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
  }

  handleNewICECandidateMsg(candidate: RTCIceCandidate) {
    this.peerConnection?.addIceCandidate(candidate);
  }

  generateUserId(): string {
    return 'user-' + Math.random().toString(36).substr(2, 9);
  }

  @ViewChild('messageInput') messageInput!: ElementRef;

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'm') {
      event.preventDefault(); // Prevent default behavior
      this.focusInput();
    }
  }

  focusInput(): void {
    this.messageInput.nativeElement.focus();
  }
}
