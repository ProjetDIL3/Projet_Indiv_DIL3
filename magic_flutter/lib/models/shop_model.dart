class Shop {
  final String id;
  final String name;
  final String? numeroRue;
  final String? rue;
  final String? cp;
  final String? ville;
  final String? telephone;
  final String? siteWeb;

  Shop({
    required this.id,
    required this.name,
    this.numeroRue,
    this.rue,
    this.cp,
    this.ville,
    this.telephone,
    this.siteWeb,
  });

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      id: json['IdMagasin'],
      name: json['Nom'],
      numeroRue: json['NumeroRue'],
      rue: json['Rue'],
      cp: json['CP'],
      ville: json['Ville'],
      telephone: json['Telephone'],
      siteWeb: json['SiteWeb'],
    );
  }
}