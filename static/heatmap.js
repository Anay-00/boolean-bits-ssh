/* ================================================
   Indore Grievance Heatmap — Algorithm & Rendering
   ================================================
   ALGORITHM OVERVIEW
   ─────────────────
   1. DATA COLLECTION
      • Pull all complaints from Firestore "complaints" collection.
      • Each doc should have { lat, lng, category, status }.
      • If Firestore is empty or unavailable, fall back to realistic
        seed data spread across Indore's wards.

   2. COORDINATE CLUSTERING (Spatial Bucketing)
      • Divide the Indore bounding box (~22.62°–22.82°N, 75.72°–75.96°E)
        into a grid of ~200 m cells.
      • Assign each complaint to a cell → count per cell = intensity.
      • This gives O(n) clustering without expensive pairwise distance.

   3. HEAT INTENSITY NORMALIZATION
      • For each cell: intensity = count / maxCount → [0, 1].
      • Leaflet.heat takes [lat, lng, intensity] triples.

   4. RENDERING
      • Use leaflet.heat (Canvas-based) to draw the gradient overlay.
      • Configure radius, blur, maxZoom, and gradient stops to produce
        a clear cool → warm → hot visualization.

   5. LIVE UPDATES (OPTIONAL)
      • If Firestore is available, attach onSnapshot listener so the
        heatmap updates in real time as new complaints arrive.
   ================================================ */

