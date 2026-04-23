import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/constants.dart';

typedef SocketCallback = void Function(dynamic data);
typedef ErrorCallback = void Function(dynamic error);

class SocketService {
  io.Socket? _socket;
  int? _userId;
  bool _isConnected = false;

  final Map<String, List<SocketCallback>> _listeners = {};
  final Map<String, List<ErrorCallback>> _errorListeners = {};

  bool get isConnected => _isConnected;

  void connect(int userId) {
    _userId = userId;
    _socket = io.io(
      AppConstants.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'userId': userId.toString()})
          .enableAutoConnect()
          .enableReconnection()
          .build(),
    );

    _socket!.onConnect((_) {
      _isConnected = true;
      _emit('connect', {'userId': userId});
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      _emit('disconnect', null);
    });

    _socket!.onConnectError((error) {
      _emitError('connect_error', error);
    });

    _socket!.onError((error) {
      _emitError('error', error);
    });

    _setupListeners();
  }

  void _setupListeners() {
    final events = [
      'new_message',
      'user_typing',
      'user_stop_typing',
      'user_online',
      'user_offline',
      'incoming_call',
      'call_initiated',
      'call_accepted',
      'call_declined',
      'call_started',
      'call_ended',
      'offer',
      'answer',
      'ice_candidate',
      'notification',
    ];

    for (final event in events) {
      _socket!.on(event, (data) {
        _emit(event, data);
      });
    }
  }

  void joinConversation(int conversationId) {
    _socket?.emit('join_conversation', conversationId);
  }

  void leaveConversation(int conversationId) {
    _socket?.emit('leave_conversation', conversationId);
  }

  void sendMessage(int conversationId, String content, {String type = 'text', String? fileUrl}) {
    _socket?.emit('send_message', {
      'conversationId': conversationId,
      'content': content,
      'messageType': type,
      'fileUrl': fileUrl,
    });
  }

  void sendTyping(int conversationId) {
    _socket?.emit('typing', {'conversationId': conversationId});
  }

  void sendStopTyping(int conversationId) {
    _socket?.emit('stop_typing', {'conversationId': conversationId});
  }

  void callUser(int calleeId, {String callType = 'video'}) {
    _socket?.emit('call_user', {
      'calleeId': calleeId,
      'callType': callType,
    });
  }

  void acceptCall(int callId) {
    _socket?.emit('accept_call', {'callId': callId});
  }

  void declineCall(int callId) {
    _socket?.emit('decline_call', {'callId': callId});
  }

  void endCall(int callId) {
    _socket?.emit('end_call', {'callId': callId});
  }

  void sendOffer(int calleeId, dynamic sdp) {
    _socket?.emit('offer', {'calleeId': calleeId, 'sdp': sdp});
  }

  void sendAnswer(int callerId, dynamic sdp) {
    _socket?.emit('answer', {'callerId': callerId, 'sdp': sdp});
  }

  void sendIceCandidate(int targetId, dynamic candidate) {
    _socket?.emit('ice_candidate', {'targetId': targetId, 'candidate': candidate});
  }

  void on(String event, SocketCallback callback) {
    _listeners.putIfAbsent(event, () => []).add(callback);
  }

  void off(String event, [SocketCallback? callback]) {
    if (callback != null) {
      _listeners[event]?.remove(callback);
    } else {
      _listeners.remove(event);
    }
  }

  void onError(String event, ErrorCallback callback) {
    _errorListeners.putIfAbsent(event, () => []).add(callback);
  }

  void _emit(String event, dynamic data) {
    final callbacks = _listeners[event];
    if (callbacks != null) {
      for (final callback in callbacks) {
        callback(data);
      }
    }
  }

  void _emitError(String event, dynamic error) {
    final callbacks = _errorListeners[event];
    if (callbacks != null) {
      for (final callback in callbacks) {
        callback(error);
      }
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
    _userId = null;
  }
}