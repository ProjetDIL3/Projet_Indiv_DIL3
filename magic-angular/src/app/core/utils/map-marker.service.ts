import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MapMarkerService {
  
  createShopMarker(position: L.LatLng, shopName: string, shopId: string): L.Marker {
    const marker = L.marker(position);
    
    // Créer un popup avec contenu HTML
    const popupContent = `
      <div class="shop-popup">
        <h4>${shopName}</h4>
        <button class="select-shop-btn" data-shop-id="${shopId}">Sélectionner</button>
      </div>
    `;
    
    marker.bindPopup(popupContent);
    return marker;
  }
  
  createSelectedLocationMarker(position: L.LatLng): L.Marker {
    const redIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    return L.marker(position, { icon: redIcon });
  }
}