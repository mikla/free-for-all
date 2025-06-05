// Doom-inspired character system
export interface Character {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

// Doom-inspired characters with emoji representations
export const CHARACTERS: Character[] = [
  {
    id: 'marine',
    name: 'Space Marine',
    emoji: '🪖',
    color: '#4CAF50',
    description: 'Tough as nails marine'
  },
  {
    id: 'scout',
    name: 'Scout',
    emoji: '🏃',
    color: '#2196F3',
    description: 'Fast and agile'
  },
  {
    id: 'heavy',
    name: 'Heavy Gunner',
    emoji: '💪',
    color: '#FF5722',
    description: 'Strong and powerful'
  },
  {
    id: 'sniper',
    name: 'Sniper',
    emoji: '🎯',
    color: '#9C27B0',
    description: 'Precise and deadly'
  },
  {
    id: 'medic',
    name: 'Combat Medic',
    emoji: '⚕️',
    color: '#4CAF50',
    description: 'Heals and fights'
  },
  {
    id: 'engineer',
    name: 'Engineer',
    emoji: '🔧',
    color: '#FF9800',
    description: 'Builds and repairs'
  },
  {
    id: 'assassin',
    name: 'Assassin',
    emoji: '🥷',
    color: '#424242',
    description: 'Silent but deadly'
  },
  {
    id: 'berserker',
    name: 'Berserker',
    emoji: '😤',
    color: '#F44336',
    description: 'Rage-fueled warrior'
  },
  {
    id: 'cyborg',
    name: 'Cyborg',
    emoji: '🤖',
    color: '#607D8B',
    description: 'Half machine, all deadly'
  },
  {
    id: 'demon_hunter',
    name: 'Demon Hunter',
    emoji: '😈',
    color: '#9C27B0',
    description: 'Specialized in demon slaying'
  },
  // South Park Characters with Absurd Emojis
  {
    id: 'cartman',
    name: 'Eric Cartman',
    emoji: '🍔',
    color: '#FF6B35',
    description: 'Respects his authoritah!'
  },
  {
    id: 'kenny',
    name: 'Kenny McCormick',
    emoji: '💀',
    color: '#FFA500',
    description: 'Oh my God, they killed Kenny!'
  },
  {
    id: 'stan',
    name: 'Stan Marsh',
    emoji: '🤮',
    color: '#4169E1',
    description: 'This is pretty f***ed up right here'
  },
  {
    id: 'kyle',
    name: 'Kyle Broflovski',
    emoji: '🧠',
    color: '#228B22',
    description: 'You bastards!'
  },
  {
    id: 'butters',
    name: 'Butters Stotch',
    emoji: '🌻',
    color: '#FFD700',
    description: 'Oh hamburgers!'
  },
  {
    id: 'randy',
    name: 'Randy Marsh',
    emoji: '🍺',
    color: '#8B4513',
    description: 'I thought this was America!'
  },
  {
    id: 'chef',
    name: 'Chef',
    emoji: '🎵',
    color: '#8B0000',
    description: 'Hello there children!'
  },
  {
    id: 'towelie',
    name: 'Towelie',
    emoji: '🌿',
    color: '#90EE90',
    description: "Don't forget to bring a towel!"
  },
  {
    id: 'underpants_gnomes',
    name: 'Underpants Gnomes',
    emoji: '👙',
    color: '#9370DB',
    description: 'Phase 1: Collect underpants'
  },
  {
    id: 'mr_hankey',
    name: 'Mr. Hankey',
    emoji: '💩',
    color: '#8B4513',
    description: 'Howdy ho!'
  }
];

// Get a random character
export const getRandomCharacter = (): Character => {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
};

// Get character by ID
export const getCharacterById = (id: string): Character | undefined => {
  return CHARACTERS.find(char => char.id === id);
};

// Create custom marker icon data URL
export const createCharacterMarkerIcon = (character: Character, size: number = 32): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  canvas.width = size;
  canvas.height = size;
  
  // Draw background circle
  ctx.fillStyle = character.color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw emoji/character
  ctx.font = `${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(character.emoji, size / 2, size / 2);
  
  return canvas.toDataURL();
}; 