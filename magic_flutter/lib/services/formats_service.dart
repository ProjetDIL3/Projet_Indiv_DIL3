import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../models/format_model.dart';


class FormatsService {
  final String baseUrl = dotenv.env['API_BASE_URL'] ?? '';

  Future<Format> getFormatById(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/formats/$id'),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return Format.fromJson(data);
    } else {
      throw Exception('Échec du chargement du format');
    }
  }
}