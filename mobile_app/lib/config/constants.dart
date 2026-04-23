class AppConstants {
  static const String appName = 'ChatApp';
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  static const String socketUrl = 'http://10.0.2.2:3000';
  static const String agoraAppId = 'YOUR_AGORA_APP_ID';
  
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration socketTimeout = Duration(seconds: 10);
  
  static const int messagePageSize = 50;
  static const int searchResultLimit = 20;
}

class StorageKeys {
  static const String token = 'auth_token';
  static const String userId = 'user_id';
  static const String userEmail = 'user_email';
  static const String userName = 'user_name';
}

class RouteNames {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String chat = '/chat';
  static const String videoCall = '/video-call';
}