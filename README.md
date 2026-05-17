# EVIVOR — Intelligent Wearable Guardian 🛡️✨

An advanced, full-stack IoT remote healthcare and emergency response ecosystem. **EVIVOR** is engineered to provide real-time, continuous monitoring of critical vitals for high-risk patients and the elderly, combined with an automated telemetry pipeline and intelligent crash/fall detection analytics. 

The system features a futuristic **Glassmorphic Dashboard** optimized for split-second clinical interpretation, integrated natively with a custom **Node.js telemetry engine** that ingests raw operational and environmental sensor data transmitted dynamically from a wearable **ESP32 microcontroller array**.

---

## 🚀 Core Architecture & Features

### 1. High-Performance Telemetry Pipeline
* **Real-time Stream Ingestion:** Ingests live biometrics including **Heart Rate (BPM)**, Blood Oxygen Saturation (**SpO2%**), and **Respiratory Rate** via structured JSON micro-packets over low-latency HTTP/REST.
* **Intelligent Data Fallback System:** Integrated an automated, high-fidelity algorithmic data simulation matrix inside the core business logic (`Logic.js`). If hardware disconnection or telemetry dropouts occur, the dashboard gracefully transitions to complex sinusoidal medical data models to guarantee uninterrupted analytical rendering and robust UI stability during clinical simulations.

### 2. Proactive Fall Detection & Contextual Alert Escalation
* **Automated Emergency Orchestration:** Utilizes cross-axis acceleration arrays to detect sudden kinetic drops. Upon fall registration, the frontend triggers a modal safety confirmation window.
* **Failsafe Dispatch Mechanism:** If the patient fails to dismiss the warning or manually signals distress within a critical timeout window, the node gateway automatically dispatches a deterministic emergency packet containing the user’s authenticated cryptographic National Identity token to designated emergency response teams or family networks.

### 3. Geospatial Intelligence & Reverse Geocoding
* **Dynamic Cartography Interface:** Features a dedicated spatial mapping layout (`LocationMap.jsx`) parsing exact hardware GPS coordinates (Lat/Lng).
* **Asynchronous Reverse Geocoding:** Leverages asynchronous API integrations via the OpenStreetMap Nominatim framework to dynamically resolve raw coordinates into human-readable micro-addresses (Street, District, City) instantly without rendering blocking overheads.
* **One-Click Deep Linking:** Includes automated intent links mapping coordinates directly onto native Google Maps modules for immediate route navigation.

### 4. Enterprise-Grade Multi-Profile Management
* **Local Session Ledgering:** Architected a localized relational state engine leveraging `localStorage` data structures to support zero-latency user-profile swapping (**Quick-Switch Architecture**).
* **Historical Health Log Archiving:** Periodically materializes and commits transactional records of vital signs to disk, providing client-side persistence for continuous historical trends and medical analytics over a customizable timeline.

### 5. Multi-Lingual Ergonomics
* **Dynamic Localization System:** Native, full-scale support for bi-directional layouts (**RTL/LTR**), optimizing system ergonomics dynamically between standard Arabic and English clinical views based on active profile schemas.

---

## 🏗️ Technical Stack

### **Frontend Infrastructure**
* **React (v18):** Declarative component architecture managing complex localized states.
* **Tailwind CSS:** Used modern utility classes to engineer a custom, premium **Glassmorphism visual design system** utilizing backdrop-blur layers, dynamic gradients, and unified accessibility.
* **Wouter Engine:** Extremely lightweight, minimal-overhead client-side routing solution eliminating unnecessary compilation footprint.
* **Framer Motion:** High-fidelity hardware-accelerated declarative animations managing spatial transitions, interstitial loading states, and emergency alert triggers.
* **Recharts Framework:** Renders high-performance, real-time responsive SVG area and line micro-charts displaying streaming medical biometrics.
* **TanStack React Query (v5):** Industrial asynchronous cache management engine handling polling states, error resilience, and server-client state harmonization.

### **Backend & Gateway Infrastructure**
* **Node.js & Express Framework:** High-throughput backend API service managing ingestion routing, Cross-Origin Resource Sharing (CORS) security configuration, and request body parsing.
* **Vite Dev Server (Proxy Matrix):** Production-grade bundle compilation configured with absolute multi-device host listening and a reverse-proxy layer mapping asynchronous `/api` requests seamlessly across ports (`5000` to `3001`) to mitigate CORS anomalies in development environments.

---

## 📂 System File Map & Repository Topology

```bash
├── index.html                 # Main SPA entrypoint injecting Tailwind layout engine CDN
├── vite.config.js             # Vite core configurations featuring customized development host/proxy mappings
├── server.js                  # Node.js gateway API server managing live telemetry packet streams from ESP32
├── main.jsx                   # React bootstrapper rendering app nodes under strict concurrency standards
├── App.jsx                    # Orchestrator core handling global session distribution, routing tables, and global views
├── Logic.js                   # Analytical layer handling telemetry ingestion, polling, and medical simulation matrices
├── Notification.jsx           # Decoupled component isolating fall detection workflows and fail-safe confirmation flows
└── LocationMap.jsx            # Geocoding module transforming telemetry location vectors into readable physical addresses