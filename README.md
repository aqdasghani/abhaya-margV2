# TouristShield / AbhayaMarg 🛡️
> **Smart Tourist Safety Monitoring & Incident Response System**

TouristShield (AbhayaMarg) is a modern, full-stack tourist safety management platform designed to monitor tourist movements, protect travelers from environmental and regional hazards, issue verifiable digital Tourist IDs, and empower emergency responders with real-time incident command capabilities.

---

## Key Features

### 🧳 1. Tourist Safe Passage Portal
- **Verifiable Digital Tourist Pass**: Generates sequential, tamper-proof Tourist IDs (`TS-2026-XXXXX`) and dynamic QR verification codes.
- **Personal Safety Dashboard**: Real-time location tracking card, last known location fallback, and GPS status.
- **One-Touch SOS Distress Button**: Immediate emergency alert trigger capturing high-precision device coordinates, fallback to last known location, and direct call link to emergency contacts.
- **Hazard Proximity Warnings**: Live geofence proximity monitoring alerting tourists when entering high-risk disaster corridors.

### 🛡️ 2. Incident Command & Admin Console
- **Dedicated Admin Authentication**: Secure portal isolated from public tourist login, protected by administrative security keys.
- **Live Fleet Tracking**:
  - Interactive Leaflet map displaying active tourists across India.
  - **Google Maps-Style Movement Trails**: Inspect real-time and historical movement breadcrumbs with vibrant blue polyline trails (`#3b82f6`), start waypoints, and intermediate telemetry fixes.
  - Filter by live tracking status, search by tourist name or ID.
- **Official Government Hazard Database Integration**:
  - One-click API sync for official disaster management and hazard zones (NDMA landslide & flash-flood corridors, ASI heritage security perimeters, coastal rip-current danger zones).
  - Preserves full manual creation, editing, and activation/deactivation of custom safety geofences.
- **Atomic LOST Tourist Workflow**:
  - One-click "Report as LOST" that atomically flags the tourist status and generates an active incident record (`writeBatch`).
  - Single-click case resolution returning tourist to active state.

---

## Tech Stack

- **Frontend**: React 19, Vite, React Router v7
- **Styling**: Tailwind CSS v4
- **Mapping**: Leaflet, React-Leaflet
- **Backend & Database**: Firebase Authentication, Cloud Firestore
- **Security**: Field-level validation rules (`firestore.rules`), sequential transactional counter service

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- Firebase Project with Authentication (Email/Password) and Cloud Firestore enabled

### 2. Installation
```bash
# Clone repository
git clone https://github.com/your-username/abhayamarg.git
cd abhayamarg

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the project root based on `.env.example`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Admin Security Key for Officer Registration
VITE_ADMIN_INVITE_KEY=ABHAYA-ADMIN-2026

# Optional: Government Disaster & Safety Database API Endpoint
# VITE_GOV_GEOFENCE_API_URL=https://api.disaster.gov.in/v1/hazard-zones
```

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite local development server with HMR |
| `npm run build` | Compiles optimized production bundle into `dist/` |
| `npm run lint` | Runs ESLint across all source files |
| `npm run preview` | Locally previews the production build |
| `npm run deploy` | Builds and deploys hosting & rules to Firebase |
| `npm run deploy:hosting` | Deploys hosting bundle only |
| `npm run deploy:rules` | Deploys Firestore security rules and indexes |

---

## Database Security Rules
Security rules are defined in [`firestore.rules`](./firestore.rules) and enforce:
- Role-based separation between tourists and authorized administrators.
- Strict coordinate boundary validation (Latitude: $-90^\circ \le \text{lat} \le 90^\circ$, Longitude: $-180^\circ \le \text{lng} \le 180^\circ$).
- Sequential transactional increment verification on counter documents to prevent ID jumps or resets.
- Immutable audit timestamps on incidents and registration records.

Deploy rules via:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

---

## License
Private / Proprietary. Developed for tourist safety monitoring and incident management.