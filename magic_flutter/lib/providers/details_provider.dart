import 'package:flutter/material.dart';
import '../models/event_model.dart';
import '../services/events_service.dart';
import '../services/formats_service.dart';
import '../services/shops_service.dart';
import '../utils/geocoding_service.dart';

class EventDetailsProvider extends ChangeNotifier {
  final EventsService _eventsService = EventsService();
  final FormatsService _formatsService = FormatsService();
  final ShopsService _shopsService = ShopsService();
  
  MTGEvent? _event;
  String? _address;
  bool _isLoading = false;
  String? _error;
  
  MTGEvent? get event => _event;
  String? get address => _address;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  Future<void> loadEventDetails(String eventId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final eventData = await _eventsService.getEventById(eventId);
      _event = eventData;
      notifyListeners();
      
      await Future.wait([
        _loadFormatDetails(eventData.idFormat),
        _loadShopDetails(eventData.idMagasin),
        _loadAddress(eventData.latitude, eventData.longitude),
      ]);
    } catch (e) {
      _error = e.toString();
      debugPrint('Erreur lors du chargement des détails: $_error');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  Future<void> _loadFormatDetails(String formatId) async {
    if (formatId.isEmpty || _event == null) return;
    
    try {
      final format = await _formatsService.getFormatById(formatId);
      
      _event = MTGEvent(
        idEvenement: _event!.idEvenement,
        nom: _event!.nom,
        description: _event!.description,
        horodate: _event!.horodate,
        prix: _event!.prix,
        typeEvenement: _event!.typeEvenement,
        latitude: _event!.latitude,
        longitude: _event!.longitude,
        nomContact: _event!.nomContact,
        email: _event!.email,
        image: _event!.image,
        idUtilisateur: _event!.idUtilisateur,
        idFormat: _event!.idFormat,
        idMagasin: _event!.idMagasin,
        nomFormat: format.name,
        formatLink: format.link,

        magasinNom: _event!.magasinNom,
        numeroRue: _event!.numeroRue,
        rue: _event!.rue,
        cp: _event!.cp,
        ville: _event!.ville,
        magasinTelephone: _event!.magasinTelephone,
        magasinSiteWeb: _event!.magasinSiteWeb,
      );
      notifyListeners();
    } catch (e) {
      debugPrint('Erreur lors du chargement des détails du format: $e');
    }
  }
  
  Future<void> _loadShopDetails(String? shopId) async {
    if (shopId == null || shopId.isEmpty || _event == null) return;
    
    try {
      final shop = await _shopsService.getShopById(shopId);
      

      _event = MTGEvent(
        idEvenement: _event!.idEvenement,
        nom: _event!.nom,
        description: _event!.description,
        horodate: _event!.horodate,
        prix: _event!.prix,
        typeEvenement: _event!.typeEvenement,
        latitude: _event!.latitude,
        longitude: _event!.longitude,
        nomContact: _event!.nomContact,
        email: _event!.email,
        image: _event!.image,
        idUtilisateur: _event!.idUtilisateur,
        idFormat: _event!.idFormat,
        idMagasin: _event!.idMagasin,
        nomFormat: _event!.nomFormat,
        formatLink: _event!.formatLink,

        magasinNom: shop.name,
        numeroRue: shop.numeroRue,
        rue: shop.rue,
        cp: shop.cp,
        ville: shop.ville,
        magasinTelephone: shop.telephone,
        magasinSiteWeb: shop.siteWeb,
      );
      notifyListeners();
    } catch (e) {
      debugPrint('Erreur lors du chargement des détails du magasin: $e');
    }
  }
  
  Future<void> _loadAddress(double latitude, double longitude) async {
    try {
      final geoData = await NominatimProxyService.reverseGeocode(latitude, longitude);
      if (geoData != null) {
        _address = geoData['display_name'];
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Erreur lors du géocodage inverse: $e');
    }
  }
  
  void reset() {
    _event = null;
    _address = null;
    _isLoading = false;
    _error = null;
  }
}