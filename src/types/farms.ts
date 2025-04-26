export interface Farm {
    id?: string;
    nome: string;
    cidade: string;
    estado: string;
  }
  
  export interface Talhao {
    id?: string;
    mnTl?: number;
    areaHaTl?: number;
    solo?: string;
    cultura?: string;
    safra?: string;
    coordinates?: any;
  }
  
  export interface GeoJsonData {
    type: string;
    features: any[];
  }