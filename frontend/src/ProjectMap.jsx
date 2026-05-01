import React, { useState, useMemo, useEffect, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const CITY_COORDS = {
  'mangalore': [74.8560, 12.9141],
  'mangaluru': [74.8560, 12.9141],
  'bangalore': [77.5946, 12.9716],
  'bengaluru': [77.5946, 12.9716],
  'mumbai': [72.8777, 19.0760],
  'delhi': [77.1025, 28.7041],
  'chennai': [80.2707, 13.0827],
  'kolkata': [88.3639, 22.5726],
  'hyderabad': [78.4867, 17.3850],
  'pune': [73.8567, 18.5204]
};

const generateHashCoords = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lng = 72 + Math.abs(hash % 15);
  const lat = 12 + Math.abs((hash >> 4) % 15);
  return [lng, lat];
};

export default function ProjectMap({ projects }) {
  const [popupInfo, setPopupInfo] = useState(null);
  const mapRef = useRef();

  // Auto-fit bounds whenever projects change
  useEffect(() => {
    if (!projects || projects.length === 0 || !mapRef.current) return;

    const coords = projects.map(p => {
      const locKey = p.location.toLowerCase().trim();
      return CITY_COORDS[locKey] || generateHashCoords(locKey);
    });

    if (coords.length === 1) {
      // Single project: zoom in closely
      mapRef.current.flyTo({
        center: coords[0],
        zoom: 12,
        duration: 2000,
        pitch: 60
      });
    } else {
      // Multiple projects: fit bounds
      const bounds = coords.reduce(
        (acc, coord) => [
          [Math.min(acc[0][0], coord[0]), Math.min(acc[0][1], coord[1])],
          [Math.max(acc[1][0], coord[0]), Math.max(acc[1][1], coord[1])]
        ],
        [[coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]]
      );

      mapRef.current.fitBounds(bounds, {
        padding: 100,
        duration: 2000,
        maxZoom: 10
      });
    }
  }, [projects]);

  const pins = useMemo(() => {
    return projects.map((project, index) => {
      const locKey = project.location.toLowerCase().trim();
      const coords = CITY_COORDS[locKey] || generateHashCoords(locKey);
      
      return (
        <Marker
          key={`marker-${project.id}-${index}`}
          longitude={coords[0]}
          latitude={coords[1]}
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setPopupInfo({ ...project, coords });
          }}
        >
          <div className="group cursor-pointer relative">
            <div className="absolute -inset-4 bg-[#F6CC63] rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
            <div className="relative text-[#F6CC63] hover:text-white transform hover:scale-110 transition-all duration-300">
              <MapPin size={42} fill="currentColor" fillOpacity={0.3} strokeWidth={2.5} className="drop-shadow-[0_0_12px_rgba(246,204,99,0.8)]" />
            </div>
          </div>
        </Marker>
      );
    });
  }, [projects]);

  return (
    <div className="w-full h-[650px] rounded-[3rem] overflow-hidden border-[8px] border-[#032360] shadow-[0_25px_60px_rgba(0,0,0,0.4)] relative mb-16 group/map">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 78.9629,
          latitude: 22.5937,
          zoom: 4,
          pitch: 45
        }}
        mapStyle={MAP_STYLE}
        mapLib={maplibregl}
        reuseMaps
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {pins}

        {popupInfo && (
          <Popup
            anchor="bottom"
            longitude={popupInfo.coords[0]}
            latitude={popupInfo.coords[1]}
            onClose={() => setPopupInfo(null)}
            closeButton={false}
            offset={20}
            className="z-50"
          >
            <div className="p-5 min-w-[260px] bg-[#032360]/95 text-white rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif font-bold text-[#F6CC63] text-2xl leading-tight">{popupInfo.title}</h3>
              </div>
              <p className="text-sm text-white/60 mb-4 font-medium tracking-wide flex items-center gap-1.5">
                <MapPin size={14} className="text-[#F6CC63]" /> {popupInfo.location}
              </p>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-4">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Budget Allocated</p>
                <p className="text-2xl font-mono font-bold text-white">₹ {popupInfo.totalBudget}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <span>Transparency Score</span>
                  <span className="text-[#F6CC63]">98%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-[#F6CC63] to-[#eab308] animate-pulse" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Immersive Glass Overlay */}
      <div className="absolute inset-0 pointer-events-none border-[30px] border-[#032360]/10 rounded-[3rem] shadow-[inset_0_0_100px_rgba(0,0,0,0.4)]"></div>
      
      {/* Interactive Label */}
      <div className="absolute bottom-8 left-8 bg-[#032360]/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white shadow-xl pointer-events-none">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#F6CC63] mb-0.5">Live Tracking</p>
        <p className="text-sm font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          {projects.length} Active Infrastructure Projects
        </p>
      </div>
    </div>
  );
}
