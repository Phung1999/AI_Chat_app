import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'config/constants.dart';
import 'services/api_service.dart';
import 'services/socket_service.dart';
import 'services/agora_service.dart';
import 'providers/auth_provider.dart';
import 'providers/chat_provider.dart';
import 'providers/call_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/home/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final _apiService = ApiService();
  final _socketService = SocketService();
  final _agoraService = AgoraService();

  bool _isLoading = true;
  bool _showRegister = false;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(
            apiService: _apiService,
            socketService: _socketService,
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => ChatProvider(apiService: _apiService),
        ),
        ChangeNotifierProvider(
          create: (_) => CallProvider(
            apiService: _apiService,
            socketService: _socketService,
            agoraService: _agoraService,
          ),
        ),
        Provider.value(value: _socketService),
      ],
      child: MaterialApp(
        title: AppConstants.appName,
        theme: AppTheme.lightTheme,
        debugShowCheckedModeBanner: false,
        initialRoute: RouteNames.splash,
        routes: {
          RouteNames.splash: (context) => _buildSplash(),
          RouteNames.login: (context) => LoginScreen(
            onRegisterTap: () => setState(() => _showRegister = true),
          ),
          RouteNames.register: (context) => RegisterScreen(
            onLoginTap: () => setState(() => _showRegister = false),
          ),
          RouteNames.home: (context) => const HomeScreen(),
        },
      ),
    );
  }

  Widget _buildSplash() {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppTheme.primaryColor,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.chat_bubble_outline,
                size: 80,
                color: Colors.white,
              ),
              const SizedBox(height: 24),
              Text(
                AppConstants.appName,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 32),
              const CircularProgressIndicator(color: Colors.white),
            ],
          ),
        ),
      );
    }

    return _showRegister
        ? RegisterScreen(onLoginTap: () => setState(() => _showRegister = false))
        : LoginScreen(onRegisterTap: () => setState(() => _showRegister = true));
  }
}