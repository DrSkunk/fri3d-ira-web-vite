/* eslint-disable */
// @ts-nocheck

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function Button({ children, className, ...props }) {
  return (
    <button
      className="px-4 py-2 border hover:bg-gray-100 bg-white rounded"
      {...props}
    >
      {children}
    </button>
  );
}
export function App() {
  const iras;
  // return <div className="bg-red-200">App</div>;
  return (
    <div className="h-screen w-screen flex flex-col">
      <nav className="flex gap-4 px-4 py-2 bg-gradient-to-tr from-slate-50 to-slate-400">
        <Button>Map</Button>
        <Button>Grid</Button>
      </nav>
      <MapContainer
        center={[50.7993963, 4.654004, 15]}
        zoom={17}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxNativeZoom={18}
          maxZoom={40}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[50.7993963, 4.654004]}>
          <Popup>
            <div className="grid grid-cols-2 min-w-72 gap-3">
              <label className="text-right">Effect:</label>
              <select className="border px-4 py-2">
                <option>Select</option>
              </select>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
