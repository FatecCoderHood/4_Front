<route>
  {
    "meta": {
      "title": "MainMap"
    }
  }
</route>

<script setup lang="ts">
import L, { LatLng, LatLngExpression, LeafletMouseEvent, Marker, Polygon, polygon } from 'leaflet';
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet/dist/leaflet.css';
import { onMounted, onUnmounted, ref } from 'vue';
// --- ADIÇÃO: Importar Axios ---
import axios from 'axios';

// --- ADIÇÃO: Configuração Base da API ---
// !!! AJUSTE ESTA URL PARA O ENDEREÇO DO SEU BACKEND SPRING BOOT !!!
const API_BASE_URL = 'http://localhost:8080/api'; // Exemplo: ajuste porta e caminho se necessário

// --- Interface para Coordenadas Simples ---
interface SimpleLatLng {
  lat: number;
  lng: number;
}

// --- Tipagem Modificada ---
interface SavedPolygon {
  id: number; // ID local (timestamp) para referência rápida
  backendId: string | number | null; // ID retornado pelo backend após salvar
  polygon: Polygon;
  text: string;
}

interface SavedMarker {
  id: number; // ID local (timestamp)
  backendId: string | number | null; // ID retornado pelo backend após salvar
  marker: Marker;
  text: string;
}

// Tipo para o item sob o cursor
type HoveredItemInfo = { type: 'polygon' | 'marker', id: number };


const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;

// --- Estados ---
let polygonPoints: LatLngExpression[] = [];
let currentDrawingLayer: Polygon | null = null;

let savedPolygons = ref<SavedPolygon[]>([]);
let selectedPolygon = ref<SavedPolygon | null>(null);

let savedMarkers = ref<SavedMarker[]>([]);
let selectedMarker = ref<SavedMarker | null>(null);

const hoveredItem = ref<HoveredItemInfo | null>(null);

// --- ADIÇÃO: Estado de Carregamento ---
const isLoading = ref(false); // Para feedback visual durante chamadas API

// --- Funções Auxiliares Polígonos ---

// --- MODIFICAÇÃO: Remover Polígono (com chamada API) ---
const handleRemovePolygon = async (localId: number) => {
  const indexToRemove = savedPolygons.value.findIndex(p => p.id === localId);
  if (indexToRemove === -1) return;

  const polygonToRemove = savedPolygons.value[indexToRemove];
  const backendId = polygonToRemove.backendId;

  if (backendId) {
    isLoading.value = true;
    try {
      // --- ADIÇÃO: Chamada API DELETE ---
      await axios.delete(`${API_BASE_URL}/polygons/${backendId}`);
      console.log(`[API] Polígono ${backendId} removido no backend.`);

      // Remove localmente APÓS sucesso da API
      if (map) map.removeLayer(polygonToRemove.polygon);
      savedPolygons.value.splice(indexToRemove, 1);
      if (selectedPolygon.value?.id === localId) { selectedPolygon.value = null; }
      if (hoveredItem.value?.type === 'polygon' && hoveredItem.value?.id === localId) { hoveredItem.value = null; }
      if (map) map.closePopup();
      console.log(`Polígono local ${localId} removido.`);

    } catch (error) {
      console.error(`[API Error] Falha ao remover polígono ${backendId}:`, error);
      alert('Erro ao remover o polígono no servidor.'); // Feedback simples
    } finally {
      isLoading.value = false;
    }
  } else {
    // Se não tem backendId, apenas remove localmente (caso tenha sido criado offline ou API falhou antes)
    console.warn(`Polígono local ${localId} não possui backendId. Removendo apenas localmente.`);
    if (map) map.removeLayer(polygonToRemove.polygon);
    savedPolygons.value.splice(indexToRemove, 1);
    if (selectedPolygon.value?.id === localId) { selectedPolygon.value = null; }
    if (hoveredItem.value?.type === 'polygon' && hoveredItem.value?.id === localId) { hoveredItem.value = null; }
    if (map) map.closePopup();
  }
};


