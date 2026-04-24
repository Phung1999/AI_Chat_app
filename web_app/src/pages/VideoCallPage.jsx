import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import { socketService } from '../services/socket';
import useAuthStore from '../store/authStore';

export default function VideoCallPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [callStatus, setCallStatus] = useState('calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const onSignal = (data) => {
    try {
      if (callStatus === 'calling') {
        socketService.sendOffer(parseInt(userId), data);
      } else {
        socketService.sendAnswer(parseInt(userId), data);
      }
    } catch (err) {
      console.error('Signal error:', err);
    }
  };

  const onStream = (stream) => {
    setRemoteStream(stream);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  };

  const onError = (err) => {
    console.error('WebRTC error:', err);
    setError(err.message || 'Connection failed');
    setCallStatus('error');
  };

  const { initLocalStream, signal, toggleAudio, toggleVideo, destroy } = useWebRTC({
    onSignal,
    onStream,
    onError,
  });

  useEffect(() => {
    let mounted = true;

    const startCall = async () => {
      try {
        const stream = await initLocalStream();
        if (!mounted) return;
        
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        socketService.callUser(parseInt(userId));
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to start call:', err);
        setError('Không thể truy cập camera/microphone');
        setCallStatus('error');
      }
    };

    startCall();

    const handleCallAccepted = () => setCallStatus('connected');
    const handleCallDeclined = () => {
      setCallStatus('declined');
      setError('Người dùng từ chối cuộc gọi');
    };
    const handleCallEnded = () => {
      setCallStatus('ended');
      setTimeout(() => navigate('/'), 2000);
    };
    const handleOffer = (data) => signal(data);
    const handleAnswer = (data) => signal(data);
    const handleIceCandidate = (data) => signal({ candidate: data.candidate });

    socketService.on('call_accepted', handleCallAccepted);
    socketService.on('call_declined', handleCallDeclined);
    socketService.on('call_ended', handleCallEnded);
    socketService.on('offer', handleOffer);
    socketService.on('answer', handleAnswer);
    socketService.on('ice_candidate', handleIceCandidate);

    return () => {
      mounted = false;
      destroy();
      socketService.off('call_accepted', handleCallAccepted);
      socketService.off('call_declined', handleCallDeclined);
      socketService.off('call_ended', handleCallEnded);
      socketService.off('offer', handleOffer);
      socketService.off('answer', handleAnswer);
      socketService.off('ice_candidate', handleIceCandidate);
    };
  }, [userId]);

  const endCall = () => {
    socketService.endCall(0);
    destroy();
    navigate('/');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toggleAudio(!isMuted);
  };

  const toggleVideoOff = () => {
    setIsVideoOff(!isVideoOff);
    toggleVideo(!isVideoOff);
  };

  const getCallStatusText = () => {
    switch (callStatus) {
      case 'calling': return 'Đang gọi...';
      case 'connected': return 'Đã kết nối';
      case 'declined': return 'Từ chối';
      case 'ended': return 'Cuộc gọi kết thúc';
      case 'error': return 'Lỗi kết nối';
      default: return 'Đang kết nối...';
    }
  };

  return (
    <div className="videocall-container">
      <div className="videocall-video-container">
        <div className="videocall-remote-video">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="videocall-video" />
          ) : (
            <div className="videocall-placeholder">
              <div className="videocall-avatar">
                {(user?.display_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <p className="videocall-status-text">{getCallStatusText()}</p>
              {error && <p className="videocall-error-text">{error}</p>}
            </div>
          )}
        </div>
        
        <div className="videocall-local-video">
          {!isVideoOff ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="videocall-video" />
          ) : (
            <div className="videocall-video-off">
              <span className="material-symbols-rounded">videocam_off</span>
            </div>
          )}
        </div>
      </div>

      <div className="videocall-controls">
        <button
          onClick={toggleMute}
          className={`videocall-btn ${isMuted ? 'videocall-btn--active' : ''}`}
          title={isMuted ? 'Bật mic' : 'Tắt mic'}
        >
          <span className="material-symbols-rounded">
            {isMuted ? 'mic_off' : 'mic'}
          </span>
        </button>

        <button onClick={endCall} className="videocall-btn videocall-btn--end" title="Kết thúc">
          <span className="material-symbols-rounded">call_end</span>
        </button>

        <button
          onClick={toggleVideoOff}
          className={`videocall-btn ${isVideoOff ? 'videocall-btn--active' : ''}`}
          title={isVideoOff ? 'Bật camera' : 'Tắt camera'}
        >
          <span className="material-symbols-rounded">
            {isVideoOff ? 'videocam_off' : 'videocam'}
          </span>
        </button>
      </div>
    </div>
  );
}