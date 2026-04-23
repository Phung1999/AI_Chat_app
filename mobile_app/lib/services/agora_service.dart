import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:flutter/foundation.dart';

class AgoraService {
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;
  MediaStream? _remoteStream;
  RTCVideoRenderer? _localRenderer;
  RTCVideoRenderer? _remoteRenderer;

  final RTCPeerConnectionFactory _pcFactory = RTCPeerConnectionFactory(
    enableAudioRecorder: false,
    encodecType: MediaCodecType.hwCodec,
  );

  final Map<String, RTCIceCandidate> _queuedCandidates = {};
  bool _isInitialized = false;

  Function(MediaStream stream)? onLocalStream;
  Function(MediaStream stream)? onRemoteStream;
  Function(RTCIceCandidate candidate)? onIceCandidate;
  Function(RTCSessionDescription sdp)? onOffer;
  Function(RTCSessionDescription sdp)? onAnswer;

  bool get isInitialized => _isInitialized;
  MediaStream? get localStream => _localStream;
  MediaStream? get remoteStream => _remoteStream;

  Future<void> initialize() async {
    if (_isInitialized) return;

    final Map<String, dynamic> config = {
      'mandatory': {},
      'optional': [
        {'DtlsSrtpKeyAgreement': 'true'},
      ],
    };

    _peerConnection = _pcFactory.createPeerConnection(config);

    _peerConnection!.onIceCandidate = (candidate) {
      if (candidate != null) {
        onIceCandidate?.call(candidate);
      }
    };

    _peerConnection!.onAddStream = (stream) {
      _remoteStream = stream;
      onRemoteStream?.call(stream);
    };

    _peerConnection!.onSignalingState = (state) {
      debugPrint('Signaling state: $state');
    };

    _peerConnection!.onIceConnectionState = (state) {
      debugPrint('ICE connection state: $state');
    };

    _isInitialized = true;
  }

  Future<void> startLocalStream() async {
    final Map<String, dynamic> mediaConstraints = {
      'audio': true,
      'video': {
        'facingMode': 'user',
        'width': 640,
        'height': 480,
      },
    };

    try {
      _localStream = await _RTCVideoRenderer().createLocalMediaStream('local_stream');
      final audioTrack = await createAudioTrack('audio_track');
      final videoTrack = await createVideoTrack('video_track');
      
      if (audioTrack != null) {
        _localStream!.addTrack(audioTrack);
      }
      if (videoTrack != null) {
        _localStream!.addTrack(videoTrack);
      }

      onLocalStream?.call(_localStream!);
    } catch (e) {
      debugPrint('Error creating local stream: $e');
    }
  }

  Future<void> createOffer() async {
    if (_peerConnection == null) return;

    final RTCOfferOptions options = RTCOfferOptions(
      iceRestart: false,
      voiceActivityDetection: true,
    );

    final offer = await _peerConnection!.createOffer(options);
    await _peerConnection!.setLocalDescription(offer);
    onOffer?.call(offer);
  }

  Future<void> createAnswer() async {
    if (_peerConnection == null) return;

    final RTCAnswerOptions options = RTCAnswerOptions(
      voiceActivityDetection: true,
    );

    final answer = await _peerConnection!.createAnswer(options);
    await _peerConnection!.setLocalDescription(answer);
    onAnswer?.call(answer);
  }

  Future<void> setRemoteDescription(RTCSessionDescription sdp) async {
    if (_peerConnection == null) return;
    await _peerConnection!.setRemoteDescription(sdp);

    for (final candidate in _queuedCandidates.values) {
      await _peerConnection!.addCandidate(candidate);
    }
    _queuedCandidates.clear();
  }

  Future<void> addIceCandidate(RTCIceCandidate candidate) async {
    if (_peerConnection == null) return;

    if (_peerConnection!.remoteDescription == null) {
      final key = '${candidate.sdpMid}_${candidate.sdpMLineIndex}';
      _queuedCandidates[key] = candidate;
      return;
    }

    await _peerConnection!.addCandidate(candidate);
  }

  void addStream(MediaStream stream) {
    _peerConnection?.addStream(stream);
  }

  Future<void> toggleAudio(bool enabled) async {
    if (_localStream != null) {
      _localStream!.getAudioTracks().forEach((track) {
        track.enabled = enabled;
      });
    }
  }

  Future<void> toggleVideo(bool enabled) async {
    if (_localStream != null) {
      _localStream!.getVideoTracks().forEach((track) {
        track.enabled = enabled;
      });
    }
  }

  void dispose() {
    _localStream?.dispose();
    _remoteStream?.dispose();
    _peerConnection?.close();
    _peerConnection?.dispose();
    _localRenderer?.dispose();
    _remoteRenderer?.dispose();
    _isInitialized = false;
  }
}

Future<MediaStream> getUserMedia({
  bool audio = true,
  bool video = true,
  Map<String, dynamic>? videoConstraints,
}) async {
  final stream = await navigator.mediaDevices.getUserMedia({
    'audio': audio,
    'video': video ? (videoConstraints ?? {
      'facingMode': 'user',
      'width': 640,
      'height': 480,
    }) : false,
  });
  return stream;
}