import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/user_model.dart';
import '../utils/token_manager.dart';

class AuthService {
  static final String _apiBaseUrl = dotenv.env['API_BASE_URL'] ?? '';


  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$_apiBaseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'Email': email,
          'password': password,
        }),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        await TokenManager.handleLoginResponse(responseData);
      
        final userData = responseData['user'];
        final user = User(
          idUtilisateur: userData['IdUtilisateur'],
          nom: userData['Nom'] ?? '',
          prenom: userData['Prenom'] ?? '',
          email: email,
          roleAdmin: userData['RoleAdmin'] ?? false,
          accessToken: responseData['accessToken'],
        );

        return {
          'success': true,
          'user': user,
        };
      } else {
        return {
          'success': false,
          'message': responseData['message'] ?? 'Login failed',
        };
      }
    } catch (e) {
      print('Error during login: $e');
      return {
        'success': false,
        'message': 'Connection error. Please try again later.',
      };
    }
  }


  static Future<bool> logout() async {
    return await TokenManager.logout();
  }

  static Future<bool> isAuthenticated() async {
    final token = await TokenManager.getValidAccessToken();
    return token != null;
  }
}