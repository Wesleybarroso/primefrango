import { ExternalLink, MapPinned, Navigation } from "lucide-react";
import { useState } from "react";
import { MapView } from "@/components/Map";

const STORE_POSITION = { lat: -1.4558, lng: -48.4902 };
const MAP_QUERY = encodeURIComponent("Prime Frango Assado, Belém, PA");
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;
const MAP_EMBED = `https://www.google.com/maps?q=${STORE_POSITION.lat},${STORE_POSITION.lng}&z=13&output=embed`;
const hasMapsRuntime = Boolean(import.meta.env.VITE_FRONTEND_FORGE_API_URL && import.meta.env.VITE_FRONTEND_FORGE_API_KEY);

function createStorePin() {
  const pin = document.createElement("div");
  pin.className = "real-map-pin";
  pin.innerHTML = '<span>PF</span>';
  return pin;
}

export function RealDeliveryMap({ compact = false }: { compact?: boolean }) {
  const [mapFailed, setMapFailed] = useState(false);

  const renderGoogleMap = () => {
    if (hasMapsRuntime && !mapFailed) {
      return (
        <MapView
          className="real-map-canvas"
          initialCenter={STORE_POSITION}
          initialZoom={13}
          onMapError={() => setMapFailed(true)}
          onMapReady={(map) => {
            const googleMaps = window.google?.maps;
            if (!googleMaps) return;
            new googleMaps.marker.AdvancedMarkerElement({
              map,
              position: STORE_POSITION,
              title: "Prime Frango Assado — Belém",
              content: createStorePin(),
            });
            new googleMaps.Circle({
              map,
              center: STORE_POSITION,
              radius: 5200,
              fillColor: "#d8922a",
              fillOpacity: 0.1,
              strokeColor: "#d8922a",
              strokeOpacity: 0.75,
              strokeWeight: 2,
            });
          }}
        />
      );
    }

    return (
      <iframe
        className="real-map-embed"
        title="Mapa da área de atendimento da Prime Frango Assado em Belém"
        src={MAP_EMBED}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  };

  return (
    <div className={compact ? "real-map-card is-compact" : "real-map-card"}>
      <div className="real-map-toolbar">
        <div className="real-map-heading">
          <span className="real-map-icon"><MapPinned size={18} /></span>
          <div>
            <strong>Área de atendimento</strong>
            <span>Belém e região · raio configurável</span>
          </div>
        </div>
        <a className="map-external-link" href={MAP_LINK} target="_blank" rel="noreferrer">
          <span>Ver no Google Maps</span>
          <ExternalLink size={14} />
        </a>
      </div>
      <div className="real-map-viewport">
        {renderGoogleMap()}
        <div className="map-overlay-badge"><Navigation size={13} /> Loja e região de entrega</div>
      </div>
      <div className="real-map-footer">
        <span><i className="map-status-dot" /> Mapa de referência atualizado</span>
        <small>O raio final é definido pela operação.</small>
      </div>
    </div>
  );
}
