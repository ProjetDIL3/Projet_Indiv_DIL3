import 'package:flutter/material.dart';
import '../models/event_model.dart';
import '../services/events_service.dart';
import '../utils/geocoding_service.dart';
import 'dart:math' as math;

class EventsProvider extends ChangeNotifier {
  final EventsService _eventsService = EventsService();
  List<MTGEvent> _events = [];
  List<MTGEvent> _filteredEvents = [];
  bool _isLoading = false;
  bool _hasMore = true;
  int _currentPage = 1;
  String _cityFilter = '';
  bool _isFiltering = false;

  List<MTGEvent> get events => _isFiltering ? _filteredEvents : _events;
  bool get isLoading => _isLoading;
  bool get hasMore => !_isFiltering && _hasMore;
  String get cityFilter => _cityFilter;

  Future<void> loadEvents() async {
    if (_isLoading || !_hasMore || _isFiltering) return;

    _isLoading = true;
    notifyListeners();

    try {
      final newEvents = await _eventsService.getAllEvents(_currentPage);
      _events.addAll(newEvents);
      _hasMore = newEvents.length == 30;
      _currentPage++;
    } catch (e) {
      debugPrint('Erreur de chargement: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void refresh() {
    _events = [];
    _filteredEvents = [];
    _cityFilter = '';
    _isFiltering = false;
    _currentPage = 1;
    _hasMore = true;
    loadEvents();
  }

  Future<void> filterByCity(String cityName) async {
    if (cityName.isEmpty) {
      clearCityFilter();
      return;
    }

    _isLoading = true;
    _cityFilter = cityName;
    _isFiltering = true;
    notifyListeners();

    try {
      final locationData = await NominatimProxyService.geocodeAddress(cityName);
      if (locationData != null) {
        final lat = locationData['lat'];
        final lng = locationData['lng'];
        
        _filteredEvents = _events.where((event) {
          final distance = _calculateDistance(
            event.latitude, 
            event.longitude, 
            lat, 
            lng
          );

          return distance <= 20;
        }).toList();
      } else {
        _filteredEvents = [];
      }
    } catch (e) {
      debugPrint('Erreur lors du filtrage par ville: $e');
      _filteredEvents = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearCityFilter() {
    _cityFilter = '';
    _isFiltering = false;
    notifyListeners();
  }

  // Formula di Haversine
 double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
  const p = 0.017453292519943295; 
  final a = 0.5 - 
    (0.5 * math.cos((lat2 - lat1) * p)) + 
    (math.cos(lat1 * p)) * 
    (math.cos(lat2 * p)) * 
    (1 - math.cos((lon2 - lon1) * p));
  return 12742 * math.asin(math.sqrt(a)); 
}
}