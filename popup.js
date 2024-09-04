document.addEventListener('DOMContentLoaded', initializePopup);

function initializePopup() {
    chrome.storage.sync.get(['walkScoreApiKey', 'mapboxApiKey'], function (data) {
        if (!data.walkScoreApiKey || !data.mapboxApiKey) {
            showApiKeyInput();
        } else {
            checkUrlAndFetchScores();
        }
    });

    document.getElementById('saveKeys').addEventListener('click', saveApiKeys);
}

function showApiKeyInput() {
    document.getElementById('apiKeyInput').style.display = 'block';
}

function saveApiKeys() {
    const walkScoreApiKey = document.getElementById('walkScoreApiKey').value;
    const mapboxApiKey = document.getElementById('mapboxApiKey').value;
    chrome.storage.sync.set({ walkScoreApiKey, mapboxApiKey }, function () {
        document.getElementById('apiKeyInput').style.display = 'none';
        checkUrlAndFetchScores();
    });
}

function checkUrlAndFetchScores() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].url.startsWith('https://www.realtor.ca/real-estate/')) {
            fetchScores();
        } else {
            setElementText('scrapedAddress', 'Please navigate to a REALTOR.ca listing page.');
        }
    });
}

function fetchScores() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getAddress" }, function (response) {
            if (chrome.runtime.lastError) {
                setElementText('scrapedAddress', 'Error: ' + chrome.runtime.lastError.message + ' If on a REALTOR.ca listing page, please refresh.');
                return;
            }
            if (response && response.address) {
                parseAddressAndGetCoords(response.address);
            } else {
                setElementText('scrapedAddress', 'Address not found on page');
            }
        });
    });
}

function parseAddressAndGetCoords(address) {
    chrome.storage.sync.get('mapboxApiKey', function (data) {
        const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=CA&limit=1&access_token=${data.mapboxApiKey}`;
        fetch(mapboxUrl)
            .then(response => response.json())
            .then(data => {
                if (data.features && data.features.length > 0) {
                    const feature = data.features[0];
                    const [lon, lat] = feature.center;
                    const fullAddress = feature.place_name;
                    displayStaticMap(lat, lon, fullAddress);
                    displayFullAddress(fullAddress, lat, lon);
                    fetchWalkScore(fullAddress, lat, lon);
                } else {
                    throw new Error('No results found for the address');
                }
            })
            .catch(error => {
                setElementText('scores', `Error: ${error.message}`);
            });
    });
}

function displayStaticMap(lat, lon, fullAddress) {
    chrome.storage.sync.get('mapboxApiKey', function (data) {
        const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${lon},${lat})/${lon},${lat},15/300x200@2x?access_token=${data.mapboxApiKey}`;
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
        document.getElementById('mapContainer').innerHTML = `
            <a href="${googleMapsUrl}" target="_blank">
                <img src="${mapUrl}" alt="Map of the location" style="width: 100%; height: auto;">
            </a>
        `;
    });
}

function displayFullAddress(fullAddress, lat, lon) {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    setElementText('scrapedAddress', `<a href="${googleMapsUrl}" target="_blank">${fullAddress}</a>`, true);
}

function fetchWalkScore(address, lat, lon) {
    chrome.storage.sync.get('walkScoreApiKey', function (data) {
        const walkScoreUrl = `https://api.walkscore.com/score?format=json&address=${encodeURIComponent(address)}&lat=${lat}&lon=${lon}&transit=1&bike=1&wsapikey=${data.walkScoreApiKey}`;
        fetch(walkScoreUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === 1) {
                    let scoresHtml = `
                        <p><a href="https://www.walkscore.com/how-it-works/">Walk Score®</a>: <a href="https://www.walkscore.com/how-it-works/">${data.walkscore}</a></p>
                        ${data.bike ? `<p><a href="https://www.walkscore.com/how-it-works/">Bike Score®</a>: <a href="https://www.walkscore.com/how-it-works/">${data.bike.score}</a></p>` : ''}
                        ${data.transit ? `<p><a href="https://www.walkscore.com/how-it-works/">Transit Score®</a>: <a href="https://www.walkscore.com/how-it-works/">${data.transit.score}</a></p>` : ''}
                    `;
                    setElementText('scores', scoresHtml, true);
                } else {
                    throw new Error(`Walk Score API error: ${data.description}`);
                }
            })
            .catch(error => {
                setElementText('scores', `Error fetching Walk Score: ${error.message}`);
            });
    });
}

function setElementText(elementId, content, isHTML = false) {
    const element = document.getElementById(elementId);
    if (element) {
        if (isHTML) {
            element.innerHTML = content;
        } else {
            element.textContent = content;
        }
    }
}