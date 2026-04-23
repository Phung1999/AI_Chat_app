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

  async initLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true,
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
    });

    this.peer.on('signal', (data) => {
      this.onSignal?.(data);
    });

    this.peer.on('stream', (stream) => {
      this.remoteStream = stream;
      this.onStream?.(stream);
    });

    this.peer.on('ice', (candidate) => {
      this.onCandidate?.(candidate);
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      this.onError?.(err);
    });

    return this.peer;
  }

  signal(data) {
    if (this.peer) {
      this.peer.signal(data);
    }
  }

  addIceCandidate(candidate) {
    if (this.peer) {
      this.peer.peer蛋蛋.addIceCandidate(candidate);
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
    }
    if (this.peer) {
      this.peer.destroy();
    }
    this.peer = null;
    this.localStream = null;
    this.remoteStream = null;
  }
}

export default WebRTCService;