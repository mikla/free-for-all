# Changelog

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