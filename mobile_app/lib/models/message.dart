import 'user.dart';

class Message {
  final int id;
  final int conversationId;
  final int senderId;
  final String? content;
  final String messageType;
  final String? fileUrl;
  final String? readBy;
  final DateTime createdAt;
  final String? senderEmail;
  final String? senderName;

  Message({
    required this.id,
    required this.conversationId,
    required this.senderId,
    this.content,
    this.messageType = 'text',
    this.fileUrl,
    this.readBy,
    required this.createdAt,
    this.senderEmail,
    this.senderName,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'],
      conversationId: json['conversation_id'],
      senderId: json['sender_id'],
      content: json['content'],
      messageType: json['message_type'] ?? 'text',
      fileUrl: json['file_url'],
      readBy: json['read_by'],
      createdAt: DateTime.parse(json['created_at']),
      senderEmail: json['sender_email'],
      senderName: json['sender_name'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'conversation_id': conversationId,
      'sender_id': senderId,
      'content': content,
      'message_type': messageType,
      'file_url': fileUrl,
      'read_by': readBy,
      'created_at': createdAt.toIso8601String(),
    };
  }

  String get senderDisplayName => senderName ?? senderEmail ?? 'Unknown';

  bool isReadBy(int userId) {
    if (readBy == null) return false;
    try {
      final List<dynamic> readList = readBy!.contains('[') 
        ? _parseJsonList(readBy!)
        : [readBy];
      return readList.contains(userId);
    } catch (_) {
      return false;
    }
  }

  List<int> _parseJsonList(String json) {
    try {
      return List<int>.from(
        (json.replaceAll('[', '').replaceAll(']', '').split(','))
          .map((e) => int.tryParse(e.trim()) ?? 0)
          .where((e) => e > 0)
      );
    } catch (_) {
      return [];
    }
  }
}

class Conversation {
  final int id;
  final String type;
  final String? name;
  final DateTime createdAt;
  final List<User> participants;
  final Message? lastMessage;
  final int unreadCount;

  Conversation({
    required this.id,
    required this.type,
    this.name,
    required this.createdAt,
    this.participants = const [],
    this.lastMessage,
    this.unreadCount = 0,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'],
      type: json['type'] ?? 'direct',
      name: json['name'],
      createdAt: DateTime.parse(json['created_at']),
      participants: (json['participants'] as List<dynamic>?)
          ?.map((p) => User.fromJson(p))
          .toList() ?? [],
      lastMessage: json['last_message'] != null 
        ? Message(
            id: 0,
            conversationId: json['id'],
            senderId: 0,
            content: json['last_message'],
            createdAt: DateTime.tryParse(json['last_message_at'] ?? '') ?? DateTime.now(),
            senderName: json['last_message_sender']?['display_name'],
          )
        : null,
      unreadCount: json['unreadCount'] ?? 0,
    );
  }

  User? getOtherParticipant(int currentUserId) {
    return participants.firstWhere(
      (p) => p.id != currentUserId,
      orElse: () => participants.first,
    );
  }

  String getDisplayName(int currentUserId) {
    if (name != null && name!.isNotEmpty) return name!;
    final other = getOtherParticipant(currentUserId);
    return other?.displayNameOrEmail ?? 'Unknown';
  }
}