// --- MODIFICAÇÃO: Salvar Polígono Desenhado (com chamada API) ---
const saveDrawnPolygon = async () => {
  console.log("[DEBUG] Tentando salvar polígono. Pontos:", polygonPoints.length);
  if (polygonPoints.length <= 2 || !map) {
    console.log("[DEBUG] Condições para salvar polígono não atendidas.");
    if (currentDrawingLayer && map) { map.removeLayer(currentDrawingLayer); }
    currentDrawingLayer = null;
    polygonPoints = [];
    return;
  }

  const pointsToSave: LatLng[] = [...polygonPoints] as LatLng[]; // Snapshot como LatLng[]
  const localId = Date.now();

  // Remove camada de desenho azul
  if (currentDrawingLayer) {
      map.removeLayer(currentDrawingLayer);
      currentDrawingLayer = null;
  }
  polygonPoints = []; // Limpa pontos originais

  // Cria camada salva (verde) localmente primeiro para feedback rápido
  const savedLayer = polygon(pointsToSave, { color: 'green' });
  const newSavedPolygon: SavedPolygon = {
    id: localId,
    backendId: null, // Ainda não tem ID do backend
    polygon: savedLayer,
    text: ''
  };

  savedPolygons.value.push(newSavedPolygon);
  savedLayer.addTo(map);
  console.log(`[DEBUG] Polígono local ${localId} criado e adicionado ao mapa.`);
  addClickListenerToSavedPolygon(newSavedPolygon);

  // --- ADIÇÃO: Chamada API POST para criar ---
  isLoading.value = true;
  try {
    // Converte coordenadas para formato simples
    const coordinatesPayload: SimpleLatLng[] = pointsToSave.map(p => ({ lat: p.lat, lng: p.lng }));

    // Supõe que o backend espera { text: string, coordinates: SimpleLatLng[] }
    const response = await axios.post(`${API_BASE_URL}/polygons`, {
        text: '', // Texto inicial vazio
        coordinates: coordinatesPayload
    });

    // --- ADIÇÃO: Atualiza backendId no objeto local ---
    // Supõe que o backend retorna o objeto criado com um campo 'id'
    const createdPolygonData = response.data;
    if (createdPolygonData && createdPolygonData.id) {
      const polygonInArray = savedPolygons.value.find(p => p.id === localId);
      if (polygonInArray) {
        polygonInArray.backendId = createdPolygonData.id;
        console.log(`[API] Polígono ${createdPolygonData.id} salvo no backend. ID local ${localId} atualizado.`);
      }
    } else {
       console.warn("[API] Backend não retornou um ID válido para o polígono criado.");
       // Considerar remover o polígono local se o backend falhar criticamente?
    }

  } catch (error) {
    console.error(`[API Error] Falha ao salvar polígono no backend:`, error);
    alert('Erro ao salvar o polígono no servidor. Ele ficará salvo apenas localmente por enquanto.');
    // Manter o polígono localmente mesmo com erro na API? Decisão de design.
  } finally {
    isLoading.value = false;
  }
};

// --- MODIFICAÇÃO: Listener de clique - Atualizar texto (com API) ---
const addClickListenerToSavedPolygon = (savedPoly: SavedPolygon) => {
  console.log(`[DEBUG] Adicionando listeners para Polígono local ${savedPoly.id}`);
  savedPoly.polygon.on('click', async (e: LeafletMouseEvent) => { // Async para esperar prompt e API
    console.log(`[DEBUG] Clique detectado no Polígono local ${savedPoly.id}. Ctrl: ${e.originalEvent.ctrlKey}`);
    L.DomEvent.stopPropagation(e);
    if (e.originalEvent.ctrlKey) {
      handleRemovePolygon(savedPoly.id); // Chama a função de remoção que já lida com API
    } else {
      selectedMarker.value = null;
      selectedPolygon.value = savedPoly;
      console.log(`[DEBUG] Polígono local ${savedPoly.id} selecionado. Abrindo prompt...`);

      const newText = prompt('Digite o texto para o polígono:', savedPoly.text);

      if (newText !== null && newText !== savedPoly.text) { // Só atualiza se o texto mudou
        const oldText = savedPoly.text; // Guarda o texto antigo para rollback em caso de erro
        savedPoly.text = newText; // Atualiza localmente primeiro (otimista)
        updatePolygonPopup(savedPoly); // Atualiza popup localmente

        // --- ADIÇÃO: Chamada API PUT para atualizar texto ---
        if (savedPoly.backendId) {
          isLoading.value = true;
          try {
            // Supõe que o backend espera { text: string } ou o objeto completo
            await axios.put(`${API_BASE_URL}/polygons/${savedPoly.backendId}`, {
              text: newText
              // Se precisar enviar coordenadas também:
              // coordinates: savedPoly.polygon.getLatLngs()[0] ... convertidas para SimpleLatLng
            });
            console.log(`[API] Texto do polígono ${savedPoly.backendId} atualizado no backend.`);
          } catch (error) {
            console.error(`[API Error] Falha ao atualizar texto do polígono ${savedPoly.backendId}:`, error);
            alert('Erro ao atualizar o texto do polígono no servidor.');
            savedPoly.text = oldText; // Rollback do texto local em caso de erro
            updatePolygonPopup(savedPoly); // Reverte popup
          } finally {
            isLoading.value = false;
          }
        } else {
          console.warn(`[API] Polígono local ${savedPoly.id} não tem backendId. Atualização de texto não enviada.`);
        }
      } else if (newText !== null) {
         // Se o texto não mudou, apenas garante que o popup está aberto/atualizado
         updatePolygonPopup(savedPoly);
      }
       // Se o prompt foi cancelado (newText === null), não faz nada
    }
  });

  savedPoly.polygon.on('mouseover', () => {
    if (!isLoading.value) { // Evita mudar hover durante loading? (Opcional)
      hoveredItem.value = { type: 'polygon', id: savedPoly.id };
    }
  });

  savedPoly.polygon.on('mouseout', () => {
    if (hoveredItem.value?.type === 'polygon' && hoveredItem.value?.id === savedPoly.id) {
      hoveredItem.value = null;
    }
  });
};

