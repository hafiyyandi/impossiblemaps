//MAP: MAPBOX VARIABLES
mapboxgl.accessToken = 'pk.eyJ1IjoiaGFmaXl5YW5kaSIsImEiOiJjamY5dmY1c2gwbXowMnFvZmJlYmVibGd0In0.djzLVWymjTzvRF6XSFM7uQ';

var map;

var geojson = {
    "type": "FeatureCollection",
    "features": []
};

var geojson2D = {
    "type": "FeatureCollection",
    "features": []
};

//MAP: DATA PARSING

var count = 0; //count of organization

var lat = '';
var lng = '';

var revArr = [];
var assetsArr = [];
var namesArr = [];

var revMin;
var revMax;

var assetMin;
var assetMax;

//CONTROLS: TOGGLE FOR DIFFERENT VIEW MODES
var isRev = true;
var is3D = true;

//CONTROLS: CATEGORY LABELS
var catArr = [
    [3, "Museums", '#FFBF00'],
    [4, "Performing Arts", '#EE6352'],
    [5, "Public Broadcasting & Media", '#08B2E3'],
    [6, "Libraries, Historical Societies, & Landmark Preservation", '#F4D4BF']
];

//CONTROLS: FILTER CONTROLS VALUE
var catMasterVal = 0;
var revMasterVal = 1;
var assetMasterVal = 0;

//CONTROLS: POPUP
var popup;

//!---------------------------!//
//START PARSING DATA
var orgs_data = (function() {
    var orgs_data = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': 'data/artorg.json',
        'dataType': "json",
        'success': function(data) {
            orgs_data = data;
            console.log("number of orgs: " + orgs_data.length);
        }
    });

    return orgs_data;

})();

var fin_data = (function() {
    var fin_data = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': 'data/financialrating2.json',
        'dataType': "json",
        'success': function(data) {
            fin_data = data;
            console.log("number of financial rating available: " + fin_data.length);
        }
    });

    return fin_data;

})();

var zipcode = (function() {
    var zipcode = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': 'data/zipcode.json',
        'dataType': "json",
        'success': function(data) {
            zipcode = data;
            //console.log("number of financial rating available: " +fin_data.length);
        }
    });

    return zipcode;

})();


if (fin_data && orgs_data && zipcode) {
    createGeoData();
}

