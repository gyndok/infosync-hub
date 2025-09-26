import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { NewsPoint, TOPIC_COLORS } from '@/types/news';

// Extend Leaflet types for MarkerClusterGroup
declare module 'leaflet' {
  function markerClusterGroup(options?: any): L.MarkerClusterGroup;
  
  interface MarkerClusterGroup extends L.LayerGroup {
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
    clearLayers(): this;
    getLayers(): L.Layer[];
  }
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface NewsMapProps {
  newsPoints: NewsPoint[];
  onPointClick: (point: NewsPoint) => void;
  selectedPoint?: NewsPoint | null;
}

const NewsMap: React.FC<NewsMapProps> = ({ newsPoints, onPointClick, selectedPoint }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<any>(null);

  const [tooltipContent, setTooltipContent] = useState<string>('');
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
    });

    // Add tile layer with clean gray style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Initialize marker cluster group
    const markers = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    map.addLayer(markers);

    mapInstanceRef.current = map;
    markersRef.current = markers;

    // Clear selection on map click
    map.on('click', (e) => {
      if ((e.originalEvent?.target as HTMLElement)?.classList.contains('leaflet-container')) {
        onPointClick(null as any);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add markers for each news point
    newsPoints.forEach((point) => {
      const primaryTopic = point.top_topics[0] || 'politics';
      const color = TOPIC_COLORS[primaryTopic as keyof typeof TOPIC_COLORS] || '#f97316';
      
      // Create custom icon based on article count and topic
      const size = Math.min(Math.max(point.article_count / 2, 20), 60);
      
      const customIcon = L.divIcon({
        className: 'custom-news-marker',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${Math.max(size / 4, 10)}px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.2s ease;
          " 
          onmouseover="this.style.transform='scale(1.1)'"
          onmouseout="this.style.transform='scale(1)'"
          >
            ${point.article_count}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([point.lat, point.lon], { icon: customIcon });

      // Add hover tooltip
      marker.on('mouseover', (e) => {
        const content = `
          <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px 12px; border-radius: 6px; font-size: 14px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${point.place}</div>
            <div style="margin-bottom: 2px;">Articles: ${point.article_count}</div>
            <div style="margin-bottom: 2px;">Topics: ${point.top_topics.join(', ')}</div>
            <div style="font-size: 12px; opacity: 0.8;">Updated: ${new Date(point.last_updated).toLocaleTimeString()}</div>
          </div>
        `;
        setTooltipContent(content);
        
        const rect = mapRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPosition({
            x: e.containerPoint.x + rect.left,
            y: e.containerPoint.y + rect.top - 10,
          });
        }
      });

      marker.on('mouseout', () => {
        setTooltipContent('');
        setTooltipPosition(null);
      });

      // Add click handler
      marker.on('click', () => {
        onPointClick(point);
      });

      markersRef.current!.addLayer(marker);
    });

    // Fit map to show all markers if there are any
    if (newsPoints.length > 0 && markersRef.current) {
      const layers = markersRef.current.getLayers();
      if (layers.length > 0) {
        const group = L.featureGroup(layers);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [newsPoints, onPointClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Custom tooltip */}
      {tooltipContent && tooltipPosition && (
        <div
          className="fixed pointer-events-none z-[500]"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-50%, -100%)',
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[400]">
        <h4 className="font-semibold text-sm mb-2">Topics</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(TOPIC_COLORS).map(([topic, color]) => (
            <div key={topic} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{topic}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsMap;