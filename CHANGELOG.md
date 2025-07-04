# Changelog

## [Latest] - Street-Only Movement System! 🛣️

### Added
- **Street-Only Movement**: Players can now only walk on streets, not through buildings or water!
  - **Google Maps Integration**: Uses Google Maps Directions API to validate street positions
  - **Real-time Validation**: Every movement is checked against actual street data
  - **Smart Snapping**: Player positions automatically snap to nearest street point
  - **Visual Feedback**: Clear notification when movement is blocked by buildings/water

### Technical Implementation
- **Street Validation**: `isOnStreet()` function checks if coordinates are on valid roads
- **Position Snapping**: `snapToStreet()` ensures players stay on street network
- **Movement Validation**: `validateMovement()` combines validation and snapping
- **Enhanced UI**: Visual notification system shows when movement is blocked
- **Improved Controls**: Larger movement steps (15m) for better street navigation

### Enhanced Gameplay Experience
- **Realistic Movement**: No more walking through buildings or swimming across rivers
- **Strategic Positioning**: Players must use actual street networks for navigation
- **Urban Combat**: Battles now happen on real street layouts and intersections
- **Authentic Geography**: Movement respects real-world city infrastructure

### Game Balance
- **25m Street Tolerance**: Positions within 25m of roads are considered valid
- **Graceful Fallbacks**: If validation fails, movement is allowed to prevent blocking
- **Smooth Transitions**: Movement speed optimized for street-based navigation
- **Error Handling**: Robust error handling prevents API failures from breaking movement

## [Previous] - Deployment Fixes! 🔧

### Fixed
- **Docker Build Path Issue**: Fixed deploy-simple.sh script to build Docker image from server/ directory
  - Script was looking for Dockerfile in root directory but it's located in server/ folder
  - Updated Docker build command to use correct path: `docker build -t game-server server/`
  - Resolves "failed to read dockerfile: open Dockerfile: no such file or directory" error

## [Previous] - IP-Based Geolocation Spawning! 🌍

### Added
- **IP-Based Spawn Locations**: Players now spawn near their actual geographic location!
  - **Automatic IP Detection**: Server detects player's IP address and converts to coordinates
  - **Real Location Spawning**: Players spawn in their actual city/region instead of London
  - **Random Offset**: ±1km random offset to prevent exact same spawn points
  - **Smart Fallback**: Falls back to London if geolocation fails or for local/VPN IPs
  - **Proxy Support**: Handles x-forwarded-for headers for reverse proxy setups

### Technical Implementation
- **ip-api.com Integration**: Free geolocation service (no API key required)
- **Async Spawn System**: Non-blocking geolocation with 5-second timeout
- **Multi-IP Detection**: Supports x-forwarded-for, x-real-ip, and direct IP detection
- **Error Handling**: Graceful fallback to London coordinates on any failure
- **Local IP Filtering**: Skips geolocation for localhost/private network IPs

### Enhanced Gameplay
- **Global Battle Royale**: Players worldwide can fight in their own neighborhoods
- **Location-Based Strategy**: Local knowledge of area gives tactical advantage
- **Real-World Integration**: Bridges virtual combat with actual geography
- **International Competition**: Players from different countries can meet and battle

## [Previous] - South Park Characters Addition! 🎉
### Added
- **South Park Character Expansion**: Added 10 hilarious South Park characters with absurd emojis!
  - 🍔 **Eric Cartman** - "Respects his authoritah!" (Orange)
  - 💀 **Kenny McCormick** - "Oh my God, they killed Kenny!" (Orange) 
  - 🤮 **Stan Marsh** - "This is pretty f***ed up right here" (Blue)
  - 🧠 **Kyle Broflovski** - "You bastards!" (Green)
  - 🌻 **Butters Stotch** - "Oh hamburgers!" (Gold)
  - 🍺 **Randy Marsh** - "I thought this was America!" (Brown)
  - 🎵 **Chef** - "Hello there children!" (Dark Red)
  - 🌿 **Towelie** - "Don't forget to bring a towel!" (Light Green)
  - 👙 **Underpants Gnomes** - "Phase 1: Collect underpants" (Purple)
  - 💩 **Mr. Hankey** - "Howdy ho!" (Brown)

### Enhanced Character Roster
- **Total Characters**: Now 20 unique characters (10 Doom + 10 South Park)
- **Absurd Emoji Combinations**: Each South Park character has hilariously inappropriate emoji representations
- **Authentic Quotes**: Character descriptions feature iconic South Park catchphrases
- **Color Themes**: Each character maintains unique color styling on map markers
- **Random Assignment**: Players get randomly assigned from entire expanded roster

### Technical Implementation
- Expanded character arrays in both client and server
- Maintained emoji-based marker system for consistency
- Character-specific color theming and descriptions
- South Park characters integrated into existing game mechanics

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial project setup
- Basic project structure
- README.md with project description and setup instructions
- CHANGELOG.md for tracking changes
- Added package.json with initial dependencies including Google Maps integration
- Created basic React application structure
- Added Google Maps integration with player marker
- Added basic styling and configuration files
- Added environment configuration for Google Maps API key
- Added .nvmrc file specifying Node.js version 22.16.0
- Added index.html for Vite application entry point
- Added TypeScript declarations for Vite environment variables
- Added plan.md with detailed implementation plan
- Added server implementation with Socket.IO
- Added client-side socket service
- Added multiplayer hook for player management
- Updated App component to display all players on the map
- Added detailed logging for player connections and disconnections
- Added street-based movement system
- Added keyboard controls (WASD/Arrow keys)
- Added street snapping and validation