// Função inalterada, apenas atualiza o popup localmente
const updatePolygonPopup = (savedPoly: SavedPolygon) => {
  console.log(`[DEBUG] Atualizando/abrindo popup para Polígono local ${savedPoly.id}`);
  const popupContent = `
    ${savedPoly.text || '<i>Sem texto</i>'}
    <br>
    <button class="remove-polygon-btn" data-polygon-id="${savedPoly.id}">Remover Polígono</button>
    ${isLoading.value && selectedPolygon.value?.id === savedPoly.id ? '<br><i>Processando...</i>': ''}
  `;
  const popup = savedPoly.polygon.getPopup();
  if (popup) { popup.setContent(popupContent).update(); }
  else { savedPoly.polygon.bindPopup(popupContent); }
  savedPoly.polygon.openPopup();
};


// --- Funções Auxiliares Marcadores (Análogas aos Polígonos) ---

// --- MODIFICAÇÃO: Remover Marcador (com chamada API) ---
const handleRemoveMarker = async (localId: number) => {
  const indexToRemove = savedMarkers.value.findIndex(m => m.id === localId);
  if (indexToRemove === -1) return;

  const markerToRemove = savedMarkers.value[indexToRemove];
  const backendId = markerToRemove.backendId;

  if (backendId) {
    isLoading.value = true;
    try {
      // --- ADIÇÃO: Chamada API DELETE ---
      await axios.delete(`${API_BASE_URL}/markers/${backendId}`);
      console.log(`[API] Marcador ${backendId} removido no backend.`);

      // Remove localmente APÓS sucesso
      if (map) map.removeLayer(markerToRemove.marker);
      savedMarkers.value.splice(indexToRemove, 1);
      if (selectedMarker.value?.id === localId) { selectedMarker.value = null; }
      if (hoveredItem.value?.type === 'marker' && hoveredItem.value?.id === localId) { hoveredItem.value = null; }
      if (map) map.closePopup();
      console.log(`Marcador local ${localId} removido.`);

    } catch (error) {
      console.error(`[API Error] Falha ao remover marcador ${backendId}:`, error);
      alert('Erro ao remover o marcador no servidor.');
    } finally {
      isLoading.value = false;
    }
  } else {
    // Sem backendId, remove apenas localmente
    console.warn(`Marcador local ${localId} não possui backendId. Removendo apenas localmente.`);
    if (map) map.removeLayer(markerToRemove.marker);
    savedMarkers.value.splice(indexToRemove, 1);
    if (selectedMarker.value?.id === localId) { selectedMarker.value = null; }
    if (hoveredItem.value?.type === 'marker' && hoveredItem.value?.id === localId) { hoveredItem.value = null; }
    if (map) map.closePopup();
  }
};

