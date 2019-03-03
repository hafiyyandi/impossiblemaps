# impossiblemaps

![alt text](https://static.wixstatic.com/media/a544de_91cc379f953340ed8164a474016608a7~mv2_d_2872_1410_s_2.png/v1/fill/w_1308,h_642,al_c,q_85,usm_0.66_1.00_0.01/a544de_91cc379f953340ed8164a474016608a7~mv2_d_2872_1410_s_2.webp)

Final project code is in "final" folder.
See live [visualization](https://hafiyyandi.com/ny-arts-non-profits)

## Final: NY Arts & Cultural Non-Profits Visualizer
The map visualizes the revenue and assets of arts & cultural non-profits in New York state, based on their financial disclosure forms (990) of 2015. There are 2 main modes: 2D overview and 3D view. 

2D was designed for viewing each organization’s detail, while 3D view was to illustrate the difference of these organizations’ financials. Additionally, there are controls to easily filter out the data by name, subcategories, and amount of revenue and assets.

### Getting the data
Data was sourced from Charity Navigator’s API and saved as JSON files. Two datasets were used: [organization’s overview](https://charity.3scale.net/docs/data-api/reference#organization-collection) and [financial data](https://charity.3scale.net/docs/data-api/reference#rating-object-content-plan-).

### Creating the Map
#### (1) Parse data into GeoJSON
 * Each organization is a “feature” on the map
 * Each detail becomes a feature’s “property”
 * Match zip code of organization into lat & lng, using [Eric Hurst’s file](https://gist.github.com/erichurst/7882666)
 
#### (2) Create Map
 * Uses [mapbox-gl.js library](https://github.com/mapbox/mapbox-gl-js)
 * 3 layers: 3D visualization of Revenue, 3D of Asset, and 2D View.
 * In 3D view, height of column indicates amount of revenue/asset
 * Colors indicate categories: (a) Museums, (b) Performing Arts, (c) Public Broadcasting & Media, (d)Libraries, Historical Societies, & Landmark Preservation
 * 2D view: hover to reveal organization’s financial details as popup
 
#### (3) Map Controls
 * Toggle switch: 3D/2D, Revenue/Asset
 * Radio switch: Categories
 * Slider: Revenue / Asset Filter
 * Search box
