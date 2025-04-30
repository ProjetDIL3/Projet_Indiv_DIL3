export interface User {
    IdUtilisateur: string;
    Nom: string;
    Prenom: string;
    Email: string;
    Mdepasse?: string; // Meglio renderlo opzionale con ? per sicurezza
    RoleAdmin?: boolean;
}

export interface AuthUser {
    IdUtilisateur: string;
    RoleAdmin: boolean;
}