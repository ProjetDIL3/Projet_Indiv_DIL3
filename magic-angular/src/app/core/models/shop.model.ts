import * as L from 'leaflet';

export interface Shop {
    IdMagasin: string;
    Nom: string;
    NumeroRue: string;
    Rue: string;
    CP: string;
    Ville: string;
    Telephone: string;
    SiteWeb?: string;
    IdUtilisateur: string;
    position?: L.LatLngExpression;
}

// Interface pour les données de magasin utilisées dans la carte
export interface ShopWithPosition {
    id: string;
    name: string;
    address: string;
    position: L.LatLngExpression;
}
  