//SAVE DATA FROM SOURCES AS GEOJSON DATA
function createGeoData() {
    console.log(fin_data.length);
    for (var i = 0; i < fin_data.length; i++) { //!! IMPORTANT: the sequence of data in artorg.json has to be exactly the same as financialrating.json
        var org_ein = orgs_data[i].ein;
        var fin_ein = fin_data[i].referenceOrganization.ein;

        //coordinates
        var zipData = parseInt(orgs_data[i].mailingAddress.postalCode);
        var lat;
        var lng;

        //CURRENT DATA PROPERTIES
        var charityName = orgs_data[i].charityName;
        var categoryName = orgs_data[i].category.categoryName;
        var causeName = orgs_data[i].cause.causeName;
        var causeID = orgs_data[i].cause.causeID;
        var nteeType = orgs_data[i].irsClassification.nteeType;
        var nteeClassification = orgs_data[i].irsClassification.nteeClassification;
        var streetAddress1 = orgs_data[i].mailingAddress.streetAddress1;
        var streetAddress2 = orgs_data[i].mailingAddress.streetAddress2;

        var programExpenses = fin_data[i].form990.programExpenses;
        var totalNetAssets = fin_data[i].form990.totalNetAssets;
        var totalExpenses = fin_data[i].form990.totalExpenses;
        var fundraisingExpenses = fin_data[i].form990.fundraisingExpenses;
        var administrativeExpenses = fin_data[i].form990.administrativeExpenses;
        var totalRevenue = fin_data[i].form990.totalRevenue;

        var primaryRevenueGrowth = fin_data[i].financialRating.performanceMetrics.primaryRevenueGrowth;
        var programExpensesRatio = fin_data[i].financialRating.performanceMetrics.programExpensesRatio;
        var fundraisingEfficiency = fin_data[i].financialRating.performanceMetrics.fundraisingEfficiency;
        var liabilitiesToAssetsRatio = fin_data[i].financialRating.performanceMetrics.liabilitiesToAssetsRatio;
        var administrationExpensesRatio = fin_data[i].financialRating.performanceMetrics.administrationExpensesRatio;
        var workingCapitalRatio = fin_data[i].financialRating.performanceMetrics.workingCapitalRatio;
        var programExpensesGrowth = fin_data[i].financialRating.performanceMetrics.programExpensesGrowth;

        for (var j = 0; j < zipcode.length; j++) {
            if (zipData == zipcode[j].ZIP) {
                lat = zipcode[j].LAT;
                lng = zipcode[j].LNG;

                //CONVERT COORDINATE INTO CIRCLES
                var center = [lng, lat];
                var radius = 0.1; //how big is the circle
                var options = { steps: 64, units: 'kilometers' };
                var circle = turf.circle(center, radius, options);
                var coord = turf.getCoords(circle);

                count++;

                //only visualize the data if zipcode is found
                revArr.push(totalRevenue);
                assetsArr.push(totalNetAssets);

                var lowerCaseName = charityName.toLowerCase()
                namesArr.push(lowerCaseName);


                //new object to save data features
                var newobject = {
                    "type": "Feature",
                    "properties": {
                        "charityName": charityName,
                        "categoryName": categoryName,
                        "causeName": causeName,
                        "causeID": causeID,
                        "nteeType": nteeType,
                        "nteeClassification": nteeClassification,
                        "streetAddress1": streetAddress1,
                        "streetAddress2": streetAddress2,
                        "programExpenses": programExpenses,
                        "totalNetAssets": totalNetAssets,
                        "totalExpenses": totalExpenses,
                        "fundraisingExpenses": fundraisingExpenses,
                        "administrativeExpenses": administrativeExpenses,
                        "totalRevenue": totalRevenue,
                        "primaryRevenueGrowth": primaryRevenueGrowth,
                        "programExpensesRatio": programExpensesRatio,
                        "fundraisingEfficiency": fundraisingEfficiency,
                        "liabilitiesToAssetsRatio": liabilitiesToAssetsRatio,
                        "administrationExpensesRatio": administrationExpensesRatio,
                        "workingCapitalRatio": workingCapitalRatio,
                        "programExpensesGrowth": programExpensesGrowth,

                        //For search functionality
                        "isVisible": true
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": coord
                    }
                }

                //for 2D Data
                var newobject2D = {
                    "type": "Feature",
                    "properties": newobject.properties,
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    }
                }

                geojson.features.push(newobject);
                geojson2D.features.push(newobject2D);
                break;
            }
        }

        //console.log("success: "+ count);

        if (i == (fin_data.length - 1)) {
            console.log("DONE!");

            revMin = Math.min.apply(null, revArr);
            revMax = Math.max.apply(null, revArr);

            assetMin = Math.min.apply(null, assetsArr);
            assetMax = Math.max.apply(null, assetsArr);

            console.log("revenue: " + revMin + ", " + revMax);
            console.log("asset: " + assetMin + ", " + assetMax);

            console.log(geojson);
            createMap(); //!!!ONLY CREATE MAP ONCE ALL DATA HAVE BEEN PARSED AS GEOJSON

        }
    }
}

