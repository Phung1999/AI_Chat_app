import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../models/user.dart';
import '../models/api_response.dart';
import '../config/constants.dart';

enum AuthState { initial, loading, authenticated, unauthenticated, error }

class AuthProvider with ChangeNotifier {
  final ApiService _apiService;
  final SocketService _socketService;

  AuthState _state = AuthState.initial;
  User? _user;
  String? _token;
  String? _error;

  AuthProvider({
    required ApiService apiService,
    required SocketService socketService,
  })  : _apiService = apiService,
        _socketService = socketService;

  AuthState get state => _state;
  User? get user => _user;
  String? get token => _token;
  String? get error => _error;
  bool get isAuthenticated => _state == AuthState.authenticated;

  Future<void> checkAuth() async {
    _state = AuthState.loading;
    notifyListeners();

    try {
      await _apiService.loadToken();
      if (_apiService.hasToken) {
        final response = await _apiService.get('/auth/me');
        if (response.data['success'] == true) {
          _user = User.fromJson(response.data['data']);
          _token = (await SharedPreferences.getInstance()).getString(StorageKeys.token);
          _socketService.connect(_user!.id);
          _state = AuthState.authenticated;
        } else {
          await _apiService.clearToken();
          _state = AuthState.unauthenticated;
        }
      } else {
        _state = AuthState.unauthenticated;
      }
    } catch (e) {
      _state = AuthState.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _state = AuthState.loading;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.data['success'] == true) {
        final authData = AuthResponse.fromJson(response.data['data']);
        _user = User(
          id: authData.user.id,
          email: authData.user.email,
          displayName: authData.user.displayName,
          avatarUrl: authData.user.avatarUrl,
          onlineStatus: 1,
        );
        _token = authData.token;
        await _apiService.setToken(_token!);
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setInt(StorageKeys.userId, _user!.id);
        
        _socketService.connect(_user!.id);
        _state = AuthState.authenticated;
        notifyListeners();
        return true;
      } else {
        _error = response.data['error']?['message'] ?? 'Login failed';
        _state = AuthState.error;
        notifyListeners();
        return false;
      }
    } catch (e) {
      final errorInfo = _apiService.handleError(e);
      _error = errorInfo['message'];
      _state = AuthState.error;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String email, String password, String? displayName) async {
    _state = AuthState.loading;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.post('/auth/register', data: {
        'email': email,
        'password': password,
        'displayName': displayName,
      });

      if (response.data['success'] == true) {
        final authData = AuthResponse.fromJson(response.data['data']);
        _user = User(
          id: authData.user.id,
          email: authData.user.email,
          displayName: authData.user.displayName,
          onlineStatus: 1,
        );
        _token = authData.token;
        await _apiService.setToken(_token!);
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setInt(StorageKeys.userId, _user!.id);
        
        _socketService.connect(_user!.id);
        _state = AuthState.authenticated;
        notifyListeners();
        return true;
      } else {
        _error = response.data['error']?['message'] ?? 'Registration failed';
        _state = AuthState.error;
        notifyListeners();
        return false;
      }
    } catch (e) {
      final errorInfo = _apiService.handleError(e);
      _error = errorInfo['message'];
      _state = AuthState.error;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _apiService.post('/auth/logout');
    } catch (_) {}
    
    _socketService.disconnect();
    await _apiService.clearToken();
    
    _user = null;
    _token = null;
    _state = AuthState.unauthenticated;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    if (_state == AuthState.error) {
      _state = AuthState.unauthenticated;
    }
    notifyListeners();
  }
}