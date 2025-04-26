export interface Farm {
    id?: string;
    nome: string;
    cidade: string;
    estado: string;
    status?: string;
  }
  
  export interface Talhao {
    id?: string;
    mnTl?: number;
    areaHaTl?: number;
    solo?: string;
    cultura?: string;
    safra?: string;
    coordinates?: any;
    geojson?: any;
  }
  
  export interface GeoJsonData {
    type: string;
    features?: any[];
    geometry?: {
      type: string;
      coordinates: any[];
    };
    properties?: Record<string, any>;
  }