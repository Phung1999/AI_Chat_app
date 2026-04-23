class User {
  final int id;
  final String email;
  final String? displayName;
  final String? avatarUrl;
  final int onlineStatus;
  final DateTime? createdAt;

  User({
    required this.id,
    required this.email,
    this.displayName,
    this.avatarUrl,
    this.onlineStatus = 0,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'] ?? '',
      displayName: json['display_name'],
      avatarUrl: json['avatar_url'],
      onlineStatus: json['online_status'] ?? 0,
      createdAt: json['created_at'] != null 
        ? DateTime.tryParse(json['created_at']) 
        : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'display_name': displayName,
      'avatar_url': avatarUrl,
      'online_status': onlineStatus,
    };
  }

  bool get isOnline => onlineStatus == 1;

  String get displayNameOrEmail => displayName ?? email;

  User copyWith({
    int? id,
    String? email,
    String? displayName,
    String? avatarUrl,
    int? onlineStatus,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      displayName: displayName ?? this.displayName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      onlineStatus: onlineStatus ?? this.onlineStatus,
      createdAt: createdAt,
    );
  }
}