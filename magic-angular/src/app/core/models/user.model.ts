export interface User {
    IdUtilisateur: string;
    Nom: string;
    Prenom: string;
    Email: string;
    Mdepasse?: string; 
    RoleAdmin?: boolean;
}

export interface AuthUser {
    IdUtilisateur: string;
    RoleAdmin: boolean;
}