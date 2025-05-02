export interface Event {
  IdEvenement: string;
  Nom: string;
  Description?: string;
  Horodate: string;
  Prix?: number;
  TypeEvenement?: string;
  Latitude: number;
  Longitude: number;
  NomContact?: string;
  Email: string;
  Image?: string;
  IdUtilisateur: string;
  IdFormat: string;
  IdMagasin?: string;

  NomFormat?: string;
  FormatLink?: string;
  MagasinNom?: string;
  NumeroRue?: string;
  Rue?: string;
  CP?: string;
  Ville?: string;
  MagasinTelephone?: string;
  MagasinSiteWeb?: string;
}

// Pour la création d'un événement.
export interface EventCreate extends Omit<Event, 'IdEvenement'> {
  IdEvenement?: string;
}

