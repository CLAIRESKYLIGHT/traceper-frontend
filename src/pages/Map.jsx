import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Toast from "../components/Toast";
import SkeletonLoader from "../components/SkeletonLoader";

export default function Map() {
  const navigate = useNavigate();
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredBarangay, setHoveredBarangay] = useState(null);
  const [toast, setToast] = useState(null);
  const [mapImageLoaded, setMapImageLoaded] = useState(false);
  const [useGoogleMaps, setUseGoogleMaps] = useState(true); // Default to Google Maps
  const [mapType, setMapType] = useState("google"); // "image", "osm", "google"
  
  // Google Maps embed URL for Matnog, Sorsogon
  // Coordinates: Latitude: 12.6051087, Longitude: 124.041865
  // Zoom level: 12 (shows the whole municipality with better detail)
  // Lower zoom = wider view: z=10 (province), z=11 (municipality), z=12 (municipality detail), z=13 (town center), z=15 (streets)
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=Matnog,+Sorsogon&z=12&output=embed`;

  // Barangay positions on the map (percentage-based coordinates)
  // Format: { barangayName: { top: 'X%', left: 'Y%', width: 'Z%', height: 'W%' } }
  // You can adjust these positions based on your actual map image
  const barangayPositions = {
    // Example positions - adjust these to match your actual map
    // These are placeholder positions that you'll need to customize
  };

  useEffect(() => {
    fetchBarangays();
  }, []);

  const fetchBarangays = async () => {
    try {
      setLoading(true);
      const response = await API.get("/barangays");
      const barangaysData = response.data?.data || response.data || [];
      setBarangays(Array.isArray(barangaysData) ? barangaysData : []);
      
      // If no custom positions defined, create default positions in a grid
      if (Object.keys(barangayPositions).length === 0 && barangaysData.length > 0) {
        // This will be handled by the component rendering
      }
    } catch (err) {
      console.error("Error fetching barangays:", err);
      setError("Failed to load barangays.");
      setToast({ message: "Failed to load barangays. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleBarangayClick = (barangayId) => {
    navigate(`/barangays/${barangayId}`);
  };

  const handleBarangayHover = (barangay) => {
    setHoveredBarangay(barangay);
  };

  const handleBarangayLeave = () => {
    setHoveredBarangay(null);
  };

  // Calculate default positions in a grid if not provided
  const getBarangayPosition = (index, total) => {
    if (barangayPositions[barangays[index]?.name]) {
      return barangayPositions[barangays[index].name];
    }
    
    // Default grid layout
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const top = 15 + (row * (70 / Math.ceil(total / cols)));
    const left = 10 + (col * (80 / cols));
    
    return {
      top: `${Math.min(top, 85)}%`,
      left: `${Math.min(left, 85)}%`,
      width: `${80 / cols}%`,
      height: `${70 / Math.ceil(total / cols)}%`
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SkeletonLoader count={1} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-teal-800 bg-clip-text text-transparent">
                Matnog Map
              </h1>
              <p className="text-teal-600 mt-1 font-medium">Interactive map of Matnog barangays</p>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden">
          <div className="p-6 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-blue-100">
            <h2 className="text-xl font-bold text-teal-800 flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Municipality of Matnog
            </h2>
            <p className="text-sm text-teal-600 mt-1">
              {mapType === "google" 
                ? "Interactive Google Maps view of Matnog municipality" 
                : "Click on any barangay to view details"}
            </p>
          </div>

          <div className="relative bg-gray-100" style={{ minHeight: "600px" }}>
            {/* Map Image */}
            <div className="relative w-full h-full" style={{ minHeight: "600px" }}>
              {/* Static Map Image */}
              {mapType === "image" && (
                <img
                  src="/matnog-map.jpg"
                  alt="Matnog Municipality Map"
                  className="w-full h-auto object-contain"
                  onLoad={() => setMapImageLoaded(true)}
                  onError={() => {
                    // Try alternative formats if JPG fails
                    const img = document.querySelector('img[alt="Matnog Municipality Map"]');
                    if (img && img.src.includes('.jpg')) {
                      img.src = '/matnog-map.png';
                    } else if (img && img.src.includes('.png')) {
                      img.src = '/matnog-map.svg';
                    } else {
                      setMapImageLoaded(false);
                    }
                  }}
                  style={{ display: mapImageLoaded ? "block" : "none" }}
                />
              )}

              {/* OSM File Display - Note: OSM files need to be converted to image or rendered with Leaflet */}
              {mapType === "osm" && (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center p-8">
                    <svg className="w-24 h-24 text-teal-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-gray-700 text-lg font-semibold mb-2">OSM File Detected</p>
                    <p className="text-gray-500 text-sm mb-4">
                      OSM files are map data files, not images. You need to convert it to an image format.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-4">
                      <p className="text-xs font-semibold text-blue-900 mb-2">How to use your map.osm file:</p>
                      <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Convert OSM to image using an online tool like <a href="https://www.openstreetmap.org/export" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap Export</a></li>
                        <li>Or use software like QGIS, JOSM, or Maperitive to export as PNG/JPG</li>
                        <li>Save the exported image as <span className="font-mono bg-blue-100 px-1 rounded">matnog-map.jpg</span></li>
                        <li>Place it in the <span className="font-mono bg-blue-100 px-1 rounded">public</span> folder</li>
                      </ol>
                    </div>
                    <button
                      onClick={() => setMapType("image")}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                    >
                      Back to Image Map
                    </button>
                  </div>
                </div>
              )}
              
              {/* Google Maps Embed - Primary Option */}
              {mapType === "google" && (
                <iframe
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "600px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Matnog Municipality - Google Maps"
                ></iframe>
              )}

              {/* Google Maps Embed as Fallback for Image Mode */}
              {mapType === "image" && !mapImageLoaded && useGoogleMaps && (
                <iframe
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "600px" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Matnog Municipality - Google Maps"
                ></iframe>
              )}

              {/* Fallback if image not loaded and Google Maps not enabled */}
              {mapType === "image" && !mapImageLoaded && !useGoogleMaps && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100">
                  <div className="text-center p-8 max-w-md">
                    <svg className="w-24 h-24 text-teal-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-gray-700 text-lg font-semibold mb-2">Map Image Not Found</p>
                    <p className="text-gray-500 text-sm mb-4">
                      To display the interactive map, please add a map image named <span className="font-mono bg-gray-200 px-2 py-1 rounded">matnog-map.jpg</span> to the <span className="font-mono bg-gray-200 px-2 py-1 rounded">public</span> folder.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-4">
                      <p className="text-xs font-semibold text-blue-900 mb-2">Instructions:</p>
                      <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                        <li>If you have a <span className="font-mono bg-blue-100 px-1 rounded">map.osm</span> file, convert it to JPG/PNG first (see OSM conversion tools below)</li>
                        <li>Find or create a map image of Matnog municipality</li>
                        <li>Save it as <span className="font-mono bg-blue-100 px-1 rounded">matnog-map.jpg</span></li>
                        <li>Place it in the <span className="font-mono bg-blue-100 px-1 rounded">public</span> folder of your project</li>
                        <li>Refresh this page</li>
                      </ol>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">OSM to Image Conversion:</p>
                        <p className="text-xs text-blue-700">
                          Use <a href="https://www.openstreetmap.org/export" target="_blank" rel="noopener noreferrer" className="underline font-semibold">OpenStreetMap Export</a>, 
                          <a href="https://qgis.org/" target="_blank" rel="noopener noreferrer" className="underline font-semibold ml-1">QGIS</a>, or 
                          <a href="https://josm.openstreetmap.de/" target="_blank" rel="noopener noreferrer" className="underline font-semibold ml-1">JOSM</a> to convert OSM files to images.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          setMapType("google");
                          setUseGoogleMaps(true);
                        }}
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all font-medium flex items-center gap-2 shadow-lg shadow-teal-500/30 hover:shadow-xl"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Use Google Maps
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs mt-4">
                      You can still use the barangay list below to navigate to barangay details.
                    </p>
                  </div>
                </div>
              )}

              {/* Clickable Barangay Areas - Only show when map image is loaded */}
              {mapImageLoaded && barangays.length > 0 && (
                <div className="absolute inset-0">
                  {barangays.map((barangay, index) => {
                    const position = getBarangayPosition(index, barangays.length);
                    const isHovered = hoveredBarangay?.id === barangay.id;
                    
                    return (
                      <div
                        key={barangay.id}
                        className="absolute cursor-pointer group transition-all duration-200"
                        style={{
                          top: position.top,
                          left: position.left,
                          width: position.width || "8%",
                          height: position.height || "8%",
                        }}
                        onClick={() => handleBarangayClick(barangay.id)}
                        onMouseEnter={() => handleBarangayHover(barangay)}
                        onMouseLeave={handleBarangayLeave}
                      >
                        {/* Clickable Area Indicator */}
                        <div
                          className={`w-full h-full rounded-full border-2 transition-all duration-200 ${
                            isHovered
                              ? "bg-teal-500/30 border-teal-600 shadow-lg shadow-teal-500/50 scale-110"
                              : "bg-teal-500/10 border-teal-400 hover:bg-teal-500/20 hover:border-teal-500"
                          }`}
                        >
                          {/* Barangay Marker */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className={`w-4 h-4 rounded-full transition-all ${
                              isHovered ? "bg-teal-600 scale-125" : "bg-teal-500"
                            }`}></div>
                          </div>
                        </div>

                        {/* Tooltip on Hover */}
                        {isHovered && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                            <div className="bg-teal-700 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
                              <p className="font-semibold text-sm">{barangay.name}</p>
                              {barangay.population && (
                                <p className="text-xs text-teal-100 mt-1">
                                  Population: {barangay.population.toLocaleString()}
                                </p>
                              )}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                <div className="w-2 h-2 bg-teal-700 rotate-45"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Barangay List */}
          <div className="p-6 border-t border-teal-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Barangays ({barangays.length})
            </h3>
            {barangays.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No barangays found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {barangays.map((barangay) => (
                  <button
                    key={barangay.id}
                    onClick={() => handleBarangayClick(barangay.id)}
                    onMouseEnter={() => handleBarangayHover(barangay)}
                    onMouseLeave={handleBarangayLeave}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                      hoveredBarangay?.id === barangay.id
                        ? "bg-teal-50 border-teal-500 shadow-md transform scale-105"
                        : "bg-white border-gray-200 hover:border-teal-300 hover:bg-teal-50"
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-900">{barangay.name}</p>
                    {barangay.population && (
                      <p className="text-xs text-gray-500 mt-1">
                        {barangay.population.toLocaleString()} people
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Use
          </h3>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            {mapType === "google" ? (
              <>
                <li>Google Maps is currently displayed - you can zoom, pan, and explore Matnog municipality</li>
                <li>Click on any barangay in the list above to view its details</li>
                <li>Use the search and navigation controls in Google Maps to explore different areas</li>
                <li>To switch to a custom map image, add <code className="bg-blue-100 px-1 rounded">matnog-map.jpg</code> to the public folder</li>
              </>
            ) : mapImageLoaded ? (
              <>
                <li>Click on any barangay marker on the map to view its details</li>
                <li>Hover over markers to see barangay information</li>
                <li>Click on barangays in the list below to navigate to their details</li>
                <li>To customize barangay positions, edit the <code className="bg-blue-100 px-1 rounded">barangayPositions</code> object in the Map component</li>
              </>
            ) : (
              <>
                <li>Click on any barangay in the list above to view its details</li>
                <li>Add a map image to enable the interactive map view, or use Google Maps</li>
                <li>Once the map is added, you'll be able to click on markers directly on the map</li>
              </>
            )}
          </ul>
        </div>

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

