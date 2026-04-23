import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import { socketService } from '../services/socket';
import useAuthStore from '../store/authStore';
import { COLORS } from '../services/constants';

export default function VideoCallPage() {
  const { userId } = useParams();
  const { user } = useAuthStore();
  const [callStatus, setCallStatus] = useState('calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const onSignal = (data) => {
    if (callStatus === 'calling') {
      socketService.sendOffer(parseInt(userId), data);
    } else {
      socketService.sendAnswer(parseInt(userId), data);
    }
  };

  const onStream = (stream) => {
    setRemoteStream(stream);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  };

  const onError = (error) => {
    console.error('WebRTC error:', error);
    setCallStatus('error');
  };

  const { initLocalStream, signal, toggleAudio, toggleVideo, destroy } = useWebRTC({
    onSignal,
    onStream,
    onError,
  });

  useEffect(() => {
    const startCall = async () => {
      try {
        const stream = await initLocalStream();
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        socketService.callUser(parseInt(userId));
      } catch (error) {
        console.error('Failed to start call:', error);
        setCallStatus('error');
      }
    };

    startCall();

    socketService.on('call_accepted', () => {
      setCallStatus('connected');
    });

    socketService.on('call_declined', () => {
      setCallStatus('declined');
    });

    socketService.on('call_ended', () => {
      setCallStatus('ended');
    });

    socketService.on('offer', (data) => {
      signal(data);
    });

    socketService.on('answer', (data) => {
      signal(data);
    });

    socketService.on('ice_candidate', (data) => {
      signal({ candidate: data.candidate });
    });

    return () => {
      destroy();
    };
  }, [userId]);

  const endCall = () => {
    socketService.endCall(0);
    destroy();
    window.close();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toggleAudio(!isMuted);
  };

  const toggleVideoOff = () => {
    setIsVideoOff(!isVideoOff);
    toggleVideo(!isVideoOff);
  };

  return (
    <div style={styles.container}>
      <div style={styles.videoContainer}>
        <div style={styles.remoteVideo}>
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
          ) : (
            <div style={styles.placeholder}>
              <div style={styles.avatar}>U</div>
              <p>{callStatus === 'calling' ? 'Calling...' : 'Connecting...'}</p>
            </div>
          )}
        </div>
        <div style={styles.localVideo}>
          <video ref={localVideoRef} autoPlay playsInline muted style={styles.video} />
        </div>
      </div>

      <div style={styles.controls}>
        <button
          onClick={toggleMute}
          style={{ ...styles.btn, backgroundColor: isMuted ? COLORS.error : '#333' }}
        >
          <span className="material-symbols-rounded">
            {isMuted ? 'mic_off' : 'mic'}
          </span>
        </button>

        <button onClick={endCall} style={{ ...styles.btn, ...styles.endBtn }}>
          <span className="material-symbols-rounded">call_end</span>
        </button>

        <button
          onClick={toggleVideoOff}
          style={{ ...styles.btn, backgroundColor: isVideoOff ? COLORS.error : '#333' }}
        >
          <span className="material-symbols-rounded">
            {isVideoOff ? 'videocam_off' : 'videocam'}
          </span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#fff',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    backgroundColor: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48,
    marginBottom: 16,
  },
  localVideo: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 160,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#333',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtn: {
    backgroundColor: COLORS.error,
  },
};