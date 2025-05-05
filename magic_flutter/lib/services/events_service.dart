import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../models/event_model.dart';
import '../utils/token_manager.dart';

class EventsService {
  final String baseUrl = dotenv.env['API_BASE_URL'] ?? '';

  Future<List<MTGEvent>> getAllEvents(int page) async {
    final response = await http.get(
      Uri.parse('$baseUrl/events?page=$page&limit=30'),
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => MTGEvent.fromJson(json)).toList();
    } else {
      throw Exception('Échec du chargement des événements');
    }
  }

    Future<MTGEvent> getEventById(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/events/$id'),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return MTGEvent.fromJson(data);
    } else {
      throw Exception('Échec du chargement des détails de l\'événement');
    }
  }

  Future<MTGEvent> createEvent(EventCreate eventData) async {
    try {
      final headers = await TokenManager.getAuthHeaders();
      
      final response = await http.post(
        Uri.parse('$baseUrl/events'),
        headers: headers,
        body: json.encode(eventData.toJson()),
      );

      if (response.statusCode == 201) {
        final data = json.decode(response.body);
        return MTGEvent.fromJson(data);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Échec de la création de l\'événement');
      }
    } catch (e) {
      throw Exception('Erreur lors de la création de l\'événement: ${e.toString()}');
    }
  }

  Future<List<Map<String, dynamic>>> getAllFormats() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/formats'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.cast<Map<String, dynamic>>();
      } else {
        throw Exception('Échec du chargement des formats');
      }
    } catch (e) {
      throw Exception('Erreur lors du chargement des formats: ${e.toString()}');
    }
  }
}
