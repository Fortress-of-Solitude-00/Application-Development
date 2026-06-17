let initialZoomLevel = 10;
let initialCenter = [1588911.734653, 6026906.806230];

// vectorSource is an empty container for features we draw
// ourselves (the click markers and the measurement line). It starts empty
// and we add/remove features from it as the user interacts with the map.
var vectorSource = new ol.source.Vector();

// vectorLayer wraps vectorSource so OpenLayers renders
// features inside it on top of the base map
var vectorLayer = new ol.layer.Vector({
source: vectorSource
});

// layers: the OSM tile layer is the base map; 
// vectorLayer is on top of it so our drawn points/lines show up above the base tiles
let mapObjectInput = {
layers: [
new ol.layer.Tile({
source: new ol.source.OSM()
}),
vectorLayer
],
target: 'map',
view: new ol.View({
center: initialCenter,
zoom: initialZoomLevel
})
};

var map = new ol.Map(mapObjectInput);

document.getElementById('zoom-out').onclick = function() {
var view = map.getView();
var zoom = view.getZoom();
view.setZoom(zoom - 1);
};

document.getElementById('zoom-in').onclick = function() {
var view = map.getView();
var zoom = view.getZoom();
view.setZoom(zoom + 1);
};

document.getElementById('reset').onclick = function() {
var view = map.getView();
view.animate({zoom: initialZoomLevel}, {center: initialCenter});
};

document.getElementById('left').onclick = function() {
var view = map.getView();
var currentCenter = view.getCenter();
view.animate({center: [currentCenter[0] - 100000, currentCenter[1]]});
};

document.getElementById('right').onclick = function() {
var view = map.getView();
var currentCenter = view.getCenter();
view.animate({center: [currentCenter[0] + 100000, currentCenter[1]]});
};

document.getElementById('up').onclick = function() {
var view = map.getView();
var currentCenter = view.getCenter();
view.animate({center: [currentCenter[0], currentCenter[1] + 100000]});
};

document.getElementById('down').onclick = function() {
var view = map.getView();
var currentCenter = view.getCenter();
view.animate({center: [currentCenter[0], currentCenter[1] - 100000]});
};

// Task 1

// measureMode: are we're currently waiting for the user to click?
// points: the coordinates of clicks (in EPSG:3857)
var measureMode = false;
var points = [];

// clicking "Measure Distance" turns measureMode true
document.getElementById('measure').addEventListener('click', function() {

measureMode = true;
points = [];

vectorSource.clear();

document.getElementById('result').innerHTML =
    "Click two points on the map.";


});

map.on('click', function(e) {

if (!measureMode) {
    return;
}

// records the coordinates of the click
points.push(e.coordinate);

// drawing a small red dot at the clicked location
var pointFeature = new ol.Feature({
    geometry: new ol.geom.Point(e.coordinate)
});

pointFeature.setStyle(
    new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
                color: 'red'
            })
        })
    })
);

vectorSource.addFeature(pointFeature);

// if we have two points, finish the measurement
if (points.length == 2) {

    // drawing a red line connecting the two clicked points
    var lineFeature = new ol.Feature({
        geometry: new ol.geom.LineString(points)
    });

    lineFeature.setStyle(
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2
            })
        })
    );

    vectorSource.addFeature(lineFeature);

    // straight-line (Euclidean) distance between the two points 
    var dx = points[1][0] - points[0][0];
    var dy = points[1][1] - points[0][1];

    var distance = Math.sqrt(dx * dx + dy * dy);

    // show the result on the page
    document.getElementById('result').innerHTML =
        "Distance: " +
        distance.toFixed(2) +
        " meters";

    // reset
    measureMode = false;
    points = [];
}

});

// Task 2

// options passed to the browser's geolocation API:
// enableHighAccuracy asks for the most precise location available
// timeout is how long (ms) to wait before giving up;
// maximumAge: 0 means always get a fresh location
const options = {
enableHighAccuracy: true,
timeout: 30000,
maximumAge: 0
};

// browser successfully retrieves the user's location
function success(pos) {

const crd = pos.coords;

// browser gives coordinates as long/lat (EPSG:4326);
// fromLonLat converts that into the map's projection (EPSG:3857) so it
// can be used directly as a view center
var coords = ol.proj.fromLonLat(
    [crd.longitude, crd.latitude]
);

// move/zoom the map to center on the user's location.
map.getView().animate({
    center: coords,
    zoom: 14
});

}

// error log if geolocation fails (e.g. permission denied, timeout, or
// the browser can't determine a location)
function error(err) {
console.warn(`ERROR(${err.code}): ${err.message}`);
}

// clicking the "My Location" button sets off the geolocation request,
// which will call success() or error() after the browser responds
document.getElementById('location').addEventListener('click', function() {
navigator.geolocation.getCurrentPosition(
success,
error,
options
);
});