//!---------------------------!//
//CREATE MAP
function createMap() {
    map = new mapboxgl.Map({
        container: 'map', // you need this
        style: 'mapbox://styles/examples/cj68bstx01a3r2rndlud0pwpv', // you also need this 
        center: [-73.997177, 40.750633], // [long, lat] Different than leaflet, different than google maps, same as geojson! 
        zoom: 10,
        pitch: 30
    });

    map.on('load', function() {
        map.addSource('orgs', { //id for the dataset
            'type': 'geojson',
            'data': geojson
        });

        map.addSource('orgs-2D', { //id for the dataset
            'type': 'geojson',
            'data': geojson2D
        });

        map.addLayer({ //3D, REVENUE
            'id': 'orgs-3D-REV',
            'type': 'fill-extrusion',
            'source': 'orgs',
            'paint': {
                'fill-extrusion-color': {
                    property: 'causeID',
                    stops: [
                        [3, '#FFBF00'],
                        [4, '#EE6352'],
                        [5, '#08B2E3'],
                        [6, '#F4D4BF']
                    ]
                },
                'fill-extrusion-height': {
                    property: 'totalRevenue',
                    stops: [
                        // [0,0],
                        // [assetMax,assetMax/1000]
                        [0, 0],
                        [revMax, revMax / 1000]
                    ]
                },
                'fill-extrusion-opacity': 0.75
            }

        });

        map.addLayer({ //3D, ASSET
            'id': 'orgs-3D-ASSET',
            'type': 'fill-extrusion',
            'source': 'orgs',
            'paint': {
                'fill-extrusion-color': {
                    property: 'causeID',
                    stops: [
                        [3, '#FFBF00'],
                        [4, '#EE6352'],
                        [5, '#08B2E3'],
                        [6, '#F4D4BF']
                    ]
                },
                'fill-extrusion-height': {
                    property: 'totalNetAssets',
                    stops: [
                        // [0,0],
                        // [assetMax,assetMax/1000]
                        [0, 0 / 1000],
                        [assetMax, assetMax / 1000]
                    ]
                },
                'fill-extrusion-opacity': 0.75
            }

        });

        map.addLayer({ //2D VIEW
            'id': 'orgs-2D',
            'type': 'circle',
            'source': 'orgs-2D',
            'paint': {
                'circle-radius': 5,
                'circle-opacity': 0.5,
                'circle-color': {
                    property: 'causeID',
                    stops: [
                        [3, '#FFBF00'],
                        [4, '#EE6352'],
                        [5, '#08B2E3'],
                        [6, '#F4D4BF']
                    ]
                }
            }

        });

        map.easeTo({
            duration: 1000,
            pitch: 60,
            bearing: 0,
            easing: (t) => {
                return t * (2 - t);
            }
        });

        map.setLayoutProperty('orgs-2D', 'visibility', 'none');
        map.setLayoutProperty('orgs-3D-ASSET', 'visibility', 'none');


    });

    //POPUP: ORGANIZATION DETAILS
    map.on('mouseenter', 'orgs-2D', function(e) {
        var feature = e.features[0];

        if (!feature) {
            return;
        }

        var rev = feature.properties['totalRevenue'].toLocaleString();
        var exp = feature.properties['totalExpenses'].toLocaleString();
        var asset = feature.properties['totalNetAssets'].toLocaleString();

        popup = new mapboxgl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setHTML('<div id=\'popup\' class=\'popup\' style=\'z-index: 10;\'> ' +
                feature.properties['charityName'].toUpperCase() + ' <br/>' +
                '<div class=\'whitebar\'></div>  ' +
                'Total Rev: $ ' + rev + ' <br/>' +
                'Total Expenses: $ ' + exp + ' <br/>' +
                'Total Assets: $ ' + asset + ' <br/>' +
                '<div class=\'whitebar\'></div>  ' +
                'Program Expenses Ratio: ' + feature.properties['programExpensesRatio'] + ' <br/>' +
                'Fundraising Efficiency: ' + feature.properties['fundraisingEfficiency'] + ' <br/>' +
                'Liabilities/Assets: ' + feature.properties['liabilitiesToAssetsRatio'] + ' </div>')
            .addTo(map);

    });

    map.on('mouseleave', 'orgs-2D', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });

}

//!---------------------------!//
//CONTROLS: CATEGORY RADIO BUTTON
var choices = $('#choices');
choices.html('<h3>FILTER BY CATEGORIES</h3>');
choices.append('<label class="categories">ALL<input type="radio" name="choices" value="0" checked="checked"/><span class="checkmark cat0"></span> </label>');

for (var i = 0; i < catArr.length; i++) {
    choices.append('<label class="categories">' + catArr[i][1] + '<input type="radio" name="choices" value="' + catArr[i][0] + '" /> <span class = "checkmark cat' + catArr[i][0] + '"></span></label>');
}