(function () {
    'use strict';

    /* ── Indore center & bounds ── */
    const INDORE_CENTER = [22.7196, 75.8577];
    const INDORE_ZOOM = 12;

    /* ── Grid-cell size in degrees (~200 m) ── */
    const CELL_SIZE = 0.002;

    /* ── Seed data: realistic complaint hotspots across Indore ── */
    const SEED_COMPLAINTS = [
        // Rajwada / Old City — Sanitation, Water
        { lat: 22.7196, lng: 75.8577, category: 'Sanitation' },
        { lat: 22.7190, lng: 75.8560, category: 'Water Supply' },
        { lat: 22.7185, lng: 75.8595, category: 'Sanitation' },
        { lat: 22.7200, lng: 75.8565, category: 'Sanitation' },
        { lat: 22.7193, lng: 75.8582, category: 'Water Supply' },
        { lat: 22.7188, lng: 75.8572, category: 'Sanitation' },
        { lat: 22.7201, lng: 75.8590, category: 'Sanitation' },
        { lat: 22.7182, lng: 75.8555, category: 'Sanitation' },

        // Vijay Nagar — Roads, Electricity
        { lat: 22.7533, lng: 75.8937, category: 'Roads & Infrastructure' },
        { lat: 22.7540, lng: 75.8920, category: 'Roads & Infrastructure' },
        { lat: 22.7528, lng: 75.8945, category: 'Electricity' },
        { lat: 22.7545, lng: 75.8930, category: 'Roads & Infrastructure' },
        { lat: 22.7535, lng: 75.8955, category: 'Electricity' },
        { lat: 22.7525, lng: 75.8910, category: 'Roads & Infrastructure' },
        { lat: 22.7550, lng: 75.8940, category: 'Electricity' },

        // Palasia — Mixed
        { lat: 22.7235, lng: 75.8817, category: 'Sanitation' },
        { lat: 22.7228, lng: 75.8825, category: 'Electricity' },
        { lat: 22.7240, lng: 75.8810, category: 'Water Supply' },
        { lat: 22.7232, lng: 75.8830, category: 'Roads & Infrastructure' },
        { lat: 22.7245, lng: 75.8820, category: 'Sanitation' },

        // MR-10 / Ring Road – Potholes
        { lat: 22.7450, lng: 75.8200, category: 'Roads & Infrastructure' },
        { lat: 22.7460, lng: 75.8220, category: 'Roads & Infrastructure' },
        { lat: 22.7440, lng: 75.8190, category: 'Roads & Infrastructure' },
        { lat: 22.7470, lng: 75.8210, category: 'Roads & Infrastructure' },
        { lat: 22.7455, lng: 75.8235, category: 'Roads & Infrastructure' },
        { lat: 22.7465, lng: 75.8180, category: 'Roads & Infrastructure' },

        // Bhawarkua — Water
        { lat: 22.7120, lng: 75.8680, category: 'Water Supply' },
        { lat: 22.7115, lng: 75.8690, category: 'Water Supply' },
        { lat: 22.7125, lng: 75.8675, category: 'Water Supply' },
        { lat: 22.7130, lng: 75.8695, category: 'Sanitation' },

        // Rau — Electricity, Sanitation
        { lat: 22.6600, lng: 75.8550, category: 'Electricity' },
        { lat: 22.6610, lng: 75.8540, category: 'Sanitation' },
        { lat: 22.6595, lng: 75.8560, category: 'Electricity' },
        { lat: 22.6615, lng: 75.8530, category: 'Electricity' },

        // Sudama Nagar — Water
        { lat: 22.6920, lng: 75.8770, category: 'Water Supply' },
        { lat: 22.6925, lng: 75.8760, category: 'Water Supply' },
        { lat: 22.6915, lng: 75.8780, category: 'Sanitation' },
        { lat: 22.6930, lng: 75.8755, category: 'Water Supply' },

        // Bhanwarkuan / Pipliyahana — Mixed
        { lat: 22.7380, lng: 75.8680, category: 'Sanitation' },
        { lat: 22.7370, lng: 75.8690, category: 'Water Supply' },
        { lat: 22.7390, lng: 75.8670, category: 'Roads & Infrastructure' },

        // Scheme 78 / AB Road — Mixed
        { lat: 22.7290, lng: 75.8870, category: 'Electricity' },
        { lat: 22.7285, lng: 75.8860, category: 'Roads & Infrastructure' },
        { lat: 22.7300, lng: 75.8880, category: 'Sanitation' },

        // Khandwa Road — Electricity
        { lat: 22.6850, lng: 75.8650, category: 'Electricity' },
        { lat: 22.6840, lng: 75.8660, category: 'Electricity' },
        { lat: 22.6860, lng: 75.8640, category: 'Sanitation' },

        // Nipania — Road
        { lat: 22.7620, lng: 75.9100, category: 'Roads & Infrastructure' },
        { lat: 22.7630, lng: 75.9110, category: 'Roads & Infrastructure' },
        { lat: 22.7615, lng: 75.9090, category: 'Roads & Infrastructure' },

        // Silicon City / Super Corridor
        { lat: 22.6800, lng: 75.9100, category: 'Electricity' },
        { lat: 22.6810, lng: 75.9110, category: 'Water Supply' },

        // Mhow Road — Diverse
        { lat: 22.6700, lng: 75.8400, category: 'Roads & Infrastructure' },
        { lat: 22.6710, lng: 75.8410, category: 'Sanitation' },
        { lat: 22.6690, lng: 75.8390, category: 'Water Supply' },
    ];

    /* ──────────────────────────────────
       STEP 1: Collect complaint data
       ────────────────────────────────── */
    function fetchComplaintsFromFirestore() {
        return new Promise((resolve) => {
            if (!window.db || typeof db.collection !== 'function') {
                console.warn('Firestore unavailable — using seed data for heatmap.');
                return resolve([]);
            }

            db.collection('complaints')
                .get()
                .then((snapshot) => {
                    const complaints = [];
                    snapshot.forEach((doc) => {
                        const d = doc.data();
                        if (d.lat && d.lng) {
                            complaints.push({
                                lat: parseFloat(d.lat),
                                lng: parseFloat(d.lng),
                                category: d.department || d.category || 'Other'
                            });
                        }
                    });
                    resolve(complaints);
                })
                .catch((err) => {
                    console.warn('Firestore read failed:', err.message);
                    resolve([]);
                });
        });
    }

    /* ──────────────────────────────────
       STEP 2: Spatial bucketing (grid clustering)
       ────────────────────────────────── */
    function clusterToGrid(complaints) {
        const grid = {};

        complaints.forEach((c) => {
            // Snap to grid cell
            const cellLat = Math.floor(c.lat / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2;
            const cellLng = Math.floor(c.lng / CELL_SIZE) * CELL_SIZE + CELL_SIZE / 2;
            const key = `${cellLat.toFixed(4)},${cellLng.toFixed(4)}`;

            if (!grid[key]) {
                grid[key] = { lat: cellLat, lng: cellLng, count: 0, categories: {} };
            }
            grid[key].count++;
            grid[key].categories[c.category] = (grid[key].categories[c.category] || 0) + 1;
        });

        return Object.values(grid);
    }

    /* ──────────────────────────────────
       STEP 3: Normalize intensities
       ────────────────────────────────── */
    function normalizeIntensities(cells) {
        if (!cells.length) return [];

        const maxCount = Math.max(...cells.map((c) => c.count));

        return cells.map((cell) => [
            cell.lat,
            cell.lng,
            // Floor at 0.35 so even single-complaint cells are clearly visible
            Math.max(0.35, cell.count / maxCount)
        ]);
    }

    /* ──────────────────────────────────
       STEP 4: Render map + heatmap
       ────────────────────────────────── */
    function renderMap(heatData, complaints) {
        const map = L.map('indoreMap', {
            center: INDORE_CENTER,
            zoom: INDORE_ZOOM,
            scrollWheelZoom: true,
            zoomControl: true
        });

        // OpenStreetMap tiles (free, works on localhost)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Heatmap layer — vibrant, high-contrast gradient
        if (heatData.length) {
            L.heatLayer(heatData, {
                radius: 35,
                blur: 15,
                maxZoom: 16,
                max: 1.0,
                minOpacity: 0.55,
                gradient: {
                    0.0:  '#0000ff',
                    0.15: '#00bfff',
                    0.3:  '#00ff80',
                    0.45: '#adff2f',
                    0.55: '#ffff00',
                    0.7:  '#ffa500',
                    0.85: '#ff4500',
                    1.0:  '#ff0000'
                }
            }).addTo(map);
        }

        // Update legend stats
        const totalComplaintsEl = document.getElementById('totalComplaints');
        const totalHotspotsEl = document.getElementById('totalHotspots');
        const topCategoryEl = document.getElementById('topCategory');

        if (totalComplaintsEl) totalComplaintsEl.textContent = complaints.length;
        if (totalHotspotsEl) totalHotspotsEl.textContent = heatData.length;

        // Find top category
        if (topCategoryEl && complaints.length) {
            const catCounts = {};
            complaints.forEach((c) => {
                catCounts[c.category] = (catCounts[c.category] || 0) + 1;
            });
            const topCat = Object.keys(catCounts).reduce((a, b) =>
                catCounts[a] > catCounts[b] ? a : b
            );
            topCategoryEl.textContent = topCat;
        }

        return map;
    }

    /* ──────────────────────────────────
       STEP 5: Optional live listener
       ────────────────────────────────── */
    function attachLiveUpdates(mapInstance) {
        if (!window.db || typeof db.collection !== 'function') return;

        let heatLayer = null;

        db.collection('complaints').onSnapshot((snapshot) => {
            const liveComplaints = [];
            snapshot.forEach((doc) => {
                const d = doc.data();
                if (d.lat && d.lng) {
                    liveComplaints.push({
                        lat: parseFloat(d.lat),
                        lng: parseFloat(d.lng),
                        category: d.department || d.category || 'Other'
                    });
                }
            });

            if (!liveComplaints.length) return;

            const cells = clusterToGrid(liveComplaints);
            const heatData = normalizeIntensities(cells);

            if (heatLayer) {
                mapInstance.removeLayer(heatLayer);
            }

            heatLayer = L.heatLayer(heatData, {
                radius: 35,
                blur: 15,
                maxZoom: 16,
                max: 1.0,
                minOpacity: 0.55,
                gradient: {
                    0.0:  '#0000ff',
                    0.15: '#00bfff',
                    0.3:  '#00ff80',
                    0.45: '#adff2f',
                    0.55: '#ffff00',
                    0.7:  '#ffa500',
                    0.85: '#ff4500',
                    1.0:  '#ff0000'
                }
            }).addTo(mapInstance);

            // Update stats
            const el = document.getElementById('totalComplaints');
            if (el) el.textContent = liveComplaints.length;
            const hs = document.getElementById('totalHotspots');
            if (hs) hs.textContent = heatData.length;
        }, (err) => {
            console.warn('Live heatmap listener error:', err.message);
        });
    }

    /* ──────────────────────────────────
       INIT — run full pipeline
       ────────────────────────────────── */
    async function init() {
        const mapEl = document.getElementById('indoreMap');
        if (!mapEl) return;

        // Step 1: Get data
        let complaints = await fetchComplaintsFromFirestore();

        // Fall back to seed data if Firestore empty
        if (!complaints.length) {
            // Add slight positional jitter to seed data for realism
            complaints = SEED_COMPLAINTS.map((c) => ({
                lat: c.lat + (Math.random() - 0.5) * 0.001,
                lng: c.lng + (Math.random() - 0.5) * 0.001,
                category: c.category
            }));
        }

        // Step 2: Cluster
        const cells = clusterToGrid(complaints);

        // Step 3: Normalize
        const heatData = normalizeIntensities(cells);

        // Step 4: Render
        const mapInstance = renderMap(heatData, complaints);

        // Step 5: Attach live updates
        attachLiveUpdates(mapInstance);
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
