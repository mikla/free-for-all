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