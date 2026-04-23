class ApiResponse<T> {
  final bool success;
  final T? data;
  final ApiError? error;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'] ?? false,
      data: json['data'] != null && fromJsonT != null 
        ? fromJsonT(json['data']) 
        : json['data'],
      error: json['error'] != null 
        ? ApiError.fromJson(json['error']) 
        : null,
    );
  }
}

class ApiError {
  final String code;
  final String message;

  ApiError({
    required this.code,
    required this.message,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      code: json['code'] ?? 'UNKNOWN',
      message: json['message'] ?? 'Unknown error',
    );
  }
}

class AuthResponse {
  final UserData user;
  final String token;

  AuthResponse({
    required this.user,
    required this.token,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      user: UserData.fromJson(json['user']),
      token: json['token'],
    );
  }
}

class UserData {
  final int id;
  final String email;
  final String? displayName;
  final String? avatarUrl;
  final int onlineStatus;

  UserData({
    required this.id,
    required this.email,
    this.displayName,
    this.avatarUrl,
    this.onlineStatus = 0,
  });

  factory UserData.fromJson(Map<String, dynamic> json) {
    return UserData(
      id: json['id'],
      email: json['email'] ?? '',
      displayName: json['display_name'],
      avatarUrl: json['avatar_url'],
      onlineStatus: json['online_status'] ?? 0,
    );
  }
}

class ContactsResponse {
  final List<ContactData> contacts;
  final List<ContactData> pending;

  ContactsResponse({
    required this.contacts,
    required this.pending,
  });

  factory ContactsResponse.fromJson(Map<String, dynamic> json) {
    return ContactsResponse(
      contacts: (json['contacts'] as List<dynamic>?)
          ?.map((c) => ContactData.fromJson(c))
          .toList() ?? [],
      pending: (json['pending'] as List<dynamic>?)
          ?.map((c) => ContactData.fromJson(c))
          .toList() ?? [],
    );
  }
}

class ContactData {
  final int id;
  final String email;
  final String? displayName;
  final String? avatarUrl;
  final int onlineStatus;
  final String status;
  final DateTime? createdAt;

  ContactData({
    required this.id,
    required this.email,
    this.displayName,
    this.avatarUrl,
    this.onlineStatus = 0,
    this.status = 'pending',
    this.createdAt,
  });

  factory ContactData.fromJson(Map<String, dynamic> json) {
    return ContactData(
      id: json['id'],
      email: json['email'] ?? '',
      displayName: json['display_name'],
      avatarUrl: json['avatar_url'],
      onlineStatus: json['online_status'] ?? 0,
      status: json['status'] ?? 'pending',
      createdAt: json['created_at'] != null 
        ? DateTime.tryParse(json['created_at']) 
        : null,
    );
  }

  String get displayNameOrEmail => displayName ?? email;
  bool get isOnline => onlineStatus == 1;
}