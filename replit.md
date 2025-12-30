# craiko.net - Personal Website

## Overview
Personal website for Craiko featuring video essays, Deltarune Let's Plays, and other content. This is a static website built with HTML, CSS, and JavaScript, including an interactive browser-based platformer game.

## Project Structure
- **Root Directory**: Main website with multiple pages (index.html, about.html, blog.html, playlists.html, etc.)
- **time/ Directory**: Tiny Browser Platformer game with multiple levels
- **Static Assets**: Images, CSS styles, and JavaScript functionality

## Features
- **Main Website**: Multi-page site with navigation, responsive design, and interactive elements
- **Latest Video Display**: Automatically fetches and displays latest YouTube upload on homepage (channel ID: UCHZ5ShzneP6hEVYc9CKe2Jg)
- **Timeline Page**: Minimalist chronological timeline of channel milestones from 2019-2025
- **Works Page**: Unified grid layout showcasing 9 works including Earl Archive
- **3D Image Effects**: Interactive blog images with 3D rotation (mouse/touch support)
- **Game**: Browser-based 2D platformer with level editor, music, and controls
- **Responsive Design**: Mobile-friendly with glassmorphism UI elements

## Technical Setup
- **Server**: Python HTTP server on port 5000 (0.0.0.0 binding for Replit)
- **Deployment**: Configured for autoscale deployment target
- **No Build Process**: Static files served directly
- **Dependencies**: None (pure HTML/CSS/JavaScript)

## Game Controls
- **Movement**: A/← (left), D/→ (right)
- **Jump**: Space/W/↑ (double jump available)
- **Editor**: Keyboard shortcuts for level editing

## Recent Changes
- 2025-12-30: Replaced static hero image with auto-updating YouTube thumbnail - displays latest video as main hero image with play button overlay
- 2025-12-30: Added automatic YouTube latest video display on homepage with RSS feed, localStorage caching (15 min), multiple CORS proxy fallbacks, and XSS-safe DOM manipulation
- 2025-12-30: Created minimalist timeline page with channel milestones (2019-2025)
- 2025-12-30: Redesigned Works page to unified grid layout, added Earl Archive
- 2025-09-14: Initial import and setup in Replit environment
- Fixed game script path (main.js import)
- Configured workflow and deployment

## User Preferences
- Static website with no build tools
- Minimalist design - clean layouts, lowercase titles (except months)
- Focus on performance and simplicity
- Responsive design with glassmorphism effects

## Technical Details
- **YouTube Integration**: Uses RSS feed with CORS proxies (allorigins.win, corsproxy.io) for cross-origin requests
- **Caching**: localStorage caching with 15-minute TTL for API responses
- **Security**: XSS-safe DOM manipulation using createElement/textContent instead of innerHTML