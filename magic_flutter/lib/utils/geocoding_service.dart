import 'dart:convert';
import 'package:http/http.dart' as http;

class NominatimProxyService {
  static const String nominatimBaseUrl = 'https://nominatim.openstreetmap.org';
  static const Map<String, String> headers = {
    'User-Agent': 'MagicEventsApp/1.0 (Flutter)',
  };

  static final Map<String, dynamic> _cache = {};

  static Future<Map<String, dynamic>?> geocodeAddress(String address) async {
    final cacheKey = 'geocode:$address';
    if (_cache.containsKey(cacheKey)) {
      return _cache[cacheKey];
    }

    try {
      final fullAddress = Uri.encodeComponent('$address, France');
      
      final url = '$nominatimBaseUrl/search?q=$fullAddress&format=json&limit=1&addressdetails=1&countrycodes=fr';
      
      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        if (data.isNotEmpty) {
          final result = {
            'lat': double.parse(data[0]['lat']),
            'lng': double.parse(data[0]['lon']),
            'display_name': data[0]['display_name'],
          };
          
        
          _cache[cacheKey] = result;
          return result;
        }
      }
      return null;
    } catch (e) {
      print('Erreur de géocodage via proxy: $e');
      return null;
    }
  }

  static Future<Map<String, dynamic>?> reverseGeocode(double lat, double lng) async {
    final cacheKey = 'reverse:$lat:$lng';
    if (_cache.containsKey(cacheKey)) {
      return _cache[cacheKey];
    }

    try {
      final url = '$nominatimBaseUrl/reverse?lat=$lat&lon=$lng&format=json&addressdetails=1';
      
      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        _cache[cacheKey] = data;
        return data;
      }
      return null;
    } catch (e) {
      print('Erreur de géocodage inverse via proxy: $e');
      return null;
    }
  }

  static Future<void> delay() {
    return Future.delayed(const Duration(milliseconds: 1100));
  }
}