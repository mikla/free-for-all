import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100vw;
  height: 100vh;
`;

const defaultCenter = {
  lat: 51.5074, // London coordinates as default
  lng: -0.1278
};

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const App: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [playerPosition, setPlayerPosition] = useState(defaultCenter);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
      <MapContainer>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          <Marker
            position={playerPosition}
            title="Player"
          />
        </GoogleMap>
      </MapContainer>
    </LoadScript>
  );
};

export default App; 