// --- MODIFICAÇÃO: Listeners do Marcador (Atualizar texto com API) ---
const addMarkerListeners = (savedMk: SavedMarker) => {
  console.log(`[DEBUG] Adicionando listeners para Marcador local ${savedMk.id}`);
  savedMk.marker.on('click', (e: LeafletMouseEvent) => {
    console.log(`[DEBUG] Clique detectado no Marcador local ${savedMk.id}. Ctrl: ${e.originalEvent.ctrlKey}`);
    L.DomEvent.stopPropagation(e);
    if (e.originalEvent.ctrlKey) {
      handleRemoveMarker(savedMk.id); // Chama a remoção com API
    }
    // Clique simples não faz nada por padrão aqui, só o duplo clique
  });

  savedMk.marker.on('dblclick', async (e: LeafletMouseEvent) => { // Async para prompt e API
    console.log(`[DEBUG] Duplo clique detectado no Marcador local ${savedMk.id}.`);
    L.DomEvent.stopPropagation(e);
    selectedPolygon.value = null;
    selectedMarker.value = savedMk;
    console.log(`[DEBUG] Marcador local ${savedMk.id} selecionado. Abrindo prompt...`);

    const newText = prompt('Digite o texto para o marcador:', savedMk.text);

    if (newText !== null && newText !== savedMk.text) {
        const oldText = savedMk.text;
        savedMk.text = newText; // Atualiza local (otimista)
        updateMarkerPopup(savedMk); // Atualiza popup local

        // --- ADIÇÃO: Chamada API PUT para atualizar texto ---
        if (savedMk.backendId) {
            isLoading.value = true;
            try {
                // Supõe que o backend espera { text: string } ou o objeto completo
                await axios.put(`${API_BASE_URL}/markers/${savedMk.backendId}`, {
                    text: newText
                    // Se precisar enviar coordenadas também:
                    // coordinates: { lat: savedMk.marker.getLatLng().lat, lng: savedMk.marker.getLatLng().lng }
                });
                console.log(`[API] Texto do marcador ${savedMk.backendId} atualizado no backend.`);
            } catch (error) {
                console.error(`[API Error] Falha ao atualizar texto do marcador ${savedMk.backendId}:`, error);
                alert('Erro ao atualizar o texto do marcador no servidor.');
                savedMk.text = oldText; // Rollback local
                updateMarkerPopup(savedMk); // Reverte popup
            } finally {
                isLoading.value = false;
            }
        } else {
             console.warn(`[API] Marcador local ${savedMk.id} não tem backendId. Atualização de texto não enviada.`);
        }
    } else if (newText !== null) {
        updateMarkerPopup(savedMk); // Garante popup aberto/atualizado se texto não mudou
    }
  });

  savedMk.marker.on('mouseover', () => {
     if (!isLoading.value) {
        hoveredItem.value = { type: 'marker', id: savedMk.id };
     }
  });

  savedMk.marker.on('mouseout', () => {
    if (hoveredItem.value?.type === 'marker' && hoveredItem.value?.id === savedMk.id) {
      hoveredItem.value = null;
    }
  });
};

// Função inalterada, apenas atualiza o popup localmente
const updateMarkerPopup = (savedMk: SavedMarker) => {
  console.log(`[DEBUG] Atualizando/abrindo popup para Marcador local ${savedMk.id}`);
  const popupContent = `
      ${savedMk.text || '<i>Sem texto</i>'}
      ${isLoading.value && selectedMarker.value?.id === savedMk.id ? '<br><i>Processando...</i>': ''}
      `;
  const popup = savedMk.marker.getPopup();
  if (popup) { popup.setContent(popupContent).update(); }
  else { savedMk.marker.bindPopup(popupContent); }
  savedMk.marker.openPopup();
};


// --- Listeners Globais ---

// Função inalterada (desenho)
const handleMapMouseMove = (e: LeafletMouseEvent) => {
  if (e.originalEvent.ctrlKey && map && !isLoading.value) { // Não desenha durante loading
    polygonPoints.push(e.latlng);
    if (currentDrawingLayer) { map.removeLayer(currentDrawingLayer); }
    currentDrawingLayer = polygon(polygonPoints, { color: 'blue', weight: 2, interactive: false }).addTo(map);
  }
};

