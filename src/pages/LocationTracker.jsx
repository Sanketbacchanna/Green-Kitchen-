import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { MapPin, Navigation, Loader2, Home, Store } from 'lucide-react';

// Fix Leaflet's default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconRetinaUrl: iconRetina,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationTracker = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routingControl = useRef(null);
  
  const [startStr, setStartStr] = useState(() => {
    const saved = localStorage.getItem('restaurantAddress');
    if (!saved || saved === "Amma's Kitchen, Mumbai") {
      localStorage.setItem('restaurantAddress', "Amma's Kitchen, Bidar, Karnataka");
      return "Amma's Kitchen, Bidar, Karnataka";
    }
    return saved;
  });
  const [destinationStr, setDestinationStr] = useState(() => localStorage.getItem('lastDeliveryAddress') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAutoTracking, setIsAutoTracking] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map focused on Bidar, Karnataka
    mapInstance.current = L.map(mapRef.current).setView([17.9104, 77.5199], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance.current);

    // If both addresses are present in localStorage, trigger auto track
    const savedStart = localStorage.getItem('restaurantAddress') || 'Amma\'s Kitchen, Bidar, Karnataka';
    const savedDest = localStorage.getItem('lastDeliveryAddress');
    
    if (savedStart && savedDest) {
      setIsAutoTracking(true);
      performTracking(savedStart, savedDest).finally(() => {
        setIsAutoTracking(false);
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  const geocodeAddress = async (address) => {
    try {
      let searchStr = address;
      let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchStr)}`);
      let data = await response.json();
      
      // Fallback 1: If not found, try stripping the first part before comma (e.g., remove "Amma's Kitchen")
      if ((!data || data.length === 0) && address.includes(',')) {
        searchStr = address.substring(address.indexOf(',') + 1).trim();
        response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchStr)}`);
        data = await response.json();
      }

      // Fallback 2: Try appending the country if it still fails
      if (!data || data.length === 0) {
        response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchStr + ', India')}`);
        data = await response.json();
      }
      
      // Fallback 3: If it's a very long string, try just the last two words (often city and state/country)
      if ((!data || data.length === 0) && searchStr.split(' ').length > 2) {
          const words = searchStr.split(' ');
          const shortStr = words.slice(-2).join(' ');
          response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(shortStr)}`);
          data = await response.json();
      }

      if (data && data.length > 0) {
        return L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
      }
      return null;
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    }
  };

  const performTracking = async (startAddr, destAddr) => {
    setLoading(true);
    setError(null);

    const startLatLng = await geocodeAddress(startAddr);
    const destLatLng = await geocodeAddress(destAddr);

    if (!startLatLng || !destLatLng) {
      setError("Could not find one or both addresses. Please try different ones.");
      setLoading(false);
      return;
    }

    if (routingControl.current) {
      mapInstance.current.removeControl(routingControl.current);
    }

    routingControl.current = L.Routing.control({
      waypoints: [
        startLatLng,
        destLatLng
      ],
      routeWhileDragging: true,
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 6, opacity: 0.8 }] // Blue route color similar to standard maps
      },
      show: true, // show turn-by-turn instructions
      createMarker: function(i, wp, nWps) {
        // Create custom markers for start and end
        let popupContent = i === 0 ? "<b>Restaurant (Start)</b>" : "<b>Delivery Location (Home)</b>";
        
        return L.marker(wp.latLng, {
          draggable: false,
          icon: DefaultIcon
        }).bindPopup(popupContent);
      }
    }).addTo(mapInstance.current);

    // Fit map to route bounds
    const bounds = L.latLngBounds([startLatLng, destLatLng]);
    mapInstance.current.fitBounds(bounds, { padding: [50, 50] });

    setLoading(false);
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    
    if (!startStr.trim() || !destinationStr.trim()) {
      setError("Please enter both starting and destination addresses.");
      return;
    }

    await performTracking(startStr, destinationStr);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-100 mb-6 flex items-center gap-2">
        <Navigation className="text-primary" />
        Track Your Order
      </h1>

      <div className="bg-dark-lighter rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[700px] border border-gray-800">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 p-6 bg-dark border-r border-gray-800 flex flex-col">
          <h2 className="text-xl font-bold text-gray-200 mb-6">Route Details</h2>
          
          <form onSubmit={handleTrack} className="flex flex-col flex-1">
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                <Store size={16} className="text-blue-400" /> Restaurant Address (Start)
              </label>
              <input
                type="text"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                placeholder="e.g. Amma's Kitchen, Mumbai"
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-dark-lighter text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
            
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                <Home size={16} className="text-orange-400" /> Delivery Address (Destination)
              </label>
              <input
                type="text"
                value={destinationStr}
                onChange={(e) => setDestinationStr(e.target.value)}
                placeholder="e.g. 123 Main St, Mumbai"
                className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-dark-lighter text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-400 text-sm rounded-lg border border-red-900">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isAutoTracking || !startStr || !destinationStr}
              className="mt-auto w-full bg-primary hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {(loading || isAutoTracking) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
              {isAutoTracking ? 'Locating Route...' : 'Track Route'}
            </button>
          </form>
        </div>

        {/* Map Container */}
        <div className="w-full md:w-2/3 h-[400px] md:h-full relative">
          <div ref={mapRef} className="absolute inset-0 z-0 bg-gray-900" />
          
          {(loading || isAutoTracking) && (
            <div className="absolute inset-0 z-10 bg-dark/50 flex flex-col items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-white font-semibold text-lg drop-shadow-md">Calculating Route...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationTracker;
