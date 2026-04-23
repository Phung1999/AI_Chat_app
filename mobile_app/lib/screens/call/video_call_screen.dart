import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:provider/provider.dart';
import '../../providers/call_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/user.dart';
import '../../config/theme.dart';

class VideoCallScreen extends StatefulWidget {
  final User user;

  const VideoCallScreen({super.key, required this.user});

  @override
  State<VideoCallScreen> createState() => _VideoCallScreenState();
}

class _VideoCallScreenState extends State<VideoCallScreen> {
  final RTCVideoRenderer _localRenderer = RTCVideoRenderer();
  final RTCVideoRenderer _remoteRenderer = RTCVideoRenderer();
  bool _isInitialized = false;
  bool _isConnecting = true;

  @override
  void initState() {
    super.initState();
    _initRenderers();
    _startCall();
  }

  Future<void> _initRenderers() async {
    await _localRenderer.initialize();
    await _remoteRenderer.initialize();
    setState(() => _isInitialized = true);
  }

  void _startCall() {
    final callProvider = context.read<CallProvider>();
    callProvider.initiateCall(widget.user);
    
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _isConnecting = false);
      }
    });
  }

  @override
  void dispose() {
    _localRenderer.dispose();
    _remoteRenderer.dispose();
    super.dispose();
  }

  void _endCall() {
    final callProvider = context.read<CallProvider>();
    callProvider.endCall();
    Navigator.pop(context);
  }

  void _toggleMute() {
    final callProvider = context.read<CallProvider>();
    callProvider.toggleMute();
  }

  void _toggleVideo() {
    final callProvider = context.read<CallProvider>();
    callProvider.toggleVideo();
  }

  void _switchCamera() {
    // Implement camera switch if needed
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              child: _isInitialized
                  ? RTCVideoView(_remoteRenderer, objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover)
                  : Container(
                      color: Colors.grey[900],
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircleAvatar(
                              radius: 50,
                              backgroundColor: AppTheme.primaryColor,
                              child: Text(
                                widget.user.displayNameOrEmail[0].toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 40,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              widget.user.displayNameOrEmail,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _isConnecting ? 'Calling...' : 'Connected',
                              style: TextStyle(
                                color: Colors.grey[400],
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
            ),
            Positioned(
              top: 16,
              right: 16,
              child: SizedBox(
                width: 120,
                height: 160,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: _isInitialized
                      ? RTCVideoView(_localRenderer, mirror: true)
                      : Container(color: Colors.grey[800]),
                ),
              ),
            ),
            Positioned(
              bottom: 32,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildControlButton(
                    icon: Icons.mic,
                    isActive: false,
                    onTap: _toggleMute,
                  ),
                  const SizedBox(width: 24),
                  _buildControlButton(
                    icon: Icons.call_end,
                    isEnd: true,
                    onTap: _endCall,
                  ),
                  const SizedBox(width: 24),
                  _buildControlButton(
                    icon: Icons.videocam,
                    isActive: false,
                    onTap: _toggleVideo,
                  ),
                  const SizedBox(width: 24),
                  _buildControlButton(
                    icon: Icons.flip_camera_ios,
                    isActive: false,
                    onTap: _switchCamera,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    bool isActive = true,
    bool isEnd = false,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isEnd ? Colors.red : (isActive ? Colors.white24 : Colors.white),
        ),
        child: Icon(
          icon,
          color: isEnd ? Colors.white : Colors.white,
          size: 28,
        ),
      ),
    );
  }
}