// Função modificada para ser async por causa de saveDrawnPolygon
const handleWindowKeyUp = async (e: KeyboardEvent) => {
  if (e.key === 'Control') {
    console.log("[DEBUG] Tecla Control liberada, chamando saveDrawnPolygon...");
    await saveDrawnPolygon(); // Agora é async
  }
};

// --- MODIFICAÇÃO: Tecla 'p' para editar (chama lógica com API) ---
const handleWindowKeyDown = async (e: KeyboardEvent) => { // Async para esperar prompt/API
  if (isLoading.value) return; // Bloqueia ações durante carregamento

  // Edição com 'p'
  if (e.key === 'p') {
     if (selectedPolygon.value) {
        const currentPoly = selectedPolygon.value; // Referência estável
        const newText = prompt('Digite o novo texto para o polígono selecionado:', currentPoly.text);
        if (newText !== null && newText !== currentPoly.text) {
          const oldText = currentPoly.text;
          currentPoly.text = newText; // Otimista
          updatePolygonPopup(currentPoly);
          // Chama API PUT (lógica similar a addClickListenerToSavedPolygon)
          if (currentPoly.backendId) {
              isLoading.value = true;
              try {
                  await axios.put(`${API_BASE_URL}/polygons/${currentPoly.backendId}`, { text: newText });
                  console.log(`[API] Texto do polígono ${currentPoly.backendId} atualizado via tecla 'p'.`);
              } catch (error) {
                  console.error(`[API Error] Falha ao atualizar texto do polígono ${currentPoly.backendId} via 'p':`, error);
                  alert('Erro ao atualizar o texto do polígono no servidor.');
                  currentPoly.text = oldText; // Rollback
                  updatePolygonPopup(currentPoly);
              } finally { isLoading.value = false; }
          } else { console.warn(`[API] Polígono local ${currentPoly.id} não tem backendId.`); }
        }
     } else if (selectedMarker.value) {
        const currentMark = selectedMarker.value; // Referência estável
        const newText = prompt('Digite o novo texto para o marcador selecionado:', currentMark.text);
        if (newText !== null && newText !== currentMark.text) {
            const oldText = currentMark.text;
            currentMark.text = newText; // Otimista
            updateMarkerPopup(currentMark);
            // Chama API PUT (lógica similar a addMarkerListeners)
            if (currentMark.backendId) {
                isLoading.value = true;
                try {
                    await axios.put(`${API_BASE_URL}/markers/${currentMark.backendId}`, { text: newText });
                    console.log(`[API] Texto do marcador ${currentMark.backendId} atualizado via tecla 'p'.`);
                } catch (error) {
                    console.error(`[API Error] Falha ao atualizar texto do marcador ${currentMark.backendId} via 'p':`, error);
                    alert('Erro ao atualizar o texto do marcador no servidor.');
                    currentMark.text = oldText; // Rollback
                    updateMarkerPopup(currentMark);
                } finally { isLoading.value = false; }
            } else { console.warn(`[API] Marcador local ${currentMark.id} não tem backendId.`); }
        }
     }
  }

  // Deselecionar/Cancelar com 'Escape' (Inalterado)
  if (e.key === 'Escape') {
     if (currentDrawingLayer && map) { map.removeLayer(currentDrawingLayer); currentDrawingLayer = null; polygonPoints = []; console.log("Desenho cancelado via ESC."); }
     else if (selectedPolygon.value) { selectedPolygon.value = null; if (map) map.closePopup(); console.log("Polígono deselecionado via ESC."); }
     else if (selectedMarker.value) { selectedMarker.value = null; if (map) map.closePopup(); console.log("Marcador deselecionado via ESC."); }
     hoveredItem.value = null;
  }

  // --- MODIFICAÇÃO: Remover com 'Delete' (chama lógica com API) ---
  if (e.key === 'Delete' || e.key === 'Del') {
     console.log("Tecla Delete pressionada.");
     if (hoveredItem.value) { // Verifica item sob cursor
        if (hoveredItem.value.type === 'polygon') {
           console.log(`Removendo polígono sob cursor: ${hoveredItem.value.id}`);
           await handleRemovePolygon(hoveredItem.value.id); // Chama a função com API
        } else if (hoveredItem.value.type === 'marker') {
           console.log(`Removendo marcador sob cursor: ${hoveredItem.value.id}`);
           await handleRemoveMarker(hoveredItem.value.id); // Chama a função com API
        }
     } else {
        console.log("Nenhum item sob o cursor para remover com a tecla Delete.");
     }
  }
};


