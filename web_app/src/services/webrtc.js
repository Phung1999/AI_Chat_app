import Peer from 'simple-peer';

class WebRTCService {
  constructor() {
    this.peer = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onSignal = null;
    this.onStream = null;
    this.onCandidate = null;
    this.onError = null;
  }

  get iceServers() {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];
  }

  async initLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      return this.localStream;
    } catch (error) {
      console.error('Failed to get local stream:', error);
      this.onError?.(error);
      throw error;
    }
  }

  createPeer(isInitiator, stream) {
    this.peer = new Peer({
      initiator: isInitiator,
      trickle: true,
      stream: stream || this.localStream,
      config: {
        iceServers: this.iceServers,
      },
    });

    this.peer.on('signal', (data) => {
      if (this.onSignal) {
        this.onSignal(data);
      }
    });

    this.peer.on('stream', (stream) => {
      this.remoteStream = stream;
      if (this.onStream) {
        this.onStream(stream);
      }
    });

    this.peer.on('ice', (candidate) => {
      if (this.onCandidate) {
        this.onCandidate(candidate);
      }
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      if (this.onError) {
        this.onError(err);
      }
    });

    return this.peer;
  }

  signal(data) {
    if (this.peer && data) {
      try {
        this.peer.signal(data);
      } catch (error) {
        console.error('Signal error:', error);
      }
    }
  }

  addIceCandidate(candidate) {
    if (this.peer && this.peer._pc && candidate) {
      try {
        const iceCandidate = new RTCIceCandidate(candidate);
        this.peer._pc.addIceCandidate(iceCandidate);
      } catch (error) {
        console.error('Add ICE candidate error:', error);
      }
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  destroy() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (error) {
        console.error('Destroy peer error:', error);
      }
      this.peer = null;
    }
    this.remoteStream = null;
  }
}

export default WebRTCService;