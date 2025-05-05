import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import '../models/event_model.dart';
import '../models/user_model.dart';
import '../services/events_service.dart';

class CreateProvider with ChangeNotifier {
  final EventsService _eventsService = EventsService();
  
  bool _isLoading = false;
  String? _error;
  List<Map<String, dynamic>> _formats = [];
  Position? _currentPosition;
  
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Map<String, dynamic>> get formats => _formats;
  Position? get currentPosition => _currentPosition;


  Future<void> initialize() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _loadFormats();
      await _getCurrentLocation();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }


  Future<void> _loadFormats() async {
    try {
      _formats = await _eventsService.getAllFormats();
    } catch (e) {
      _error = 'Échec du chargement des formats: ${e.toString()}';
      rethrow;
    }
  }


  Future<void> _getCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Les services de localisation sont désactivés');
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Les permissions de localisation sont refusées');
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        throw Exception('Les permissions de localisation sont définitivement refusées');
      }

      _currentPosition = await Geolocator.getCurrentPosition();
    } catch (e) {
      _error = 'Erreur de localisation: ${e.toString()}';
      rethrow;
    }
  }


  Future<bool> createEvent({
    required String name,
    required DateTime date,
    required String formatId,
    required String email,
    required User currentUser,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      if (_currentPosition == null) {
        await _getCurrentLocation();
        if (_currentPosition == null) {
          throw Exception('Impossible d\'obtenir la position actuelle');
        }
      }

      final eventData = EventCreate(
        nom: name,
        horodate: date,
        latitude: _currentPosition!.latitude,
        longitude: _currentPosition!.longitude,
        email: email,
        idUtilisateur: currentUser.idUtilisateur,
        idFormat: formatId,
      );

      await _eventsService.createEvent(eventData);
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}