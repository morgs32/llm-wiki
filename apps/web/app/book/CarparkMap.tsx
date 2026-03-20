"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export interface MapMarker {
  id: string;
  name: string;
  rating: number;
  lng: number;
  lat: number;
  count: number;
}

interface CarparkMapProps {
  markers?: MapMarker[];
  className?: string;
  onMarkerClick?: (markerId: string) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function CarparkMap({ markers = [], className, onMarkerClick }: CarparkMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-97.7431, 30.2672],
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    map.on("style.load", () => {
      const style = map.getStyle();
      if (!style?.layers) return;
      for (const layer of style.layers) {
        if (layer.type === "symbol") {
          try {
            map.setPaintProperty(layer.id, "text-color", "#f4f4f5");
            map.setPaintProperty(layer.id, "text-halo-color", "rgba(0,0,0,0.8)");
            map.setPaintProperty(layer.id, "text-halo-width", 1.5);
          } catch {
            // skip
          }
        }
        if (layer.type === "line" && layer.id.includes("road")) {
          try {
            map.setPaintProperty(layer.id, "line-color", "#52525b");
          } catch {
            // skip
          }
        }
        if (
          layer.type === "line" &&
          (layer.id.includes("street") ||
            layer.id.includes("secondary") ||
            layer.id.includes("tertiary"))
        ) {
          try {
            map.setPaintProperty(layer.id, "line-color", "#4a4a52");
          } catch {
            // skip
          }
        }
        if (
          layer.type === "line" &&
          (layer.id.includes("motorway") ||
            layer.id.includes("trunk") ||
            layer.id.includes("primary"))
        ) {
          try {
            map.setPaintProperty(layer.id, "line-color", "#636370");
          } catch {
            // skip
          }
        }
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const addMarkers = () => {
      document.querySelectorAll(".carpark-map-marker").forEach((el) => el.remove());

      markers.forEach((marker) => {
        const el = document.createElement("div");
        el.className = "carpark-map-marker";
        el.style.cssText = `
          background: var(--primary);
          color: var(--primary-foreground);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          white-space: nowrap;
        `;
        el.textContent = `${marker.count}`;
        el.addEventListener("click", () => onMarkerClick?.(marker.id));

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
        }).setHTML(
          `<div style="padding:4px 0">
            <strong style="font-size:13px">${marker.name}</strong>
          </div>`,
        );

        new mapboxgl.Marker({ element: el })
          .setLngLat([marker.lng, marker.lat])
          .setPopup(popup)
          .addTo(map);
      });
    };

    if (map.loaded()) {
      addMarkers();
    } else {
      map.on("load", addMarkers);
    }
  }, [markers]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/40 text-muted-foreground text-sm ${className ?? ""}`}
      >
        <div className="text-center max-w-xs px-4">
          <p className="font-medium">Mapbox token required</p>
          <p className="mt-1 text-xs">
            Set{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
            in your environment variables to display the map.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainerRef} className={className} />;
}
