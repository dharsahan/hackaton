'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { Style, Fill, Stroke, Text } from 'ol/style';
import Overlay from 'ol/Overlay';
import { Field } from '@/lib/types';

import Draw from 'ol/interaction/Draw';

interface MapComponentProps {
  fields?: Field[];
  selectedFieldId?: string;
  onFieldSelect?: (fieldId: string) => void;
  isDrawing?: boolean;
  onDrawEnd?: (coordinates: number[][]) => void;
}

export default function MapComponent({ fields = [], selectedFieldId, onFieldSelect, isDrawing = false, onDrawEnd }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const drawInteraction = useRef<Draw | null>(null);
  const [mapType, setMapType] = useState<'osm' | 'satellite'>('osm');

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'rgba(34, 197, 94, 0.4)'; // Green
      case 'Dry': return 'rgba(234, 179, 8, 0.4)'; // Yellow
      case 'Needs Attention': return 'rgba(249, 115, 22, 0.4)'; // Orange
      case 'Action Required': return 'rgba(239, 68, 68, 0.4)'; // Red
      default: return 'rgba(156, 163, 175, 0.4)'; // Gray
    }
  };

  const getStrokeColor = (status: string) => {
    switch (status) {
      case 'Healthy': return '#16a34a';
      case 'Dry': return '#ca8a04';
      case 'Needs Attention': return '#ea580c';
      case 'Action Required': return '#dc2626';
      default: return '#4b5563';
    }
  };

  useEffect(() => {
    if (!mapRef.current || !popupRef.current) return;

    if (!mapInstance.current) {
      // 1. Layers
      const osmLayer = new TileLayer({
        source: new OSM(),
        visible: true,
        properties: { name: 'osm' },
      });

      const satelliteLayer = new TileLayer({
        source: new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 19,
        }),
        visible: false,
        properties: { name: 'satellite' },
      });

      const vectorSource = new VectorSource();
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: (feature) => {
          const status = feature.get('status') || 'Healthy';
          const name = feature.get('name') || 'New Field';
          const isSelected = feature.get('selected');

          return new Style({
            fill: new Fill({
              color: getStatusColor(status),
            }),
            stroke: new Stroke({
              color: isSelected ? '#fff' : getStrokeColor(status),
              width: isSelected ? 4 : 2,
            }),
            text: new Text({
              text: name,
              font: 'bold 12px Inter, sans-serif',
              fill: new Fill({ color: '#fff' }),
              stroke: new Stroke({ color: '#000', width: 2, lineCap: 'round', lineJoin: 'round' }),
              offsetY: -10,
            })
          });
        }
      });

      // 2. Overlay
      const overlay = new Overlay({
        element: popupRef.current,
        autoPan: {
          animation: {
            duration: 250,
          },
        },
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10],
      });

      // 3. Map
      // Center on the first field or default to Salem
      const center = fields.length > 0 && fields[0].coordinates
        ? fromLonLat(fields[0].coordinates[0])
        : fromLonLat([78.1460, 11.6643]);

      const map = new Map({
        target: mapRef.current,
        layers: [osmLayer, satelliteLayer, vectorLayer],
        overlays: [overlay],
        view: new View({
          center: center,
          zoom: 15,
        }),
        controls: [], // Minimal controls
      });

      mapInstance.current = map;

      // 4. Interactions
      map.on('click', (evt) => {
        if (drawInteraction.current) return; // Disable click when drawing

        const feature = map.forEachFeatureAtPixel(evt.pixel, (feat) => feat);

        if (feature) {
          const geometry = feature.getGeometry();
          const coord = geometry instanceof Polygon ? geometry.getInteriorPoint().getCoordinates() : evt.coordinate;

          // Show popup
          const name = feature.get('name');
          const crop = feature.get('crop');
          const acres = feature.get('acres');
          const status = feature.get('status');

          const content = popupRef.current?.querySelector('#popup-content');
          if (content) {
            content.innerHTML = `
              <div class="text-sm font-semibold">${name}</div>
              <div class="text-xs text-gray-600">${crop} · ${acres} ac</div>
              <div class="text-xs font-medium mt-1 ${status === 'Healthy' ? 'text-green-600' : 'text-amber-600'}">${status}</div>
            `;
          }

          overlay.setPosition(coord);

          // Trigger select callback
          const id = feature.get('id');
          if (onFieldSelect) onFieldSelect(id);
        } else {
          overlay.setPosition(undefined);
          if (onFieldSelect) onFieldSelect('');
        }
      });

      // Cursor pointer on hover
      map.on('pointermove', function (e) {
        if (drawInteraction.current) return;
        const pixel = map.getEventPixel(e.originalEvent);
        const hit = map.hasFeatureAtPixel(pixel);
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
      });
    }

    // Update features whenever fields prop changes
    const map = mapInstance.current;
    if (map) {
      const vectorLayer = map.getLayers().getArray()[2] as VectorLayer;
      const source = vectorLayer.getSource();
      source?.clear();

      fields.forEach(field => {
        if (field.coordinates) {
          const coords = [field.coordinates.map(coord => fromLonLat(coord))];
          const polygon = new Polygon(coords);

          const feature = new Feature({
            geometry: polygon,
            name: field.name,
            id: field.id,
            status: field.status,
            crop: field.crop,
            acres: field.acres,
            selected: field.id === selectedFieldId
          });

          source?.addFeature(feature);
        }
      });

      // Fly to selected field
      if (selectedFieldId) {
        const selectedField = fields.find(f => f.id === selectedFieldId);
        if (selectedField?.coordinates) {
          const view = map.getView();
          const location = fromLonLat(selectedField.coordinates[0]);

          // Don't animate if we are already close (prevents constant zooming)
          // const currentCenter = view.getCenter();

          view.animate({
            center: location,
            zoom: 16,
            duration: 1000
          });

          // Also show popup automatically
          const overlay = map.getOverlayById('popup') || map.getOverlays().item(0);
          overlay.setPosition(location);

          const content = popupRef.current?.querySelector('#popup-content');
          if (content && selectedField) {
            content.innerHTML = `
              <div class="text-sm font-semibold">${selectedField.name}</div>
              <div class="text-xs text-gray-600">${selectedField.crop} · ${selectedField.acres} ac</div>
              <div class="text-xs font-medium mt-1 ${selectedField.status === 'Healthy' ? 'text-green-600' : 'text-amber-600'}">${selectedField.status}</div>
            `;
          }
        }
      }
    }

  }, [fields, selectedFieldId, onFieldSelect]);

  // Handle Drawing Interaction
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (isDrawing) {
      const vectorLayer = map.getLayers().getArray()[2] as VectorLayer;
      const source = vectorLayer.getSource();

      if (source) {
        // Add Draw interaction
        const draw = new Draw({
          source: source,
          type: 'Polygon',
        });

        draw.on('drawend', (evt) => {
          const geometry = evt.feature.getGeometry();
          if (geometry instanceof Polygon && onDrawEnd) {
            // Transform coordinates back to LonLat
            const coords = geometry.getCoordinates()[0].map((coord) => {
              return toLonLat(coord);
            });
            onDrawEnd(coords);
          }
        });

        // Actually, let's fix the imports first in the next tool call properly
        // For now, I will just reference the Draw interaction and let the component update
        map.addInteraction(draw);
        drawInteraction.current = draw;
      }
    } else {
      if (drawInteraction.current) {
        map.removeInteraction(drawInteraction.current);
        drawInteraction.current = null;
      }
    }
  }, [isDrawing, onDrawEnd]);

  // Handle Map Type Switch
  useEffect(() => {
    if (mapInstance.current) {
      const layers = mapInstance.current.getLayers().getArray();
      layers.forEach(layer => {
        if (layer instanceof TileLayer) {
          const name = layer.get('name');
          if (name === 'osm') layer.setVisible(mapType === 'osm');
          if (name === 'satellite') layer.setVisible(mapType === 'satellite');
        }
      });
    }
  }, [mapType]);

  return (
    <div className="w-full h-full relative group">
      <div ref={mapRef} className="w-full h-full" style={{ backgroundColor: '#e5e7eb', cursor: isDrawing ? 'crosshair' : 'default' }} />

      {/* Popup Overlay */}
      <div ref={popupRef} className="absolute bg-white p-3 rounded-lg shadow-lg border border-gray-100 transform -translate-x-1/2 min-w-[140px] pointer-events-none after:content-[''] after:absolute after:top-full after:left-1/2 after:-ml-2 after:border-8 after:border-transparent after:border-t-white">
        <div id="popup-content"></div>
      </div>

      {/* Layer Switcher */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-900 p-1 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 flex flex-col gap-1">
        <button
          onClick={() => setMapType('osm')}
          className={`p-2 rounded-md transition-colors ${mapType === 'osm' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          title="Map View"
        >
          <span className="material-icons text-xl">map</span>
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`p-2 rounded-md transition-colors ${mapType === 'satellite' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          title="Satellite View"
        >
          <span className="material-icons text-xl">satellite_alt</span>
        </button>
      </div>

      {/* Zoom Controls (Custom) */}
      <div className="absolute bottom-6 right-4 flex flex-col gap-2">
        <button
          onClick={() => {
            const view = mapInstance.current?.getView();
            view?.animate({ zoom: (view.getZoom() || 15) + 1, duration: 250 });
          }}
          className="w-10 h-10 bg-white dark:bg-gray-900 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-icons">add</span>
        </button>
        <button
          onClick={() => {
            const view = mapInstance.current?.getView();
            view?.animate({ zoom: (view.getZoom() || 15) - 1, duration: 250 });
          }}
          className="w-10 h-10 bg-white dark:bg-gray-900 rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="material-icons">remove</span>
        </button>
      </div>

      {isDrawing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm z-50">
          Click points to draw shape, double click to finish
        </div>
      )}
    </div>
  );
}
