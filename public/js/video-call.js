/**
 * Video Call Module for Healthcare App
 * Simple WebRTC implementation for doctor-patient video consultations
 */

const VideoCall = {
    // Configuration
    peerConfig: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    },
    
    // State variables
    localStream: null,
    peerConnection: null,
    remoteStream: null,
    callInProgress: false,
    callId: null,
    role: null, // 'doctor' or 'patient'
    appointmentId: null,
    
    // DOM Elements (will be set when initialized)
    localVideo: null,
    remoteVideo: null,
    callContainer: null,
    callControls: null,
    
    // Initialize the video call module
    initialize(containerId, localVideoId, remoteVideoId, role) {
        this.callContainer = document.getElementById(containerId);
        this.localVideo = document.getElementById(localVideoId);
        this.remoteVideo = document.getElementById(remoteVideoId);
        this.role = role;
        
        // Create call controls if they don't exist
        if (!document.getElementById('call-controls')) {
            this.createCallControls();
        } else {
            this.callControls = document.getElementById('call-controls');
        }
        
        // Set up listeners for call signaling
        this.setupCallListeners();
        
        console.log(`Video call module initialized as ${role}`);
    },
    
    // Create call control buttons
    createCallControls() {
        this.callControls = document.createElement('div');
        this.callControls.id = 'call-controls';
        this.callControls.className = 'call-controls';
        this.callControls.innerHTML = `
            <button id="toggle-video" class="call-btn">
                <span class="material-icons">videocam</span>
            </button>
            <button id="toggle-audio" class="call-btn">
                <span class="material-icons">mic</span>
            </button>
            <button id="end-call" class="call-btn end-call">
                <span class="material-icons">call_end</span>
            </button>
        `;
        
        this.callContainer.appendChild(this.callControls);
        
        // Add event listeners to buttons
        document.getElementById('toggle-video').addEventListener('click', () => this.toggleVideo());
        document.getElementById('toggle-audio').addEventListener('click', () => this.toggleAudio());
        document.getElementById('end-call').addEventListener('click', () => this.endCall());
    },
    
    // Setup WebRTC listeners
    setupCallListeners() {
        // Listen for incoming calls (in a real app, this would use websockets or a signaling server)
        // For demo purposes, we'll use localStorage as a simple signaling mechanism
        window.addEventListener('storage', (event) => {
            if (event.key === 'videoCallSignal') {
                const signal = JSON.parse(event.newValue);
                
                // Only process signals relevant to our role or appointment
                if ((signal.to === this.role || signal.to === 'all') && 
                    (!this.appointmentId || signal.appointmentId === this.appointmentId)) {
                    
                    this.handleSignal(signal);
                }
            }
        });
    },
    
    // Handle incoming signals
    handleSignal(signal) {
        switch(signal.type) {
            case 'offer':
                this.handleOffer(signal);
                break;
            case 'answer':
                this.handleAnswer(signal);
                break;
            case 'ice-candidate':
                this.handleIceCandidate(signal);
                break;
            case 'call-ended':
                this.handleCallEnded(signal);
                break;
            case 'call-request':
                this.handleCallRequest(signal);
                break;
        }
    },
    
    // Start a call (doctor initiates)
    async startCall(appointmentId, patientId) {
        if (this.callInProgress) {
            console.log('Call already in progress');
            return;
        }
        
        try {
            this.appointmentId = appointmentId;
            this.callId = `call-${Date.now()}`;
            
            // Request camera and microphone permissions
            this.localStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            // Display local video
            this.localVideo.srcObject = this.localStream;
            
            // Create peer connection
            this.peerConnection = new RTCPeerConnection(this.peerConfig);
            
            // Add local stream tracks to peer connection
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
            
            // Set up event handlers for peer connection
            this.setupPeerConnectionHandlers();
            
            // Create and send offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            // Send offer via signaling channel
            this.sendSignal({
                type: 'offer',
                from: 'doctor',
                to: 'patient',
                appointmentId: appointmentId,
                patientId: patientId,
                callId: this.callId,
                sdp: offer
            });
            
            // Show call UI
            this.showCallUI('Calling patient...');
            this.callInProgress = true;
            
            // Send a call request notification
            this.sendSignal({
                type: 'call-request',
                from: 'doctor',
                to: 'patient',
                appointmentId: appointmentId,
                patientId: patientId,
                callId: this.callId,
                doctorName: JSON.parse(localStorage.getItem('currentDoctor') || '{}').fullName || 'Your doctor'
            });
            
            console.log('Call started, waiting for patient to join...');
        } catch (error) {
            console.error('Error starting call:', error);
            this.showCallError('Could not access camera or microphone. Please check permissions.');
        }
    },
    
    // Join a call (patient joins)
    async joinCall(callData) {
        if (this.callInProgress) {
            console.log('Call already in progress');
            return;
        }
        
        try {
            this.appointmentId = callData.appointmentId;
            this.callId = callData.callId;
            
            // Request camera and microphone permissions
            this.localStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            // Display local video
            this.localVideo.srcObject = this.localStream;
            
            // Create peer connection
            this.peerConnection = new RTCPeerConnection(this.peerConfig);
            
            // Add local stream tracks to peer connection
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
            
            // Set up event handlers for peer connection
            this.setupPeerConnectionHandlers();
            
            // Show call UI
            this.showCallUI('Connecting to doctor...');
            this.callInProgress = true;
            
            console.log('Joining call...');
        } catch (error) {
            console.error('Error joining call:', error);
            this.showCallError('Could not access camera or microphone. Please check permissions.');
        }
    },
    
    // Handle an incoming call request
    handleCallRequest(signal) {
        if (this.role !== 'patient') return;
        
        const doctorName = signal.doctorName || 'Your doctor';
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'call-notification';
        notification.innerHTML = `
            <div class="call-notification-content">
                <h3>Incoming Video Call</h3>
                <p>${doctorName} is calling you for your appointment</p>
                <div class="call-notification-buttons">
                    <button class="accept-call-btn">Accept</button>
                    <button class="decline-call-btn">Decline</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add event listeners to buttons
        notification.querySelector('.accept-call-btn').addEventListener('click', () => {
            this.joinCall(signal);
            notification.remove();
        });
        
        notification.querySelector('.decline-call-btn').addEventListener('click', () => {
            this.sendSignal({
                type: 'call-ended',
                from: 'patient',
                to: 'doctor',
                appointmentId: signal.appointmentId,
                callId: signal.callId,
                reason: 'declined'
            });
            notification.remove();
        });
        
        // Auto-remove after 30 seconds if no action
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 30000);
    },
    
    // Set up WebRTC peer connection handlers
    setupPeerConnectionHandlers() {
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignal({
                    type: 'ice-candidate',
                    from: this.role,
                    to: this.role === 'doctor' ? 'patient' : 'doctor',
                    appointmentId: this.appointmentId,
                    callId: this.callId,
                    candidate: event.candidate
                });
            }
        };
        
        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState);
            
            if (this.peerConnection.connectionState === 'disconnected' || 
                this.peerConnection.connectionState === 'failed') {
                this.endCall();
            }
        };
        
        // Handle incoming tracks (remote video/audio)
        this.peerConnection.ontrack = (event) => {
            console.log('Remote track received');
            
            if (!this.remoteStream) {
                this.remoteStream = new MediaStream();
                this.remoteVideo.srcObject = this.remoteStream;
            }
            
            event.streams[0].getTracks().forEach(track => {
                this.remoteStream.addTrack(track);
            });
            
            // Update UI when remote stream is received
            this.updateCallUI('Connected');
        };
    },
    
    // Handle an incoming offer
    async handleOffer(signal) {
        if (this.role !== 'patient') return;
        
        try {
            // Save the appointment ID and call ID
            this.appointmentId = signal.appointmentId;
            this.callId = signal.callId;
            
            // Set the remote description (the offer)
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            
            // Create an answer
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            // Send the answer
            this.sendSignal({
                type: 'answer',
                from: 'patient',
                to: 'doctor',
                appointmentId: signal.appointmentId,
                callId: signal.callId,
                sdp: answer
            });
            
            console.log('Answered call');
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    },
    
    // Handle an incoming answer
    async handleAnswer(signal) {
        if (this.role !== 'doctor') return;
        
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            console.log('Call answer received and processed');
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    },
    
    // Handle an incoming ICE candidate
    async handleIceCandidate(signal) {
        try {
            if (this.peerConnection) {
                await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
                console.log('Added ICE candidate');
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    },
    
    // Handle call ended signal
    handleCallEnded(signal) {
        console.log('Remote party ended call:', signal.reason);
        this.endCallCleanup();
    },
    
    // End the call
    endCall() {
        console.log('Ending call');
        
        // Send end call signal
        this.sendSignal({
            type: 'call-ended',
            from: this.role,
            to: this.role === 'doctor' ? 'patient' : 'doctor',
            appointmentId: this.appointmentId,
            callId: this.callId,
            reason: 'ended'
        });
        
        // Clean up resources
        this.endCallCleanup();
    },
    
    // Clean up call resources
    endCallCleanup() {
        // Stop streams
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        if (this.remoteStream) {
            this.remoteStream = null;
        }
        
        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        // Reset video elements
        if (this.localVideo) this.localVideo.srcObject = null;
        if (this.remoteVideo) this.remoteVideo.srcObject = null;
        
        // Hide call UI
        this.hideCallUI();
        
        // Reset state
        this.callInProgress = false;
        this.callId = null;
        this.appointmentId = null;
        
        console.log('Call ended and cleaned up');
    },
    
    // Toggle local video
    toggleVideo() {
        if (!this.localStream) return;
        
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            
            // Update button icon
            const button = document.getElementById('toggle-video');
            if (button) {
                const icon = button.querySelector('.material-icons');
                icon.textContent = videoTrack.enabled ? 'videocam' : 'videocam_off';
            }
        }
    },
    
    // Toggle local audio
    toggleAudio() {
        if (!this.localStream) return;
        
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            
            // Update button icon
            const button = document.getElementById('toggle-audio');
            if (button) {
                const icon = button.querySelector('.material-icons');
                icon.textContent = audioTrack.enabled ? 'mic' : 'mic_off';
            }
        }
    },
    
    // Show call UI
    showCallUI(statusText = 'In call') {
        this.callContainer.classList.add('call-active');
        
        // Update status text if exists
        const statusElement = document.getElementById('call-status');
        if (statusElement) {
            statusElement.textContent = statusText;
        } else {
            const status = document.createElement('div');
            status.id = 'call-status';
            status.className = 'call-status';
            status.textContent = statusText;
            this.callContainer.appendChild(status);
        }
        
        // Show videos and controls
        this.localVideo.style.display = 'block';
        this.remoteVideo.style.display = 'block';
        this.callControls.style.display = 'flex';
    },
    
    // Update call UI
    updateCallUI(statusText) {
        const statusElement = document.getElementById('call-status');
        if (statusElement) {
            statusElement.textContent = statusText;
        }
    },
    
    // Show call error
    showCallError(errorMessage) {
        const errorElement = document.createElement('div');
        errorElement.className = 'call-error';
        errorElement.textContent = errorMessage;
        
        this.callContainer.appendChild(errorElement);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (this.callContainer.contains(errorElement)) {
                errorElement.remove();
            }
        }, 5000);
        
        // Clean up call resources
        this.endCallCleanup();
    },
    
    // Hide call UI
    hideCallUI() {
        this.callContainer.classList.remove('call-active');
        
        // Hide videos and controls
        this.localVideo.style.display = 'none';
        this.remoteVideo.style.display = 'none';
        this.callControls.style.display = 'none';
        
        // Remove status element
        const statusElement = document.getElementById('call-status');
        if (statusElement) {
            statusElement.remove();
        }
    },
    
    // Send a signal (in real app, would use WebSocket/signaling server)
    sendSignal(signal) {
        // For demo, use localStorage as a simple signaling mechanism
        localStorage.setItem('videoCallSignal', JSON.stringify(signal));
        
        // Log the signal for debugging
        console.log('Signal sent:', signal.type);
    }
};

// Add CSS for video call UI
document.head.insertAdjacentHTML('beforeend', `
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<style>
    .video-call-container {
        display: none;
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        height: 240px;
        background: #000;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        overflow: hidden;
        z-index: 1000;
    }
    
    .video-call-container.call-active {
        display: block;
    }
    
    .remote-video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .local-video {
        position: absolute;
        width: 80px;
        height: 120px;
        bottom: 10px;
        right: 10px;
        border-radius: 8px;
        border: 2px solid white;
        object-fit: cover;
        z-index: 1001;
    }
    
    .call-controls {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        padding: 8px;
        border-radius: 24px;
        background: rgba(0,0,0,0.5);
        z-index: 1002;
    }
    
    .call-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #444;
        border: none;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .call-btn:hover {
        background: #666;
    }
    
    .call-btn.end-call {
        background: #e53935;
    }
    
    .call-btn.end-call:hover {
        background: #c62828;
    }
    
    .call-status {
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.5);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1002;
    }
    
    .call-error {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255,59,48,0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        text-align: center;
        z-index: 1003;
    }
    
    .call-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        padding: 16px;
        z-index: 9999;
        max-width: 350px;
    }
    
    .call-notification h3 {
        margin: 0 0 8px 0;
        color: #333;
    }
    
    .call-notification p {
        margin: 0 0 16px 0;
        color: #666;
    }
    
    .call-notification-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    
    .accept-call-btn {
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
    }
    
    .decline-call-btn {
        background: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
    }
    
    .video-call-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .video-call-btn:hover {
        background: #2563eb;
    }
    
    .video-call-btn .material-icons {
        font-size: 16px;
    }
    
    /* Full screen mode for video call */
    .video-call-container.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
        z-index: 9999;
    }
    
    /* Toggle fullscreen button */
    .fullscreen-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.5);
        color: white;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1002;
    }
</style>
`); 