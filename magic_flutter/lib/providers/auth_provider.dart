import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  String? _error;

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _currentUser != null;


  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await AuthService.login(email, password);
      
      if (result['success']) {
        _currentUser = result['user'];
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result['message'];
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'An unexpected error occurred';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }


  Future<bool> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      final success = await AuthService.logout();
      if (success) {
        _currentUser = null;
      }
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _error = 'Logout failed';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }


  Future<void> checkAuthStatus() async {
    _isLoading = true;
    notifyListeners();

    try {
      final isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        _currentUser = null;
      }
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Authentication check failed';
      _isLoading = false;
      notifyListeners();
    }
  }


  void clearError() {
    _error = null;
    notifyListeners();
  }
}