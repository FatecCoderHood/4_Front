import type { Layer } from 'leaflet';

export interface WeedProperties {
  CLASSE: string;
  AREA_M2: number;
  NM_TL: string | number;
}

export interface Geometry {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

export interface WeedFeature {
  type: 'Feature';
  properties: WeedProperties;
  geometry: Geometry;
}

export interface Talhao {
  id: number | string;
  nome?: string;
  mnTl?: string | number;
  areaHaTl?: number;
  solo?: string;
  cultura?: string;
  safra?: string;
  produtividadePorAno?: number;
  ervasDaninhas?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  geometry?: any;
}

export interface WeedsOverlayState {
  showWeedsOverlay: boolean;
  weedsLayers: Layer[];
}