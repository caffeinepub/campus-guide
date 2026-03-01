# Campus Guide App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Campus location directory (departments, classrooms, labs)
- Interactive campus map with room/building markers
- QR code scanner to instantly navigate to a location
- QR code generator so admins can print codes for each room
- Location detail pages (name, description, floor, building, room number, category)
- Search and filter by category (Department, Classroom, Lab, Office, etc.)
- Admin panel to add/edit/remove campus locations

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend
- Data model: `Location` with fields: id, name, category (Department | Classroom | Lab | Office | Other), building, floor, roomNumber, description, createdAt
- CRUD: addLocation, updateLocation, deleteLocation, getLocation(id), getAllLocations, searchLocations(query, category)
- Admin check: only authenticated users with admin role can create/edit/delete locations
- Seed with sample campus locations for demo

### Frontend
- Mobile-first layout with bottom navigation (Map, Search, Scan, Admin)
- Campus Map tab: SVG or grid-based visual campus map with clickable building/room markers
- Search tab: list all locations with search bar and category filter chips
- Location detail modal/page: name, category badge, building, floor, room number, description
- QR Scanner tab: use QR code scanner to read a location ID, then show location detail
- QR Code display: each location detail page shows a QR code for that location (for printing)
- Admin tab (gated): form to add/edit/delete locations; accessible only when logged in
- Internet Identity login button for admin access
