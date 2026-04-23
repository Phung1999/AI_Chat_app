import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/message.dart';
import '../models/user.dart';

class ChatProvider with ChangeNotifier {
  final ApiService _apiService;

  List<Conversation> _conversations = [];
  Map<int, List<Message>> _messages = {};
  Map<int, bool> _typingStatus = {};
  Map<int, int> _unreadCount = {};
  bool _isLoading = false;
  String? _error;

  ChatProvider({required ApiService apiService}) : _apiService = apiService;

  List<Conversation> get conversations => _conversations;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Message> getMessages(int conversationId) => _messages[conversationId] ?? [];
  bool isTyping(int conversationId) => _typingStatus[conversationId] ?? false;
  int getUnreadCount(int conversationId) => _unreadCount[conversationId] ?? 0;
  int get totalUnreadCount => _unreadCount.values.fold(0, (sum, count) => sum + count);

  Future<void> loadConversations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.get('/conversations');
      if (response.data['success'] == true) {
        _conversations = (response.data['data'] as List)
            .map((c) => Conversation.fromJson(c))
            .toList();
      }
    } catch (e) {
      _error = _apiService.handleError(e)['message'];
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadMessages(int conversationId, {int limit = 50, int offset = 0}) async {
    try {
      final response = await _apiService.get(
        '/conversations/$conversationId/messages',
        queryParameters: {'limit': limit, 'offset': offset},
      );
      if (response.data['success'] == true) {
        final messages = (response.data['data'] as List)
            .map((m) => Message.fromJson(m))
            .toList();
        _messages[conversationId] = messages;
        notifyListeners();
      }
    } catch (e) {
      _error = _apiService.handleError(e)['message'];
      notifyListeners();
    }
  }

  Future<Conversation?> getOrCreateConversation(int participantId) async {
    try {
      final response = await _apiService.post('/conversations', data: {
        'participantId': participantId,
      });
      if (response.data['success'] == true) {
        final conversation = Conversation.fromJson(response.data['data']);
        final existingIndex = _conversations.indexWhere((c) => c.id == conversation.id);
        if (existingIndex >= 0) {
          _conversations[existingIndex] = conversation;
        } else {
          _conversations.insert(0, conversation);
        }
        notifyListeners();
        return conversation;
      }
    } catch (e) {
      _error = _apiService.handleError(e)['message'];
    }
    return null;
  }

  void addMessage(int conversationId, Message message) {
    _messages.putIfAbsent(conversationId, () => []);
    final existingIndex = _messages[conversationId]!.indexWhere((m) => m.id == message.id);
    if (existingIndex < 0) {
      _messages[conversationId]!.insert(0, message);
      _messages[conversationId]!.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    }
    notifyListeners();
  }

  void setTypingStatus(int conversationId, bool isTyping) {
    _typingStatus[conversationId] = isTyping;
    notifyListeners();
  }

  void incrementUnread(int conversationId) {
    _unreadCount[conversationId] = (_unreadCount[conversationId] ?? 0) + 1;
    notifyListeners();
  }

  void markAsRead(int conversationId) {
    _unreadCount[conversationId] = 0;
    _apiService.post('/conversations/$conversationId/read').catchError((_) {});
    notifyListeners();
  }

  Future<List<User>> searchUsers(String query) async {
    try {
      final response = await _apiService.get('/users/search', queryParameters: {'q': query});
      if (response.data['success'] == true) {
        return (response.data['data'] as List)
            .map((u) => User.fromJson(u))
            .toList();
      }
    } catch (e) {
      _error = _apiService.handleError(e)['message'];
    }
    return [];
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}