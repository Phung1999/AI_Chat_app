import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../services/agora_service.dart';
import '../models/user.dart';
import '../models/api_response.dart';

enum CallState { idle, calling, ringing, connected, ended }

class CallProvider with ChangeNotifier {
  final ApiService _apiService;
  final SocketService _socketService;
  final AgoraService _agoraService;

  CallState _state = CallState.idle;
  User? _remoteUser;
  int? _currentCallId;
  bool _isMuted = false;
  bool _isVideoEnabled = true;
  String? _error;

  CallProvider({
    required ApiService apiService,
    required SocketService socketService,
    required AgoraService agoraService,
  })  : _apiService = apiService,
        _socketService = socketService,
        _agoraService = agoraService {
    _setupSocketListeners();
  }

  CallState get state => _state;
  User? get remoteUser => _remoteUser;
  int? get currentCallId => _currentCallId;
  bool get isMuted => _isMuted;
  bool get isVideoEnabled => _isVideoEnabled;
  String? get error => _error;

  void _setupSocketListeners() {
    _socketService.on('incoming_call', (data) {
      _handleIncomingCall(data);
    });

    _socketService.on('call_accepted', (data) {
      _handleCallAccepted(data);
    });

    _socketService.on('call_declined', (data) {
      _handleCallDeclined(data);
    });

    _socketService.on('call_started', (data) {
      _state = CallState.connected;
      notifyListeners();
    });

    _socketService.on('call_ended', (data) {
      _endCall();
    });

    _socketService.on('offer', (data) {
      _handleOffer(data);
    });

    _socketService.on('answer', (data) {
      _handleAnswer(data);
    });

    _socketService.on('ice_candidate', (data) {
      _handleIceCandidate(data);
    });
  }

  void _handleIncomingCall(dynamic data) {
    _currentCallId = data['callId'];
    _remoteUser = User.fromJson(data['caller']);
    _state = CallState.ringing;
    notifyListeners();
  }

  void _handleCallAccepted(dynamic data) {
    _state = CallState.connected;
    _agoraService.createOffer();
    notifyListeners();
  }

  void _handleCallDeclined(dynamic data) {
    _state = CallState.ended;
    _error = 'Call declined';
    notifyListeners();
    Future.delayed(const Duration(seconds: 2), () {
      _resetState();
    });
  }

  Future<void> _handleOffer(dynamic data) async {
    try {
      final sdp = data['sdp'];
      await _agoraService.setRemoteDescription(RTCSessionDescription(sdp['sdp'], sdp['type']));
      await _agoraService.createAnswer();
    } catch (e) {
      debugPrint('Error handling offer: $e');
    }
  }

  Future<void> _handleAnswer(dynamic data) async {
    try {
      final sdp = data['sdp'];
      await _agoraService.setRemoteDescription(RTCSessionDescription(sdp['sdp'], sdp['type']));
    } catch (e) {
      debugPrint('Error handling answer: $e');
    }
  }

  Future<void> _handleIceCandidate(dynamic data) async {
    try {
      final candidate = RTCIceCandidate(
        data['candidate']['candidate'],
        data['candidate']['sdpMid'],
        data['candidate']['sdpMLineIndex'],
      );
      await _agoraService.addIceCandidate(candidate);
    } catch (e) {
      debugPrint('Error handling ICE candidate: $e');
    }
  }

  Future<void> initiateCall(User user) async {
    _remoteUser = user;
    _state = CallState.calling;
    notifyListeners();

    await _agoraService.initialize();
    await _agoraService.startLocalStream();
    _socketService.callUser(user.id);
  }

  Future<void> acceptCall() async {
    if (_currentCallId == null) return;

    await _agoraService.initialize();
    await _agoraService.startLocalStream();
    _socketService.acceptCall(_currentCallId!);
    _state = CallState.connected;
    notifyListeners();
  }

  void declineCall() {
    if (_currentCallId == null) return;
    _socketService.declineCall(_currentCallId!);
    _resetState();
  }

  void endCall() {
    if (_currentCallId != null) {
      _socketService.endCall(_currentCallId!);
    }
    _endCall();
  }

  void _endCall() {
    _agoraService.dispose();
    _state = CallState.ended;
    notifyListeners();
    Future.delayed(const Duration(seconds: 1), () {
      _resetState();
    });
  }

  void _resetState() {
    _state = CallState.idle;
    _remoteUser = null;
    _currentCallId = null;
    _isMuted = false;
    _isVideoEnabled = true;
    _error = null;
    notifyListeners();
  }

  void toggleMute() {
    _isMuted = !_isMuted;
    _agoraService.toggleAudio(!_isMuted);
    notifyListeners();
  }

  void toggleVideo() {
    _isVideoEnabled = !_isVideoEnabled;
    _agoraService.toggleVideo(_isVideoEnabled);
    notifyListeners();
  }

  Future<List<ContactData>> getContacts() async {
    try {
      final response = await _apiService.get('/contacts');
      if (response.data['success'] == true) {
        final contactsResponse = ContactsResponse.fromJson(response.data['data']);
        return contactsResponse.contacts;
      }
    } catch (e) {
      _error = _apiService.handleError(e)['message'];
    }
    return [];
  }
}

class RTCSessionDescription {
  final String sdp;
  final String type;
  RTCSessionDescription({required this.sdp, required this.type});
}

class RTCIceCandidate {
  final String candidate;
  final String? sdpMid;
  final int? sdpMLineIndex;
  RTCIceCandidate(this.candidate, this.sdpMid, this.sdpMLineIndex);
}