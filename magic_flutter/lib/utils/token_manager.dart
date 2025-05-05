import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:universal_html/html.dart' as html;
import 'dart:convert';
import 'package:http/http.dart' as http;


class TokenManager {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'auth_token';
  static const _csrfTokenKey = 'csrf_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _tokenExpiryKey = 'token_expiry';
  
  static final String _apiBaseUrl =  dotenv.env['API_BASE_URL'] ?? '';

  static Future<void> saveToken(String token) async {
    if (kIsWeb) {
      html.window.localStorage[_tokenKey] = token;
    } else {
      await _storage.write(key: _tokenKey, value: token);
    }
    

    final expiryTime = DateTime.now().add(Duration(minutes: 15)).millisecondsSinceEpoch.toString();
    if (kIsWeb) {
      html.window.localStorage[_tokenExpiryKey] = expiryTime;
    } else {
      await _storage.write(key: _tokenExpiryKey, value: expiryTime);
    }
  }

  static Future<String?> getToken() async {
    if (kIsWeb) {
      return html.window.localStorage[_tokenKey];
    } else {
      return await _storage.read(key: _tokenKey);
    }
  }

  static Future<void> deleteToken() async {
    if (kIsWeb) {
      html.window.localStorage.remove(_tokenKey);
      html.window.localStorage.remove(_tokenExpiryKey);
    } else {
      await _storage.delete(key: _tokenKey);
      await _storage.delete(key: _tokenExpiryKey);
    }
  }
  

  static Future<void> saveCsrfToken(String token) async {
    if (kIsWeb) {
      html.window.localStorage[_csrfTokenKey] = token;
    } else {
      await _storage.write(key: _csrfTokenKey, value: token);
    }
  }

  static Future<String?> getCsrfToken() async {
    if (kIsWeb) {
      return html.window.localStorage[_csrfTokenKey];
    } else {
      return await _storage.read(key: _csrfTokenKey);
    }
  }

  static Future<void> deleteCsrfToken() async {
    if (kIsWeb) {
      html.window.localStorage.remove(_csrfTokenKey);
    } else {
      await _storage.delete(key: _csrfTokenKey);
    }
  }
  

  static Future<void> saveRefreshToken(String token) async {
    if (kIsWeb) {
      html.window.localStorage[_refreshTokenKey] = token;
    } else {
      await _storage.write(key: _refreshTokenKey, value: token);
    }
  }

  static Future<String?> getRefreshToken() async {
    if (kIsWeb) {
      return html.window.localStorage[_refreshTokenKey];
    } else {
      return await _storage.read(key: _refreshTokenKey);
    }
  }

  static Future<void> deleteRefreshToken() async {
    if (kIsWeb) {
      html.window.localStorage.remove(_refreshTokenKey);
    } else {
      await _storage.delete(key: _refreshTokenKey);
    }
  }
  
  // Sauvegarde tous les tokens à la fois
  static Future<void> saveAllTokens({
    required String accessToken,
    required String refreshToken,
    required String csrfToken,
  }) async {
    await saveToken(accessToken);
    await saveRefreshToken(refreshToken);
    await saveCsrfToken(csrfToken);
  }
  
  // Suppression de tous les tokens à la fois
  static Future<void> clearAllTokens() async {
    await deleteToken();
    await deleteRefreshToken();
    await deleteCsrfToken();
  }
  
  // Check if access token is expired
  static Future<bool> isTokenExpired() async {
    String? expiryTimeStr;
    
    if (kIsWeb) {
      expiryTimeStr = html.window.localStorage[_tokenExpiryKey];
    } else {
      expiryTimeStr = await _storage.read(key: _tokenExpiryKey);
    }
    
    if (expiryTimeStr == null) return true;
    
    final expiryTime = DateTime.fromMillisecondsSinceEpoch(int.parse(expiryTimeStr));
    return DateTime.now().isAfter(expiryTime);
  }
  
  // Refresh the access token using refresh token
  static Future<bool> refreshAccessToken() async {
    final refreshToken = await getRefreshToken();
    if (refreshToken == null) return false;
    
    try {
      final response = await http.post(
        Uri.parse('$_apiBaseUrl/auth/refresh'), // Updated endpoint to match backend
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'refreshToken': refreshToken}),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        // Update to match AuthController's response format
        if (data.containsKey('accessToken')) {
          await saveToken(data['accessToken']);
        } else {
          return false;
        }
        
        // If a new CSRF token is also provided, save it
        if (data.containsKey('csrfToken')) {
          await saveCsrfToken(data['csrfToken']);
        }
        
        return true;
      }
      return false;
    } catch (e) {
      print('Error refreshing token: $e');
      return false;
    }
  }
  
  // Add method to handle initial login response
  static Future<bool> handleLoginResponse(Map<String, dynamic> responseData) async {
    try {
      if (responseData.containsKey('accessToken') && 
          responseData.containsKey('refreshToken') && 
          responseData.containsKey('csrfToken')) {
        
        await saveAllTokens(
          accessToken: responseData['accessToken'],
          refreshToken: responseData['refreshToken'],
          csrfToken: responseData['csrfToken'],
        );
        return true;
      }
      return false;
    } catch (e) {
      print('Error handling login response: $e');
      return false;
    }
  }
  
  // Add method for logout
  static Future<bool> logout() async {
    final refreshToken = await getRefreshToken();
    if (refreshToken == null) {
      await clearAllTokens();
      return true;
    }
    
    try {
      final response = await http.post(
        Uri.parse('$_apiBaseUrl/auth/logout'),
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': await getCsrfToken() ?? '',
        },
        body: jsonEncode({'refreshToken': refreshToken}),
      );
      
      // Clear tokens regardless of response
      await clearAllTokens();
      return response.statusCode >= 200 && response.statusCode < 300;
    } catch (e) {
      // Clear tokens even if request fails
      await clearAllTokens();
      print('Error during logout: $e');
      return false;
    }
  }
  
  // Helper to get auth headers for API requests
  static Future<Map<String, String>> getAuthHeaders() async {
    final token = await getValidAccessToken();
    final csrfToken = await getCsrfToken();
    
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
    
    if (csrfToken != null) {
      headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
    return headers;
  }

  // Get valid access token (refreshes automatically if needed)
  static Future<String?> getValidAccessToken() async {
    if (await isTokenExpired()) {
      final refreshed = await refreshAccessToken();
      if (!refreshed) return null;
    }
    return getToken();
  }
}
