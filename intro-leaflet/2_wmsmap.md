### 1 create html
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <!-- เรียกใช้งาน css librar -->
</head>

<body>
    <!-- ออกแบบการแสดงผล -->

</body>
<!-- เรียกใช้งาน js library -->

</html>
```
### 2 add css framework
```html
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <!-- add leaflet css -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
    <!-- add custom css -->
    <link rel="stylesheet" href="./style.css">
```

### 3 add js library
```html
<!-- add jquery -->
<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<!-- add bootstrap js -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4"
    crossorigin="anonymous"></script>
<!-- add leaflet js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<!-- add js scrip -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<script src="./app.js"></script>
```

### 4 add nav bar
```html
     <nav class="navbar navbar-expand-lg bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Navbar</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="#">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Link</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                            aria-expanded="false">
                            Dropdown
                        </a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#">Action</a></li>
                            <li><a class="dropdown-item" href="#">Another action</a></li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><a class="dropdown-item" href="#">Something else here</a></li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link disabled">Disabled</a>
                    </li>
                </ul>
                <form class="d-flex" role="search">
                    <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                    <button class="btn btn-outline-success" type="submit">Search</button>
                </form>
            </div>
        </div>
    </nav>
```

### 5 add div
```html
    <div class="container mt-3">
        <div class="row">
            <!-- add map -->
            <div class="col-8">
                <div class="card">
                    <div class="card-body">
                        <div id="map"></div>
                    </div>
                </div>
            </div>
            <!-- add feature info -->
            <div class="col-4">
                <div class="card">
                    <div class="card-body">
                        <div id="feature-info">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- add chart -->
        <div class="row mt-3">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <div id="chart"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
```

### 6 create css
```css
#map {
    width: 100%;
    height: 350px;
    background-color: powderblue;
}

#feature-info {
    width: 100%;
    height: 350px;
    background-color: powderblue;
}

#chart {
    width: 100%;
    height: 250px;
    background-color: powderblue;
}
```

### 7 create map
```js
var map = L.map('map', {
    center: [16.949777781722553, 100.54530779528845],
    zoom: 10
});
```

### 8 add tile layer: OSM
```js
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?', {
    attribution: 'OSM'
}).addTo(map);
```

### 9 add tile layer:google maps
```js
var google_road = L.tileLayer("https://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    lyr: "grod",
    isBase: "yes",
});

var googleHybridge = L.tileLayer("https://{s}.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    lyr: "ghyb",
    isBase: "yes",
});
```

### 10 add wms layer
```js
var province = L.tileLayer.wms("https://ogc.mapedia.co.th/geoserver/webgis/wms?", {
    layers: "webgis:th_pro",
    format: "image/png",
    transparent: true,
    cql_filter: "pro_code=65",
    attribution: "map by mapedia.co.th",
});

var amphoe = L.tileLayer.wms("https://ogc.mapedia.co.th/geoserver/webgis/wms?", {
    layers: "webgis:th_amp",
    format: "image/png",
    transparent: true,
    cql_filter: "pro_code=65",
    attribution: "map by mapedia.co.th",
});

var tambon = L.tileLayer.wms("https://ogc.mapedia.co.th/geoserver/webgis/wms?", {
    layers: "webgis:th_tam",
    format: "image/png",
    transparent: true,
    cql_filter: "pro_code=65",
    attribution: "map by mapedia.co.th",
});
```

### 11 add control
```js
var baseLayers = {
    "OSM": osm,
    "Google Road": google_road,
    "Google Hybridge": googleHybridge
};

var overlays = {
    "Province": province,
    "Amphoe": amphoe,
    "Tambon": tambon
};

L.control.layers(baseLayers, overlays).addTo(map);
```

### 12 add getfeatureinfo
```js
map.on('click', function (evt) {
    var url = getFeatureInfoFn(evt.latlng)
    fetch(url)
        .then(response => response.text())
        .then(data => {
            let dat = JSON.parse(data);
            // enable function
            // addDataToCard(dat);
            // showEchart(dat);
            if (dat.features.length > 0) {
                console.log(dat.features);
                L.popup()
                    .setLatLng(evt.latlng)
                    .setContent(
                        dat.features.map(i => "น้ำฝน: " + i.id + ": " + i.properties.rain + " mm. <br>").toString()
                    )
                    .openOn(map);
            }
        });
});

function getFeatureInfoFn(k) {
    let lyrArr = ['raintam2555', 'raintam2556', 'raintam2557'];
    let latlng = { lat: k.lat, lng: k.lng }
    let lyrs = lyrArr.toString();
    let pnt = map.latLngToContainerPoint(latlng, map.getZoom());
    let size = map.getSize();
    let bbox = map.getBounds().toBBoxString();

    return "https://ogc.mapedia.co.th/geoserver/webgis/wms?SERVICE=WMS" +
        "&VERSION=1.1.1&REQUEST=GetFeatureInfo" +
        "&QUERY_LAYERS=" + lyrs +
        "&LAYERS=" + lyrs +
        "&Feature_count=300" +
        "&INFO_FORMAT=application/json" +
        "&X=" + Math.round(pnt.x) +
        "&Y=" + Math.round(pnt.y) +
        "&SRS=EPSG:4326" +
        "&WIDTH=" + size.x +
        "&HEIGHT=" + size.y +
        "&BBOX=" + bbox;
}
```

### 13 add data to card div
```js
function addDataToCard(dat) {
    document.getElementById('feature-info').innerHTML = ' <ul id="list"></ul>';
    dat.features.map(i => {
        document.getElementById('list').innerHTML += '<li>ต.' + i.properties.TB_TN +
            ' ปี ' + (i.id).replace('raintam', '').split(".")[0] +
            ' ปริมาณ ' + i.properties.rain + 'มม.</li>'
    })
}
```

### 14 add legend
```js
var legend_province = "https://ogc.mapedia.co.th/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=webgis:th_pro";
var legend_amphoe = "https://ogc.mapedia.co.th/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=webgis:th_amp";
var legend_tambon = "https://ogc.mapedia.co.th/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=webgis:th_tam";

var legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");
    // div.innerHTML += "<h4>Legend</h4>";
    div.innerHTML += '<img src="' + legend_province + '"><span>Province</span><br>';
    div.innerHTML += '<img src="' + legend_amphoe + '"><span></span><br>';
    div.innerHTML += '<img src="' + legend_tambon + '"><span>Tambon</span><br>';
    return div;
};

legend.addTo(map);
```

### 15 add EChart
```js
function showEchart(dat) {
    let x2555 = dat.features.filter(i => i.id.includes('2555')).map(i => i.properties.rain);
    let x2556 = dat.features.filter(i => i.id.includes('2556')).map(i => i.properties.rain);
    let x2557 = dat.features.filter(i => i.id.includes('2557')).map(i => i.properties.rain);
    let y = dat.features.filter(i => i.id.includes('2555')).map(i => i.properties.TB_TN);
    var chartDom = document.getElementById('chart');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: {
            text: 'World Population'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {},
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01]
        },
        yAxis: {
            type: 'category',
            data: y
        },
        series: [
            {
                name: '2555',
                type: 'bar',
                data: x2555
            },
            {
                name: '2556',
                type: 'bar',
                data: x2556
            },
            {
                name: '2557',
                type: 'bar',
                data: x2557
            }
        ]
    };

    option && myChart.setOption(option);
}

```
