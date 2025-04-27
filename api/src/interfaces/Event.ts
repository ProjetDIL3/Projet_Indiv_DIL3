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
  }