//CONTROLS: FILTER FUNCTIONS
$('input[name=view]').change(function() {
    if ($(this).is(':checked')) {
        //2D VIEW
        map.easeTo({
            duration: 2000,
            pitch: 0,
            bearing: 0,
            easing: (t) => {
                return t * (2 - t);
            }
        });

        map.setLayoutProperty('orgs-2D', 'visibility', 'visible');
        map.setLayoutProperty('orgs-3D-REV', 'visibility', 'none');
        map.setLayoutProperty('orgs-3D-ASSET', 'visibility', 'none');

        is3D = false;

    } else {
        // 3D VIEW
        map.easeTo({
            duration: 2000,
            pitch: 60,
            bearing: 0,
            easing: (t) => {
                return t * (2 - t);
            }
        });

        map.setLayoutProperty('orgs-2D', 'visibility', 'none');
        if (isRev) {
            map.setLayoutProperty('orgs-3D-REV', 'visibility', 'visible');
            map.setLayoutProperty('orgs-3D-ASSET', 'visibility', 'none');

        } else {
            map.setLayoutProperty('orgs-3D-REV', 'visibility', 'none');
            map.setLayoutProperty('orgs-3D-ASSET', 'visibility', 'visible');
        }

        is3D = true;

    }
});


$('input[name=revasset]').change(function() {
    if ($(this).is(':checked')) {
        //ASSET
        isRev = false;
        console.log("ASSET");

    } else {
        //REV
        isRev = true;
        console.log("REV");
    }

    if (is3D) {
        if (isRev) {
            console.log("revenue view");
            map.setLayoutProperty('orgs-3D-REV', 'visibility', 'visible');
            map.setLayoutProperty('orgs-3D-ASSET', 'visibility', 'none');
        } else {
            console.log("asset view");
            map.setLayoutProperty('orgs-3D-REV', 'visibility', 'none');
            map.setLayoutProperty('orgs-3D-ASSET', 'visibility', 'visible');
        }
    }

});

$('input[name=choices]').click(function() {
    // alert(this.value);
    catMasterVal = parseInt(this.value);
    masterFilter();
});

$('input[id=rev_slider]').on('input', function() {
    var revVal = this.value;
    revMasterVal = (parseInt(this.value)) * 1000000;
    masterFilter();
    //console.log(this.value);
    //val = parseInt(this.value);
    var sliderval = $('#rev_sliderval');
    sliderval.html("$ " + revVal + " million");
});

$('input[id=asset_slider]').on('input', function() {
    var assetVal = this.value;
    assetMasterVal = (parseInt(this.value)) * 1000000;
    masterFilter();
    //console.log(this.value);
    //val = parseInt(this.value);
    var sliderval = $('#asset_sliderval');
    sliderval.html("$ " + assetVal + " million");

});

$("#searchBar").on('change keydown paste input', function() {
    //console.log(this.value);
    if (this.value == null) { //if there is nothing, change all isVisible to true.
        for (var i = 0; i < namesArr.length; i++) {
            geojson.features[i].properties.isVisible = true;
            geojson2D.features[i].properties.isVisible = true;
        }
        map.getSource('orgs').setData(geojson);
        map.getSource('orgs-2D').setData(geojson2D);
        masterFilter();
    }
    searchFilter(this.value);
});


function masterFilter() {

    if (catMasterVal != 0) {
        var catFilter = ['==', 'causeID', catMasterVal];
    } else {
        var catFilter = ['>=', 'causeID', catMasterVal];
    }

    var revFilter = ['>=', 'totalRevenue', revMasterVal];
    var assetFilter = ['>=', 'totalNetAssets', assetMasterVal];
    var nameFilter = ['==', 'isVisible', true];

    var new_Filter = ["all", catFilter, revFilter, assetFilter, nameFilter];

    map.setFilter('orgs-2D', new_Filter);
    map.setFilter('orgs-3D-ASSET', new_Filter);
    map.setFilter('orgs-3D-REV', new_Filter);

}

function searchFilter(data) { //filter map using text input
    var searchQuery = data.toLowerCase();
    console.log("query: " + searchQuery);
    for (var i = 0; i < namesArr.length; i++) {
        if (!(namesArr[i].includes(searchQuery))) { //if searchQuery is not found in the names Array
            //console.log(i+" is hidden");

            //hide nodes
            geojson.features[i].properties.isVisible = false;
            geojson2D.features[i].properties.isVisible = false;
        } else {
            console.log(namesArr[i]);
            geojson.features[i].properties.isVisible = true;
            geojson2D.features[i].properties.isVisible = true;

        }
    }

    map.getSource('orgs').setData(geojson);
    map.getSource('orgs-2D').setData(geojson2D);

    masterFilter();
}