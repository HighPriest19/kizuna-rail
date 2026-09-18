const hookRegionSorter = () => {
    const regionSelect = document.getElementById('region-filter');
    if (regionSelect) {
        regionSelect.addEventListener('change', () => {
            const selectedRegion = regionSelect.value;
            const url = new URL(window.location.href);

            if (selectedRegion && selectedRegion !== 'all') {
                url.searchParams.set('region', selectedRegion);
            } else {
                url.searchParams.delete('region');
            }
            
            window.location.href = url.toString();
        });
    }
};

const hookSeasonSorter = () => {
    const seasonSelect = document.getElementById('season-filter');
    if (seasonSelect) {
        seasonSelect.addEventListener('change', () => {
            const selectedSeason = seasonSelect.value;
            const url = new URL(window.location.href);

            if (selectedSeason && selectedSeason !== 'all') {
                url.searchParams.set('season', selectedSeason);
            } else {
                url.searchParams.delete('season');
            }
            
            window.location.href = url.toString();
        });
    }
};

const hookScenarioTasks = () => {
    const storageKey = 'kizuna-scenario-tasks';
    const pageUrl = window.location.pathname;
    const tasks = document.querySelectorAll('.scenario-tasks .task-item');
    
    // Load all scenario data from localStorage
    let allScenarios = {};
    try {
        const stored = localStorage.getItem(storageKey);
        allScenarios = stored ? JSON.parse(stored) : {};
    } catch (e) {
        allScenarios = {};
    }
    
    // Get completed tasks for this specific page
    let completedTasks = allScenarios[pageUrl] || [];
    
    // Get all valid task IDs currently on the page
    const validTaskIds = [];
    tasks.forEach((task) => {
        const checkbox = task.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.id) {
            validTaskIds.push(checkbox.id);
        }
    });
    
    // Clean up: remove task IDs that no longer exist on this page
    completedTasks = completedTasks.filter(id => validTaskIds.includes(id));
    allScenarios[pageUrl] = completedTasks;
    localStorage.setItem(storageKey, JSON.stringify(allScenarios));
    
    // Check off tasks that were previously completed
    tasks.forEach((task) => {
        const checkbox = task.querySelector('input[type="checkbox"]');
        if (!checkbox || !checkbox.id) return;
        
        if (completedTasks.includes(checkbox.id)) {
            checkbox.checked = true;
        }
        
        // Listen for changes and update localStorage
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (!completedTasks.includes(checkbox.id)) {
                    completedTasks.push(checkbox.id);
                }
            } else {
                completedTasks = completedTasks.filter(id => id !== checkbox.id);
            }
            allScenarios[pageUrl] = completedTasks;
            localStorage.setItem(storageKey, JSON.stringify(allScenarios));
        });
    });
};

const hydrateTripsList = async () => {
    const tripGrid = document.getElementById('trips-grid');
    if (!tripGrid) return;

    try {
        const response = await fetch('/api/trips');
        if (!response.ok) {
            throw new Error('Failed to fetch trips');
        }

        const trips = await response.json();

        if (!trips || trips.length === 0) {
            tripGrid.innerHTML = '<p>No trips found in the database.</p>';
            return;
        }

        tripGrid.innerHTML = trips.map((trip) => `
            <div class="card">
                <h3>${trip.title}</h3>
                <p>${trip.description}</p>
                <ul>
                    <li><strong>Duration:</strong> ${trip.duration}</li>
                    <li><strong>Origin:</strong> ${trip.originStationId}</li>
                    <li><strong>Destination:</strong> ${trip.destinationStationId}</li>
                </ul>
            </div>
        `).join('');
    } catch (error) {
        tripGrid.innerHTML = '<p>Unable to load trips right now.</p>';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    hookRegionSorter();
    hookSeasonSorter();
    hookScenarioTasks();
    hydrateTripsList();
});