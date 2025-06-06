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

const BlockedMovementNotification = styled.div<{ show: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.9);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  z-index: 2000;
  font-weight: bold;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;
  border: 2px solid #ff4444;
  box-shadow: 0 4px 20px rgba(255, 0, 0, 0.3);
`;

const DeathOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  color: white;
`;

const DeathMessage = styled.h1`
  color: #ff4444;
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const RespawnButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  
  &:hover {
    background: #45a049;
  }
`;

const KillCounter = styled.div`
  position: absolute;
  top: 120px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
  font-weight: bold;
`;

const CharacterInfo = styled.div`
  position: absolute;
  top: 160px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CharacterEmoji = styled.span`
  font-size: 24px;
`;

const defaultCenter = {
  lat: 51.5074, // London coordinates as default
  lng: -0.1278
};

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Function to create character marker icon
const createCharacterMarkerIcon = (character: any, size: number = 40, isCurrentPlayer: boolean = false): google.maps.Icon => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return {
      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      scaledSize: new google.maps.Size(32, 32)
    };
  }
  
  canvas.width = size;
  canvas.height = size;
  
  // Draw background circle
  ctx.fillStyle = isCurrentPlayer ? '#2196F3' : character.color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Draw character emoji
  ctx.font = `${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(character.emoji, size / 2, size / 2);
  
  return {
    url: canvas.toDataURL(),
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2)
  };
};

const App: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const { players, currentPlayer, respawn } = useMultiplayer();
  const { showBlockedNotification } = usePlayerMovement(directionsService);
  const { isInFightMode, nearbyPlayers } = useFightMode();

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
              {currentPlayer && !currentPlayer.isDead && (
                <>
                  <Marker
                    key={currentPlayer.id}
                    position={currentPlayer.position}
                    title={`You (${currentPlayer.character.name})`}
                    icon={createCharacterMarkerIcon(currentPlayer.character, 40, true)}
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
                .filter(player => player.id !== currentPlayer?.id && !player.isDead)
                .map((player) => (
                  <Marker
                    key={player.id}
                    position={player.position}
                    title={`${player.character.name} (${player.health} HP, ${player.kills} kills)`}
                    icon={createCharacterMarkerIcon(player.character, 36, false)}
                  />
              ))}
            </>
          )}
        </GoogleMap>
        <FightModeIndicator isInFightMode={isInFightMode}>
          {isInFightMode ? 'FIGHT MODE' : 'Normal Mode'}
        </FightModeIndicator>
        
        {currentPlayer && (
          <>
            <HealthBar>
              Health: {currentPlayer.health}/100
              <HealthBarContainer>
                <HealthBarFill health={currentPlayer.health} />
              </HealthBarContainer>
            </HealthBar>
            
            <KillCounter>
              Kills: {currentPlayer.kills}
            </KillCounter>
            
            <CharacterInfo>
              <CharacterEmoji>{currentPlayer.character.emoji}</CharacterEmoji>
              <div>
                <div style={{ fontWeight: 'bold' }}>{currentPlayer.character.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {currentPlayer.character.description}
                </div>
              </div>
            </CharacterInfo>
          </>
        )}
        
        <Instructions>
          <div>WASD or Arrow Keys: Move</div>
          {isInFightMode && !currentPlayer?.isDead && <div>SPACE: Shoot (when enemies nearby)</div>}
          {nearbyPlayers.length > 0 && !currentPlayer?.isDead && (
            <div style={{ color: '#ff4444' }}>
              Enemies in range: {nearbyPlayers.length}
            </div>
          )}
        </Instructions>

        {/* Blocked Movement Notification */}
        <BlockedMovementNotification show={showBlockedNotification}>
          🚫 Can't walk through buildings! Try a street path.
        </BlockedMovementNotification>

        {/* Death Overlay */}
        {currentPlayer?.isDead && (
          <DeathOverlay>
            <h1 style={{ color: '#ff0000', fontSize: '4rem', marginBottom: '20px' }}>
              ☠️ YOU ARE DEAD ☠️
            </h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '10px' }}>
              Final Score: {currentPlayer.kills} kills
            </p>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.8 }}>
              You fought valiantly as {currentPlayer.character.emoji} {currentPlayer.character.name}
            </p>
            <button
              onClick={respawn}
              style={{
                padding: '15px 30px',
                fontSize: '1.2rem',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              RESPAWN
            </button>
          </DeathOverlay>
        )}
      </MapContainer>
    </LoadScript>
  );
};

export default App; 