### Changed
- Updated Node.js to v22.16.0 (LTS)
- Reinstalled dependencies with latest Node.js version
- Fixed environment variable access in App.tsx to use Vite's import.meta.env
- Updated plan.md to reflect single global map approach without room system 

## [Latest] - Death & Respawn System + Kill Tracking
### Added
- **Death System**: Players die when health reaches 0
- **Kill Tracking**: Players get +1 kill for each elimination
- **Death Screen**: Full-screen "YOU ARE DEAD" overlay with final score
- **Respawn System**: Click "RESPAWN" button to respawn at random location
- **Kill Counter UI**: Shows current kill count in top-left corner
- **Player Tooltips**: Hover over enemy markers to see their health and kill count
- **Dead Player Filtering**: Dead players don't appear on map or in combat

### Technical Details
- Enhanced Player interface with `kills` and `isDead` properties
- Added server-side kill tracking and respawn handling
- Implemented proper death state management across client/server
- Added `playerEliminated` and `playerRespawned` socket events
- Dead players cannot shoot or be targeted
- Respawn places players at random street locations with full health

### Game Mechanics
- Death occurs at 0 health (4 shots = elimination)
- Killer receives +1 to kill counter immediately
- Death screen shows final kill count
- Respawn restores 100 health and random position
- Dead players are invisible to others until respawn

## [Previous] - Fight Mode Implementation
### Fixed
- Fixed player visibility issue where current player marker was not visible
- Updated server to broadcast movement events to all clients including sender
- Added proper currentPlayer state updates when receiving movement from server 

## [Latest] - 2024-01-XX

### Fixed
- **Spawn Location Validation**: Players now spawn on valid street locations to prevent getting stuck in buildings or rivers
  - Added `findNearestStreet()` function to locate nearby streets within 1km radius
  - Added `validateSpawnLocation()` function to ensure spawn points are on streets
  - Created `useSpawnValidation` hook to automatically validate spawn locations when players connect
  - Added visual indicator during spawn validation process
  - Added "Rescue" button with 10-second cooldown for players who get stuck in invalid locations
  - Automatic position correction with distance logging for debugging

### Enhanced
- **Mobile-Friendly UI Redesign**: Complete responsive layout overhaul for better mobile and tablet experience
  - Reorganized UI into logical panels: TopLeftPanel (game info), TopRightPanel (actions), BottomPanel (instructions)
  - Fixed overlapping elements that were causing layout issues
  - Added responsive breakpoints for mobile devices (768px and below)
  - Improved visual hierarchy with consistent spacing and styling
  - Enhanced readability with better contrast and font sizes
  - Optimized touch targets for mobile interaction
  - Made VersionDisplay component mobile-friendly
- **Game-Like Map Themes**: Added multiple stylized Google Maps themes for immersive gameplay
  - Created 5 distinct themes: GTA 2 (classic tan/dark), Cyberpunk (dark blue/cyan), Military (grey/tactical), Retro (green/yellow), Neon (black/magenta)
  - Real-time theme switching with dropdown selector at top of map
  - Disabled default Google Maps UI elements for cleaner game appearance
  - Custom color schemes for roads, water, buildings, and labels
  - Enhanced immersion with game-appropriate visual styling
- **Car Emoji Characters**: Replaced all character emojis with car/vehicle emojis while keeping original names
  - Original character names preserved: Space Marine, Scout, Eric Cartman, Kenny, etc.
  - Visual representation now uses cars: 🏎️🚓🚒🚑🚕🚙🛻🚐🚌🏍️ and more
  - Authentic GTA visual feel while maintaining character personalities and descriptions
- **Mobile Touch Controls**: Added on-screen controls for mobile gameplay
  - Created `useMobileControls` hook for touch-based movement and actions
  - Added directional control buttons (↑ ← ↓ →) for movement
  - Added action buttons: Attack (⚔️) and Rescue (🆘)
  - Mobile controls only appear on touch devices and mobile screens (768px and below)
  - Integrated with existing street validation and movement system
  - Responsive button sizes with proper touch targets
  - Visual feedback on button press with scale animation
- **Attack Visual Feedback**: Added simple and clean attack indication
  - Players flash white with red border when attacked
  - Blink effect lasts 300ms for clear but non-intrusive feedback
  - Integrated with both keyboard (spacebar) and mobile (⚔️ button) attacks
  - Mobile attack button pulses and changes color when enemies are in range
  - Clean visual indication without leaving marks on the map
- Improved street movement validation system with better error handling
- Added spawn location debugging and logging

### Removed
- **Unused Animation System**: Cleaned up unused animated sprite code to simplify codebase
  - Removed `src/types/character.ts` - complex character type definitions
  - Removed `src/utils/spriteGenerator.ts` - GTA2-style sprite generation
  - Removed `src/components/AnimatedSprite.tsx` - animated sprite component
  - Removed `src/data/characters.ts` - enhanced character data with Doom/South Park characters
  - Removed `src/utils/characterEnhancer.ts` - character data enhancement utility
  - Game now uses simple, reliable emoji-based character markers

### Technical
- Enhanced `streetUtils.ts` with comprehensive spawn location validation
- Added client-side spawn position correction system
- Integrated spawn validation into main game loop
- Simplified codebase by removing unused animation features
- Implemented responsive CSS Grid layout for UI components

## [Previous Entries]
... existing changelog entries ... 