import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, Circle } from '@react-google-maps/api';
import styled from 'styled-components';
import { useMultiplayer } from './hooks/useMultiplayer';
import { usePlayerMovement } from './hooks/usePlayerMovement';
import { useFightMode } from './hooks/useFightMode';
import { useSpawnValidation } from './hooks/useSpawnValidation';
import { validateSpawnLocation } from './utils/streetUtils';
import { VersionDisplay } from './components/VersionDisplay';

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

const MapContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

// Top-left UI panel for main game info
const TopLeftPanel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 280px;
  
  @media (max-width: 768px) {
    max-width: 250px;
    top: 5px;
    left: 5px;
  }
`;

const FightModeIndicator = styled.div<{ isInFightMode: boolean }>`
  background: ${props => props.isInFightMode ? 'rgba(255, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.8)'};
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: bold;
  border: 2px solid ${props => props.isInFightMode ? '#ff0000' : '#333'};
  font-size: 14px;
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const HealthBar = styled.div`
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #333;
`;

const HealthBarFill = styled.div<{ health: number }>`
  width: ${props => props.health}%;
  height: 16px;
  background: ${props => 
    props.health > 50 ? '#4CAF50' : 
    props.health > 25 ? '#FF9800' : '#F44336'
  };
  border-radius: 3px;
  transition: width 0.3s ease;
  
  @media (max-width: 768px) {
    height: 14px;
  }
`;

const HealthBarContainer = styled.div`
  width: 180px;
  height: 16px;
  background: #333;
  border-radius: 3px;
  margin-top: 4px;
  
  @media (max-width: 768px) {
    width: 150px;
    height: 14px;
  }
`;

const KillCounter = styled.div`
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: bold;
  border: 1px solid #333;
  font-size: 14px;
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const CharacterInfo = styled.div`
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #333;
  font-size: 13px;
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
    gap: 6px;
  }
`;

const CharacterEmoji = styled.span`
  font-size: 18px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

// Top-right UI panel for actions
const TopRightPanel = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @media (max-width: 768px) {
    top: 5px;
    right: 5px;
  }
`;

const SpawnValidationIndicator = styled.div<{ isValidating: boolean }>`
  background: rgba(255, 165, 0, 0.95);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  display: ${props => props.isValidating ? 'block' : 'none'};
  border: 2px solid #ff8c00;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 5px 8px;
    font-size: 10px;
  }
`;

const RescueButton = styled.button`
  background: rgba(255, 69, 0, 0.95);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  font-weight: bold;
  border: 2px solid #ff4500;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 69, 0, 1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 10px;
  }
`;

// Bottom UI panel for instructions
const BottomPanel = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
  
  @media (max-width: 768px) {
    bottom: 5px;
    left: 5px;
    right: 5px;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
`;

const Instructions = styled.div`
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  border: 1px solid #333;
  max-width: 300px;
  
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 6px 10px;
    max-width: 100%;
  }
`;

const BlockedMovementNotification = styled.div<{ show: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.95);
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  z-index: 2000;
  font-weight: bold;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: none;
  border: 2px solid #ff4444;
  box-shadow: 0 4px 20px rgba(255, 0, 0, 0.3);
  font-size: 14px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 12px;
    max-width: 250px;
  }
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
  text-align: center;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
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
  const { players, currentPlayer, respawn, updatePosition } = useMultiplayer();
  const { showBlockedNotification } = usePlayerMovement(directionsService);
  const { isInFightMode, nearbyPlayers } = useFightMode();
  const { isValidatingSpawn } = useSpawnValidation(directionsService, currentPlayer, updatePosition);
  const [rescueCooldown, setRescueCooldown] = useState(0);

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

  // Rescue function for stuck players
  const rescuePlayer = useCallback(async () => {
    if (!currentPlayer || !directionsService || rescueCooldown > 0) return;
    
    console.log('Rescuing stuck player...');
    setRescueCooldown(10); // 10 second cooldown
    
    try {
      // Try to find a nearby street
      const rescuePosition = await validateSpawnLocation(currentPlayer.position, directionsService);
      updatePosition(rescuePosition);
      
      // Start cooldown timer
      const timer = setInterval(() => {
        setRescueCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error rescuing player:', error);
      setRescueCooldown(0);
    }
  }, [currentPlayer, directionsService, updatePosition, rescueCooldown]);

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
        <TopLeftPanel>
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
        </TopLeftPanel>
        
        <TopRightPanel>
          <SpawnValidationIndicator isValidating={isValidatingSpawn}>
            🔍 Finding nearest street...
          </SpawnValidationIndicator>
          
          <RescueButton onClick={rescuePlayer} disabled={rescueCooldown > 0}>
            {rescueCooldown > 0 ? `Rescuing in ${rescueCooldown} seconds` : 'Rescue'}
          </RescueButton>
        </TopRightPanel>

        <BottomPanel>
          <Instructions>
            <div>WASD or Arrow Keys: Move</div>
            {isInFightMode && !currentPlayer?.isDead && <div>SPACE: Shoot (when enemies nearby)</div>}
            {nearbyPlayers.length > 0 && !currentPlayer?.isDead && (
              <div style={{ color: '#ff4444' }}>
                Enemies in range: {nearbyPlayers.length}
              </div>
            )}
          </Instructions>
        </BottomPanel>

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

        <VersionDisplay />
      </MapContainer>
    </LoadScript>
  );
};

export default App; 