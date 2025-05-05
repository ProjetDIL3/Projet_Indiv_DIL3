import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../models/shop_model.dart';

class ShopsService {
  final String baseUrl = dotenv.env['API_BASE_URL'] ?? '';

  Future<Shop> getShopById(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/shops/$id'),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Shop.fromJson(data);
    } else {
      throw Exception('Échec du chargement du magasin');
    }
  }
}