// --- Hooks do Ciclo de Vida Vue ---

// --- MODIFICAÇÃO: onMounted para buscar dados iniciais ---
onMounted(async () => { // Tornou-se async
  if (mapContainer.value) {
    map = L.map(mapContainer.value).setView([-10, -55] as LatLngExpression, 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.Control.geocoder().addTo(map);

    // --- ADIÇÃO: Buscar dados existentes do backend ---
    isLoading.value = true;
    try {
        // Busca Polígonos
        const polygonsResponse = await axios.get(`${API_BASE_URL}/polygons`);
        if (polygonsResponse.data && Array.isArray(polygonsResponse.data)) {
            polygonsResponse.data.forEach((polyData: any) => {
                // Supõe que polyData tem 'id', 'text', e 'coordinates' (array de SimpleLatLng)
                if (polyData.id && polyData.coordinates) {
                    const leafletCoords: LatLngExpression[] = polyData.coordinates.map((c: SimpleLatLng) => [c.lat, c.lng]);
                    const savedLayer = polygon(leafletCoords, { color: 'green' });
                    const newSavedPolygon: SavedPolygon = {
                        id: Date.now() + Math.random(), // Gera ID local único (melhor que só timestamp se carregar rápido)
                        backendId: polyData.id, // Guarda o ID do backend
                        polygon: savedLayer,
                        text: polyData.text || ''
                    };
                    savedPolygons.value.push(newSavedPolygon);
                    savedLayer.addTo(map!); // Adiciona ao mapa
                    addClickListenerToSavedPolygon(newSavedPolygon); // Adiciona listeners
                }
            });
            console.log(`[API] ${savedPolygons.value.length} polígonos carregados.`);
        }

        // Busca Marcadores
        const markersResponse = await axios.get(`${API_BASE_URL}/markers`);
        if (markersResponse.data && Array.isArray(markersResponse.data)) {
             markersResponse.data.forEach((markerData: any) => {
                 // Supõe que markerData tem 'id', 'text', e 'coordinates' (SimpleLatLng)
                 if (markerData.id && markerData.coordinates) {
                    const leafletCoord: LatLngExpression = [markerData.coordinates.lat, markerData.coordinates.lng];
                    const newMarkerInstance = L.marker(leafletCoord);
                    const newSavedMarker: SavedMarker = {
                        id: Date.now() + Math.random(), // ID local único
                        backendId: markerData.id, // Guarda ID do backend
                        marker: newMarkerInstance,
                        text: markerData.text || ''
                    };
                    savedMarkers.value.push(newSavedMarker);
                    newMarkerInstance.addTo(map!); // Adiciona ao mapa
                    addMarkerListeners(newSavedMarker); // Adiciona listeners
                 }
             });
             console.log(`[API] ${savedMarkers.value.length} marcadores carregados.`);
        }

    } catch (error) {
        console.error("[API Error] Falha ao buscar dados iniciais:", error);
        alert("Erro ao carregar dados do servidor. Alguns itens podem não aparecer.");
    } finally {
        isLoading.value = false;
    }

    // --- Listeners do Mapa ---

    // --- MODIFICAÇÃO: dblclick para adicionar marcador (com API) ---
    map.on('dblclick', async (e: LeafletMouseEvent) => { // Async para API
      if (!map || isLoading.value) return; // Não adiciona durante loading

      const localId = Date.now();
      const newMarkerInstance = L.marker(e.latlng); // Cria localmente

      const newSavedMarker: SavedMarker = {
          id: localId,
          backendId: null, // Sem ID backend ainda
          marker: newMarkerInstance,
          text: ''
      };

      savedMarkers.value.push(newSavedMarker);
      newMarkerInstance.addTo(map); // Adiciona localmente
      console.log(`[DEBUG] Marcador local ${localId} criado e adicionado.`);
      addMarkerListeners(newSavedMarker); // Adiciona listeners locais

      // --- ADIÇÃO: Chamada API POST para criar marcador ---
      isLoading.value = true;
      try {
        const coordinatesPayload: SimpleLatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
        // Supõe que backend espera { text: string, coordinates: SimpleLatLng }
        const response = await axios.post(`${API_BASE_URL}/markers`, {
            text: '',
            coordinates: coordinatesPayload
        });

        // Atualiza backendId localmente
        const createdMarkerData = response.data;
        if (createdMarkerData && createdMarkerData.id) {
          const markerInArray = savedMarkers.value.find(m => m.id === localId);
          if (markerInArray) {
            markerInArray.backendId = createdMarkerData.id;
            console.log(`[API] Marcador ${createdMarkerData.id} salvo no backend. ID local ${localId} atualizado.`);
          }
        } else {
           console.warn("[API] Backend não retornou um ID válido para o marcador criado.");
        }

      } catch (error) {
          console.error(`[API Error] Falha ao salvar marcador no backend:`, error);
          alert('Erro ao salvar o marcador no servidor. Ele ficará salvo apenas localmente por enquanto.');
          // Manter marcador local?
      } finally {
          isLoading.value = false;
      }
    });

    map.on('mousemove', handleMapMouseMove);

    // --- MODIFICAÇÃO: Listener do popup para usar ID local ---
    map.on('popupopen', (e) => {
      const popup = e.popup;
      const content = popup.getElement();
      if (!content) return;

      // Lógica APENAS para botão do polígono
      const removePolygonButton = content.querySelector('.remove-polygon-btn');
      if (removePolygonButton instanceof HTMLElement) {
        const polygonLocalId = removePolygonButton.dataset.polygonId; // Continua usando o ID local
        if (polygonLocalId) {
          const listenerAttached = removePolygonButton.getAttribute('data-listener-attached');
          if (!listenerAttached) {
            removePolygonButton.addEventListener('click', () => handleRemovePolygon(Number(polygonLocalId))); // Chama com ID local
            removePolygonButton.setAttribute('data-listener-attached', 'true');
          }
        }
      }
    });

    // Adiciona listeners globais
    window.addEventListener('keyup', handleWindowKeyUp);
    window.addEventListener('keydown', handleWindowKeyDown);

    console.log("Mapa e listeners inicializados.");
  }
});

// Função inalterada
onUnmounted(() => {
  console.log("Componente MainMap desmontando. Limpando listeners e mapa...");
  window.removeEventListener('keyup', handleWindowKeyUp);
  window.removeEventListener('keydown', handleWindowKeyDown);
  if (map) {
    map.remove();
    map = null;
  }
});

</script>

<template>
  <div>
    <div v-if="isLoading" style="position: absolute; top: 10px; right: 10px; background: orange; color: black; padding: 5px 10px; border-radius: 5px; z-index: 2000;">
        Carregando...
    </div>

    <div class="map-container">
      <div class="map-header">MAPA DE ÁREAS CADASTRADAS</div>
      <div class="map-content" ref="mapContainer"></div>
       <div style="position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.5); color: white; padding: 5px; font-size: 10px; z-index: 1000;">
          Polígonos: {{ savedPolygons.length }} | Marcadores: {{ savedMarkers.length }} | Desenho: {{ polygonPoints.length }}
          <br> Sel Pol: {{ selectedPolygon?.id ?? 'Nenhum' }} (API: {{selectedPolygon?.backendId ?? 'N/A'}})
          <br> Sel Mark: {{ selectedMarker?.id ?? 'Nenhum' }} (API: {{selectedMarker?.backendId ?? 'N/A'}})
          <br> Hover: {{ hoveredItem ? `${hoveredItem.type} ${hoveredItem.id}` : 'Nenhum' }}
       </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  width: 656.4px; height: 454.8px; border-radius: 18px; background: rgba(41, 52, 62, 1);
  overflow: hidden; position: relative; left: 72px; top: 72px; display: flex;
  flex-direction: column; padding: 12px; box-sizing: border-box;
}
.map-header { color: white; text-align: center; font-weight: bold; padding-bottom: 12px; }
.map-content { flex: 1; background-color: white; border-radius: 6px; }

:global(.leaflet-popup-content .remove-polygon-btn) {
  margin-top: 8px; padding: 4px 8px; cursor: pointer;
  border: 1px solid #ccc; background-color: #eee; border-radius: 3px;
}
:global(.leaflet-popup-content .remove-polygon-btn:hover){
    background-color: #ddd;
}

/* ADIÇÃO: Estilo opcional para popup durante carregamento */
:global(.leaflet-popup-content i) {
    color: #888;
}
</style>
