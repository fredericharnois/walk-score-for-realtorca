# Walk Score® for REALTOR.ca Chrome Extension

## Overview

This Chrome extension enhances your REALTOR.ca browsing experience by displaying Walk Score®, Bike Score®, and Transit Score® information for property listings.
## Features

- Automatically detects and extracts property addresses from REALTOR.ca listing pages
- Displays Walk Score®, Bike Score®, and Transit Score® (where available) for the current listing
- Shows a static map of the property location
- Provides clickable links to view the location on Google Maps

## Installation

1. Clone this repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Configuration

Before using the extension, you need to set up API keys:

1. Get a Walk Score API key from [Walk Score Professional](https://www.walkscore.com/professional/api.php).
2. Get a Mapbox API key from [Mapbox](https://www.mapbox.com/).
3. Click on the extension icon in Chrome.
4. Enter your API keys in the provided fields and click "Save Keys".

## Usage

1. Navigate to a property listing page on REALTOR.ca.
2. Click the extension icon in your Chrome toolbar.
3. The popup will display the property's address, a static map, and the available scores.

## Files Description

- `manifest.json`: Defines the extension's properties, permissions, and scripts.
- `content.js`: Extracts the property address from the REALTOR.ca listing page.
- `popup.html`: The HTML structure for the extension's popup interface.
- `popup.js`: Handles the logic for the popup, including API calls and data display.

## Dependencies

- [Walk Score API](https://www.walkscore.com/professional/api.php)
- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)
- [Mapbox Static Maps API](https://docs.mapbox.com/api/maps/static-images/)

## Privacy

This extension does not collect or store any personal data. It only processes the current page's address to fetch publicly available Walk Score® data.

## Disclaimer

Walk Score® is a registered trademark of Walk Score Inc. This extension is not affiliated with or endorsed by Walk Score Inc. or REALTOR.ca.

## Support

For issues, feature requests, or contributions, please open an issue or pull request in this repository.
