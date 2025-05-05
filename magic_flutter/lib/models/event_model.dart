class MTGEvent {
  final String idEvenement;
  final String nom;
  final String? description;
  final DateTime horodate;
  final int? prix;
  final String? typeEvenement;
  final double latitude;
  final double longitude;
  final String? nomContact;
  final String email;
  final String? image;
  final String idUtilisateur;
  final String idFormat;
  final String? idMagasin;

  
  final String? nomFormat;
  final String? formatLink;
  final String? magasinNom;
  final String? numeroRue;
  final String? rue;
  final String? cp;
  final String? ville;
  final String? magasinTelephone;
  final String? magasinSiteWeb;

  MTGEvent({
    required this.idEvenement,
    required this.nom,
    this.description,
    required this.horodate,
    this.prix,
    this.typeEvenement,
    required this.latitude,
    required this.longitude,
    this.nomContact,
    required this.email,
    this.image,
    required this.idUtilisateur,
    required this.idFormat,
    this.idMagasin,
    this.nomFormat,
    this.formatLink,
    this.magasinNom,
    this.numeroRue,
    this.rue,
    this.cp,
    this.ville,
    this.magasinTelephone,
    this.magasinSiteWeb,
  });

  factory MTGEvent.fromJson(Map<String, dynamic> json) {
    return MTGEvent(
      idEvenement: json['IdEvenement'] as String,
      nom: json['Nom'] as String,
      description: json['Description'],
      horodate: DateTime.parse(json['Horodate']),
      prix: json['Prix'],
      typeEvenement: json['TypeEvenement'],
      latitude: json['Latitude'] is int 
          ? (json['Latitude'] as int).toDouble() 
          : json['Latitude'],
      longitude: json['Longitude'] is int 
          ? (json['Longitude'] as int).toDouble() 
          : json['Longitude'],
      nomContact: json['NomContact'],
      email: json['Email'] as String,
      image: json['Image'],
      idUtilisateur: json['IdUtilisateur'] as String,
      idFormat: json['IdFormat'] as String,
      idMagasin: json['IdMagasin'],
      nomFormat: json['NomFormat'],
      formatLink: json['FormatLink'],
      magasinNom: json['MagasinNom'],
      numeroRue: json['NumeroRue'],
      rue: json['Rue'],
      cp: json['CP'],
      ville: json['Ville'],
      magasinTelephone: json['MagasinTelephone'],
      magasinSiteWeb: json['MagasinSiteWeb'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'IdEvenement': idEvenement,
      'Nom': nom,
      'Description': description,
      'Horodate': horodate.toIso8601String(),
      'Prix': prix,
      'TypeEvenement': typeEvenement,
      'Latitude': latitude,
      'Longitude': longitude,
      'NomContact': nomContact,
      'Email': email,
      'Image': image,
      'IdUtilisateur': idUtilisateur,
      'IdFormat': idFormat,
      'IdMagasin': idMagasin,
      'NomFormat': nomFormat,
      'FormatLink': formatLink,
      'MagasinNom': magasinNom,
      'NumeroRue': numeroRue,
      'Rue': rue,
      'CP': cp,
      'Ville': ville,
      'MagasinTelephone': magasinTelephone,
      'MagasinSiteWeb': magasinSiteWeb,
    };
  }

}

// For creating new events (without requiring IdEvenement)
class EventCreate {
  final String? idEvenement; 
  final String nom;
  final String? description;
  final DateTime horodate;
  final int? prix;
  final String? typeEvenement;
  final double latitude;
  final double longitude;
  final String? nomContact;
  final String email;
  final String? image;
  final String idUtilisateur;
  final String idFormat;
  final String? idMagasin;

  EventCreate({
    this.idEvenement,
    required this.nom,
    this.description,
    required this.horodate,
    this.prix,
    this.typeEvenement,
    required this.latitude,
    required this.longitude,
    this.nomContact,
    required this.email,
    this.image,
    required this.idUtilisateur,
    required this.idFormat,
    this.idMagasin,
  });

  Map<String, dynamic> toJson() {
    final map = {
      'Nom': nom,
      'Description': description,
      'Horodate': horodate.toIso8601String(),
      'Prix': prix,
      'TypeEvenement': typeEvenement,
      'Latitude': latitude,
      'Longitude': longitude,
      'NomContact': nomContact,
      'Email': email,
      'Image': image,
      'IdUtilisateur': idUtilisateur,
      'IdFormat': idFormat,
      'IdMagasin': idMagasin,
    };

    if (idEvenement != null) {
      map['IdEvenement'] = idEvenement;
    }
    
    return map;
  }
}