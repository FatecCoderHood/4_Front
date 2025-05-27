import { GeoRaster, GeoRasterLayer } from 'georaster-layer-for-leaflet'; 

export async function loadGeoTIFFWithGeoRaster(url: string, mapInstance: L.Map) {
  console.log('Iniciando fetch do GeoTIFF...');
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  console.log('Arquivo TIFF carregado, processando GeoRaster...');

  const georaster = await GeoRaster(arrayBuffer);
  console.log('GeoRaster:', georaster);


  const isMultiBand = georaster.numberOfRasters >= 3;

  const pixelValuesToColorFn = isMultiBand
    ? function (values: number[]) {
        if (!values) return null;

        const isNoData = values.some(
          (val, idx) => val === georaster.noDataValue || val === -9999
        );
        if (isNoData) return null;

        const normalize = (val: number, bandIndex: number) => {
          const min = georaster.mins[bandIndex];
          const max = georaster.maxs[bandIndex];
          const norm = (val - min) / (max - min);
          return Math.round(norm * 255);
        };

        const r = normalize(values[0], 0);
        const g = normalize(values[1], 1);
        const b = normalize(values[2], 2);

        return `rgb(${r}, ${g}, ${b})`;
      }
    : function (values: number[]) {
        const val = values[0];
        if (
          val === undefined ||
          val === null ||
          val === georaster.noDataValue ||
          val === -9999
        )
          return null;

        const gray = Math.round((val / georaster.maxs[0]) * 255);
        return `rgb(${gray},${gray},${gray})`;
      };

  const layer = new GeoRasterLayer({
    georaster,
    opacity: 1,
    resolution: 216,
    pixelValuesToColorFn,
    updateWhenZooming: false,
    tileSize: 256,
    chunkedLoading: true,
    keepBuffer: 5,
  });

  layer.on('load', () => {
    console.log('TIFF renderizado no mapa com sucesso!');
  });

  layer.addTo(mapInstance);

  if (layer.getBounds() && layer.getBounds().isValid()) {
    mapInstance.fitBounds(layer.getBounds());
    console.log('Ajustando mapa para bounds do TIFF');
  } else {
    mapInstance.setView([-15, -55], 5);
    console.warn('Bounds inválido, usando view padrão');
  }

  return layer; 
}
