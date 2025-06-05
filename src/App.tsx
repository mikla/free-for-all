import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, Circle } from '@react-google-maps/api';
import styled from 'styled-components';
import { useMultiplayer } from './hooks/useMultiplayer';
import { usePlayerMovement } from './hooks/usePlayerMovement';
import { useFightMode } from './hooks/useFightMode';

const MapContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

const FightModeIndicator = styled.div<{ isInFightMode: boolean }>`
  position: absolute;
  top: 20px;
  left: 20px;
  background: ${props => props.isInFightMode ? 'rgba(255, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)'};
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  z-index: 1000;
  font-weight: bold;
  border: 2px solid ${props => props.isInFightMode ? '#ff0000' : '#333'};
`;

const HealthBar = styled.div`
  position: absolute;
  top: 70px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
`;

const HealthBarFill = styled.div<{ health: number }>`
  width: ${props => props.health}%;
  height: 20px;
  background: ${props => 
    props.health > 50 ? '#4CAF50' : 
    props.health > 25 ? '#FF9800' : '#F44336'
  };
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const HealthBarContainer = styled.div`
  width: 200px;
  height: 20px;
  background: #333;
  border-radius: 3px;
  margin-top: 5px;
`;

const Instructions = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
  font-size: 14px;
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
  const { isInFightMode, nearbyPlayers, canShoot } = useFightMode();

  // Always center the map on the current player
  useEffect(() => {
    if (map && currentPlayer) {
      map.panTo(currentPlayer.position);
    }
  }, [map, currentPlayer]);

  useEffect(() => {
    if (currentPlayer) {
      console.log('currentPlayer.position changed:', currentPlayer.position);
    }
  }, [currentPlayer?.position]);

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

  if (currentPlayer) {
    console.log('Rendering currentPlayer marker at:', currentPlayer.position);
    const myPlayer = players.get(currentPlayer.id);
    console.log('Player entry in players map:', myPlayer);
    console.log('All players:', Array.from(players.entries()));
    console.log('Current player:', currentPlayer);
    console.log('Current player ID:', currentPlayer.id);
    console.log('Is current player in players map?', players.has(currentPlayer.id));
    console.log('Players map size:', players.size);
  } else {
    console.log('No current player available');
  }

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
              {/* Debug: Render a simple marker at defaultCenter */}
              <Marker position={defaultCenter} />
              {/* Render current player marker and a large circle */}
              {currentPlayer && (
                <>
                  <Marker
                    key={currentPlayer.id}
                    position={currentPlayer.position}
                    title={'You'}
                    label={{ text: 'You', color: 'white', fontWeight: 'bold' }}
                    icon={{
                      url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                      scaledSize: new google.maps.Size(32, 32)
                    }}
                  />
                  <Circle
                    center={currentPlayer.position}
                    radius={30}
                    options={{
                      fillColor: '#0000FF',
                      fillOpacity: 0.3,
                      strokeColor: '#0000FF',
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                    }}
                  />
                </>
              )}
              {/* Render other players */}
              {Array.from(players.values())
                .filter(player => player.id !== currentPlayer?.id)
                .map((player) => (
                  <Marker
                    key={player.id}
                    position={player.position}
                    title={`Player ${player.id}`}
                    icon={{
                      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                      scaledSize: new google.maps.Size(32, 32)
                    }}
                  />
              ))}
            </>
          )}
        </GoogleMap>
        <FightModeIndicator isInFightMode={isInFightMode}>
          {isInFightMode ? 'FIGHT MODE' : 'Normal Mode'}
        </FightModeIndicator>
        
        {currentPlayer && (
          <HealthBar>
            Health: {currentPlayer.health}/100
            <HealthBarContainer>
              <HealthBarFill health={currentPlayer.health} />
            </HealthBarContainer>
          </HealthBar>
        )}
        
        <Instructions>
          <div>WASD or Arrow Keys: Move</div>
          {isInFightMode && <div>SPACE: Shoot (when enemies nearby)</div>}
          {nearbyPlayers.length > 0 && (
            <div style={{ color: '#ff4444' }}>
              Enemies in range: {nearbyPlayers.length}
            </div>
          )}
        </Instructions>
      </MapContainer>
    </LoadScript>
  );
};

export default App; 