export interface Farm {
  id?: string;
  nome: string;
  cidade: string;
  estado: string;
  status?: string;
  talhoes: Talhao[];
}

export interface Talhao {
  id: number;  // Alterado de string para number
  mnTl?: number;
  areaHaTl?: number;
  solo?: string;
  cultura?: string;
  safra?: string;
  coordinates?: number[][][];
  geojson?: any;
  produtividadePorAno?: number;
  status?: string;
  ervasDaninhas?: string[];
}

export interface GeoJsonData {
  type: string;
  features: Feature[];
}

export interface Feature {
  type: string;
  geometry: Geometry;
  properties: Record<string, any>;
}

export interface Geometry {
  type: string;
  coordinates: any;
}

export interface User {
  id: string;
  nome: string;
  numeroNomeAnalyst?: number;
  horasAnalisadas?: number;
  quantidadeTalhoes?: number;
}

