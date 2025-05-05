class User {
  final String idUtilisateur;
  final String nom;
  final String prenom;
  final String email;
  String? mdepasse;
  bool? roleAdmin;
  String? accessToken;

  User({
    required this.idUtilisateur,
    required this.nom,
    required this.prenom,
    required this.email,
    this.mdepasse,
    this.roleAdmin = false,
    this.accessToken,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      idUtilisateur: json['IdUtilisateur'] as String,
      nom: json['Nom'] as String,
      prenom: json['Prenom'] as String,
      email: json['Email'] as String,
      roleAdmin: json['RoleAdmin'] ?? false,
      accessToken: json['token'], 
    );
  }

    Map<String, dynamic> toJson() {
    return {
      'IdUtilisateur': idUtilisateur,
      'Nom': nom,
      'Prenom': prenom,
      'Email': email,
      'Mdepasse': mdepasse,
      'RoleAdmin': roleAdmin,
    };
  }
}
