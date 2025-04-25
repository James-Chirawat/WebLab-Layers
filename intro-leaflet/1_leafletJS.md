### create html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>leaflet</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <link rel="stylesheet" href="style.css" />
  </head>

  <body>
    <div id="map"></div>
  </body>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script src="app.js"></script>
</html>
```

### กำหนด style

```css
#map {
  width: 100%;
  height: 500px;
  background-color: lightgray;
  border-radius: 10px;
  margin-top: 50px;
}
```

### create map

```js
var map = L.map("map", {
  scrollWheelZoom: true,
  center: [14.802808, 98.95017],
  zoom: 5,
});
```

### create base layers

```js
var osm = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}",
  {
    foo: "bar",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

var Esri_WorldStreetMap = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China(Hong Kong), Esri(Thailand), TomTom, 2012",
  }
);

var google_road = L.tileLayer(
  "https://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    lyr: "grod",
    isBase: "yes",
  }
);
var googleHybridge = L.tileLayer(
  "https://{s}.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    lyr: "ghyb",
    isBase: "yes",
  }
);
var googleTerrain = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=t,m&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    lyr: "gter",
    isBase: "yes",
  }
);
```

### create wms layers

```js
var thailand = L.tileLayer.wms("https://ogc.mapedia.co.th/geoserver/webgis/wms?", {
  layers: "webgis:prov_thailand",
  format: "image/png",
  transparent: true,
  attribution: "map by mapedia.co.th",
});

var province = L.tileLayer.wms("https://ogc.mapedia.co.th/geoserver/webgis/wms?", {
  layers: "webgis:th_pro",
  format: "image/png",
  transparent: true,
  attribution: "map by mapedia.co.th",
});

var amphoe = L.tileLayer.wms("https://ogc.mapedia.co.th/geoserver/webgis/wms?", {
  layers: "webgis:th_amp",
  format: "image/png",
  transparent: true,
  attribution: "map by mapedia.co.th",
});

var tambon = L.tileLayer.wms("https://ogc.mapedia.co.th/geoserver/webgis/wms?", {
  layers: "webgis:th_tam",
  format: "image/png",
  transparent: true,
  attribution: "map by mapedia.co.th",
});

```

### add layers to map

```js
osm.addTo(map);
thailand.addTo(map);
```

### create layer control

```js
var baseLayers = {
  "แผนที่ osm": osm.addTo(map),
  Esri_WorldStreetMap: Esri_WorldStreetMap,
  google_road: google_road,
  googleHybridge: googleHybridge,
  googleTerrain: googleTerrain,
};

var overlayLayers = {
  ขอบเขตจังหวัด: thailand.addTo(map),
};

L.control.layers(baseLayers, overlayLayers).addTo(map);
```
