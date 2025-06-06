// Utility functions for creating character marker icons

export const createCharacterMarkerIcon = (character: any, size: number = 40, isCurrentPlayer: boolean = false): google.maps.Icon => {
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