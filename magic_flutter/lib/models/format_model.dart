class Format {
  final String id;
  final String name;
  final String? link;

  Format({
    required this.id,
    required this.name,
    this.link,
  });

  factory Format.fromJson(Map<String, dynamic> json) {
    return Format(
      id: json['IdFormat'],
      name: json['NomFormat'],
      link: json['Link'],
    );
  }
}