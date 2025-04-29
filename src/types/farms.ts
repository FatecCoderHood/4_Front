export interface Farm {
  id?: string;
  nome: string;
  cidade: string;
  estado: string;
  status?: string;
}

export interface Talhao {
  id?: string;
  mnTl?: number;  // Mn TL do talhão
  areaHaTl?: number;  // Área do talhão em hectares
  solo?: string;  // Tipo de solo
  cultura?: string;  // Cultura plantada
  safra?: string;  // Safra
  coordinates?: number[][][];  // Coordenadas GeoJSON, que normalmente é um array de arrays (polígono)
  geojson?: any;  // Dados do GeoJSON
  produtividadePorAno?: number;
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
  coordinates: any;  // Pode ser um array de coordenadas ou objetos, dependendo do tipo de geometria (p.ex., Polygon, Point)
}

