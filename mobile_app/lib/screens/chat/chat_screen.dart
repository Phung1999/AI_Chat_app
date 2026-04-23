import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/chat_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/call_provider.dart';
import '../../services/socket_service.dart';
import '../../models/message.dart';
import '../../config/theme.dart';
import '../../widgets/message_bubble.dart';
import '../call/video_call_screen.dart';

class ChatScreen extends StatefulWidget {
  final Conversation conversation;

  const ChatScreen({super.key, required this.conversation});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  List<Message> _messages = [];
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _loadMessages();
    _setupSocketListeners();
  }

  void _loadMessages() async {
    final chatProvider = context.read<ChatProvider>();
    await chatProvider.loadMessages(widget.conversation.id);
    setState(() {
      _messages = chatProvider.getMessages(widget.conversation.id);
    });
  }

  void _setupSocketListeners() {
    final socketService = context.read<SocketService>();
    socketService.joinConversation(widget.conversation.id);

    socketService.on('new_message', (data) {
      final message = Message.fromJson(data['message']);
      if (message.conversationId == widget.conversation.id) {
        setState(() {
          _messages.insert(0, message);
        });
      }
    });

    socketService.on('user_typing', (data) {
      if (data['conversationId'] == widget.conversation.id) {
        setState(() => _isTyping = true);
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) setState(() => _isTyping = false);
        });
      }
    });

    socketService.on('user_stop_typing', (data) {
      if (data['conversationId'] == widget.conversation.id) {
        setState(() => _isTyping = false);
      }
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    final socketService = context.read<SocketService>();
    socketService.leaveConversation(widget.conversation.id);
    super.dispose();
  }

  void _sendMessage() {
    final content = _messageController.text.trim();
    if (content.isEmpty) return;

    final socketService = context.read<SocketService>();
    socketService.sendMessage(widget.conversation.id, content);
    socketService.sendStopTyping(widget.conversation.id);
    _messageController.clear();
  }

  void _onTyping() {
    final socketService = context.read<SocketService>();
    socketService.sendTyping(widget.conversation.id);
  }

  void _startVideoCall() {
    final currentUser = context.read<AuthProvider>().user;
    final otherParticipant = widget.conversation.getOtherParticipant(currentUser!.id);
    if (otherParticipant != null) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => VideoCallScreen(user: otherParticipant),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = context.read<AuthProvider>().user;
    final otherParticipant = widget.conversation.getOtherParticipant(currentUser!.id);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppTheme.secondaryColor,
              child: Text(
                (otherParticipant?.displayName ?? 'U')[0].toUpperCase(),
                style: const TextStyle(color: Colors.white),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    otherParticipant?.displayName ?? widget.conversation.getDisplayName(currentUser.id),
                    style: const TextStyle(fontSize: 16),
                  ),
                  if (_isTyping)
                    Text(
                      'typing...',
                      style: TextStyle(fontSize: 12, color: Colors.white70),
                    )
                  else if (otherParticipant?.isOnline == true)
                    const Text(
                      'online',
                      style: TextStyle(fontSize: 12, color: Colors.white70),
                    ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.videocam),
            onPressed: _startVideoCall,
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _messages.isEmpty
                ? Center(
                    child: Text(
                      'No messages yet',
                      style: TextStyle(color: Colors.grey[500]),
                    ),
                  )
                : ListView.builder(
                    reverse: true,
                    controller: _scrollController,
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final message = _messages[index];
                      final isMe = message.senderId == currentUser.id;
                      return MessageBubble(
                        message: message,
                        isMe: isMe,
                      );
                    },
                  ),
          ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.2),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.attachment),
                    onPressed: () {},
                  ),
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        border: InputBorder.none,
                        filled: true,
                        fillColor: Colors.grey[100],
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                      ),
                      onChanged: (_) => _onTyping(),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send, color: AppTheme.accentColor),
                    onPressed: _sendMessage,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}