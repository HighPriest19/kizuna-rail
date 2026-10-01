const createElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
};

const createTripCard = (trip) => {
    const card = createElement('article', `route-card ${trip.region || ''}`.trim());
    const header = createElement('div', 'route-header');
    header.append(
        createElement('h2', 'route-name', trip.name),
        createElement('span', 'route-region', trip.region)
    );

    const stations = createElement('div', 'station-info');
    for (const [label, station] of [['From:', trip.startStation], ['To:', trip.endStation]]) {
        const stationElement = createElement('div', 'station');
        stationElement.append(
            createElement('div', 'station-type', label),
            createElement('div', 'station-name', station)
        );
        if (label === 'To:') stations.append(createElement('div', 'route-arrow', '\u2192'));
        stations.append(stationElement);
    }

    const details = createElement('div', 'route-details');
    for (const [icon, label, value] of [
        ['\u{1F567}', 'Duration:', trip.duration],
        ['\u{1F4CD}', 'Distance:', `${trip.distance}km`]
    ]) {
        const detail = createElement('div', 'detail-item');
        const text = createElement('span');
        text.append(createElement('span', 'detail-label', `${label} `), document.createTextNode(value));
        detail.append(createElement('span', 'detail-icon', icon), text);
        details.append(detail);
    }
    const seasonDetail = createElement('div', 'detail-item');
    seasonDetail.append(createElement('span', `season-badge season-${trip.bestSeason}`, `Best in ${trip.bestSeason}`));
    details.append(seasonDetail);

    const highlights = createElement('div', 'highlights');
    const highlightList = createElement('div', 'highlights-list');
    (trip.highlights || []).forEach((highlight) => {
        highlightList.append(createElement('span', 'highlight-tag', highlight));
    });
    highlights.append(highlightList);

    const actions = createElement('div', 'route-actions');
    const detailsLink = createElement('a', 'view-details-btn', 'View Details and Book \u2192');
    detailsLink.href = `/routes/${encodeURIComponent(trip.id)}`;
    actions.append(detailsLink);

    card.append(
        header,
        stations,
        details,
        createElement('div', 'route-description', trip.description),
        highlights,
        actions
    );
    return card;
};

document.addEventListener('DOMContentLoaded', () => {
    const tripList = document.getElementById('trip-list');
    const resultsStatus = document.getElementById('trip-results-status');
    const pageStatus = document.getElementById('trip-page-status');
    const errorMessage = document.getElementById('trip-list-error');
    const previousButton = document.getElementById('trip-previous');
    const nextButton = document.getElementById('trip-next');
    let currentPage = 1;

    const loadPage = async (page) => {
        previousButton.disabled = true;
        nextButton.disabled = true;
        errorMessage.hidden = true;
        resultsStatus.textContent = 'Loading trips...';

        try {
            const response = await fetch(`/api/trips?page=${page}&limit=10`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Unable to load trips.');

            currentPage = result.metadata.currentPage;
            tripList.replaceChildren(...result.trips.map(createTripCard));
            resultsStatus.textContent = `Showing ${result.trips.length} of ${result.metadata.totalItems} trips.`;
            pageStatus.textContent = `Page ${currentPage} of ${result.metadata.totalPages}`;
            previousButton.disabled = currentPage <= 1;
            nextButton.disabled = currentPage >= result.metadata.totalPages;
        } catch (error) {
            tripList.replaceChildren();
            resultsStatus.textContent = '';
            errorMessage.textContent = error.message;
            errorMessage.hidden = false;
        }
    };

    previousButton.addEventListener('click', () => loadPage(currentPage - 1));
    nextButton.addEventListener('click', () => loadPage(currentPage + 1));
    loadPage(1);
});