import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService } from '@react-google-maps/api';
import styled from 'styled-components';
import { useMultiplayer } from './hooks/useMultiplayer';
import { usePlayerMovement } from './hooks/usePlayerMovement';

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
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const { players, currentPlayer } = useMultiplayer();
  const { isMoving } = usePlayerMovement(directionsService);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onDirectionsServiceLoad = useCallback((service: google.maps.DirectionsService) => {
    setDirectionsService(service);
  }, []);

  const onGoogleMapsLoad = useCallback(() => {
    setIsGoogleMapsLoaded(true);
  }, []);

  return (
    <LoadScript 
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
      onLoad={onGoogleMapsLoad}
    >
      <MapContainer>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentPlayer?.position || defaultCenter}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {isGoogleMapsLoaded && (
            <>
              <DirectionsService
                options={{
                  origin: currentPlayer?.position || defaultCenter,
                  destination: currentPlayer?.position || defaultCenter,
                  travelMode: google.maps.TravelMode.DRIVING
                }}
                onLoad={onDirectionsServiceLoad}
                callback={(result, status) => {
                  if (status === google.maps.DirectionsStatus.OK) {
                    console.log('Directions service response:', result);
                  }
                }}
              />
              
              {/* Render all players */}
              {Array.from(players.values()).map((player) => (
                <Marker
                  key={player.id}
                  position={player.position}
                  title={`Player ${player.id}`}
                  icon={{
                    url: player.id === currentPlayer?.id 
                      ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                      : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new google.maps.Size(32, 32)
                  }}
                />
              ))}
            </>
          )}
        </GoogleMap>
      </MapContainer>
    </LoadScript>
  );
};

export default App; 