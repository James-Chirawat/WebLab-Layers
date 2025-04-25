// 1. initial view
const initialCenter = [15.71, 100.06];
const initialZoom = 9;

// 2. map init
const map = L.map('map', {
  zoomControl: false,  // ย้ายปุ่ม zoom ไปไว้ด้านขวา
}).setView(initialCenter, initialZoom);

// เพิ่ม zoom control ที่ด้านขวา
L.control.zoom({
  position: 'topright'
}).addTo(map);

// 3. basemap layers - เพิ่มตัวเลือก basemap หลายแบบและ Google Maps
const basemaps = {
  "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }),
  "Google Streets": L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }),
  "Google Satellite": L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }),
  "Google Hybrid": L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }),
  "Google Terrain": L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }),
  "Esri Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 22
  }),
  "Esri Terrain": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
    maxZoom: 22
  }),
  "OSM Topo": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 22
  })
};

// Feature group 
const fc = L.featureGroup();
const modisFG = L.featureGroup();


// เพิ่ม default basemap
basemaps["Google Streets"].addTo(map);

// 4. WMS layers list
const layersConfig = [
  { name: 'Amphoe',        id: 'nsru:amphoe', group: 'Administrative' },
  { name: 'Flood Bad',     id: 'nsru:floodbad', group: 'Environment' },
  { name: 'Hillshade',     id: 'nsru:hillshade', group: 'Topography' },
  { name: 'Health Centre', id: 'nsru:healthcentre', group: 'Infrastructure' },
  { name: 'Basin50',       id: 'nsru:basin50', group: 'Hydrology' },
  { name: 'Roads',         id: 'nsru:roads', group: 'Infrastructure' },
  { name: 'Buildings',     id: 'nsru:rid3_building', group: 'Infrastructure' },
  { name: 'VIIRS Hotspots (24 hrs)',         id: 'fc',     group: 'Remote Sensing', isFeatureGroup: true  },
  { name: 'MODIS Hotspots (24 hrs)',         id: 'fg_modis24h',     group: 'Remote Sensing', isFeatureGroup: true  }
];

const wmsUrl = 'https://ogc.mapedia.co.th/geoserver/nsru/wms';
const wmsLayers = {};
const layerGroups = {};

// 5. สร้าง WMS layers
layersConfig.forEach(cfg => {
  // *** ถ้าเป็น FeatureGroup ***
  if (cfg.isFeatureGroup) {
    // เก็บ mapping ไว้ให้ control.toggle ใช้ภายหลัง
    // wmsLayers[cfg.id] = fc;
    wmsLayers[cfg.id] = (cfg.id === 'fg_modis24h') ? modisFG : fc;
  } else {
    // *** ปกติ: สร้าง WMS ***
    wmsLayers[cfg.id] = L.tileLayer.wms(wmsUrl, {
      layers: cfg.id,
      format: 'image/png',
      transparent: true,
      attribution: '© NSRU',
      styles: '',
      opacity: 0.8
    });
  }

  // จัดกลุ่มเหมือนเดิม
  if (!layerGroups[cfg.group]) layerGroups[cfg.group] = [];
  layerGroups[cfg.group].push(cfg);
});

// 6. สร้าง sidebar UI แบ่งตามกลุ่ม
const layersControl = document.getElementById('layers-control');

// สร้าง basemap selector ก่อน
const basemapSection = document.createElement('div');
basemapSection.className = 'layer-group';
const basemapHeader = document.createElement('h3');
basemapHeader.textContent = 'แผนที่พื้นหลัง';
basemapSection.appendChild(basemapHeader);

const basemapSelector = document.createElement('select');
basemapSelector.id = 'basemap-selector';
Object.keys(basemaps).forEach(basemapName => {
  const option = document.createElement('option');
  option.value = basemapName;
  option.textContent = basemapName;
  
  // ตั้งค่าเริ่มต้นเป็น Google Streets
  if (basemapName === 'Google Streets') {
    option.selected = true;
  }
  
  basemapSelector.appendChild(option);
});

basemapSelector.addEventListener('change', (e) => {
  // ลบ basemap เก่าทั้งหมด
  Object.values(basemaps).forEach(layer => {
    if (map.hasLayer(layer)) map.removeLayer(layer);
  });
  // เพิ่ม basemap ที่เลือก
  basemaps[e.target.value].addTo(map);
});

basemapSection.appendChild(basemapSelector);
layersControl.appendChild(basemapSection);

// กำหนด separator
const separator = document.createElement('hr');
layersControl.appendChild(separator);

// สร้าง section สำหรับ WMS layers แยกตามกลุ่ม
Object.keys(layerGroups).forEach(groupName => {
  const groupSection = document.createElement('div');
  groupSection.className = 'layer-group';
  
  // หัวข้อกลุ่ม
  const groupHeader = document.createElement('h3');
  groupHeader.textContent = groupName;
  groupHeader.className = 'group-header';
  groupSection.appendChild(groupHeader);
  
  // สร้าง layers ในกลุ่ม
  layerGroups[groupName].forEach(cfg => {
    const wrap = document.createElement('div');
    wrap.className = 'switch';

    // checkbox
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'switch-input';
    cb.id = `toggle-${cfg.id}`;
    cb.value = cfg.id;

    cb.addEventListener('change', e => {
      const layer = wmsLayers[cfg.id];
      if (e.target.checked) layer.addTo(map);
      else map.removeLayer(layer);
    });

    // label
    const lbl = document.createElement('label');
    lbl.htmlFor = `toggle-${cfg.id}`;
    lbl.className = 'switch-label';
    lbl.textContent = cfg.name;

    // เพิ่ม slider ปรับค่าความโปร่งใส
    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = 0;
    opacitySlider.max = 100;
    opacitySlider.value = 80; // เริ่มต้นที่ 80%
    opacitySlider.className = 'opacity-slider';
    opacitySlider.addEventListener('input', e => {
      const opacity = parseInt(e.target.value) / 100;
      wmsLayers[cfg.id].setOpacity(opacity);
    });

    wrap.appendChild(cb);
    wrap.appendChild(lbl);
    wrap.appendChild(opacitySlider);
    groupSection.appendChild(wrap);
  });
  
  layersControl.appendChild(groupSection);
});

// 7. สร้างสัญลักษณ์แสดง scale
L.control.scale({
  position: 'bottomright',
  imperial: false  // แสดงเฉพาะหน่วย metric (เมตร/กิโลเมตร)
}).addTo(map);

// 8. เพิ่ม legend control
const legendControl = L.control({position: 'bottomright'});
legendControl.onAdd = function() {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = '<h4>สัญลักษณ์</h4>';
  div.style.display = 'none'; // ซ่อนไว้ก่อน จะแสดงเมื่อมีการเลือก layer
  
  return div;
};
legendControl.addTo(map);

// 9. เพิ่มฟังก์ชันแสดง legend เมื่อเลือก layer
function updateLegend() {
  const legendDiv = document.querySelector('.legend');
  const activeLayers = [];
  
  // ตรวจสอบ layers ที่เปิดใช้งาน
  layersConfig.forEach(cfg => {
    if (map.hasLayer(wmsLayers[cfg.id])) {
      activeLayers.push(cfg.name);
    }
  });
  
  if (activeLayers.length > 0) {
    let legendHtml = '<h4>สัญลักษณ์</h4>';
    activeLayers.forEach(layerName => {
      // ตัวอย่างการสร้าง legend - สามารถปรับเปลี่ยนได้ตามที่ต้องการ
      legendHtml += `<div class="legend-item">
        <span class="legend-color" style="background-color: ${getRandomColor()}"></span>
        <span class="legend-text">${layerName}</span>
      </div>`;
    });
    legendDiv.innerHTML = legendHtml;
    legendDiv.style.display = 'block';
  } else {
    legendDiv.style.display = 'none';
  }
}

// ฟังก์ชันสุ่มสีสำหรับ legend (แนะนำให้กำหนดสีที่ถูกต้องตาม style จริงของ layer)
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// เพิ่ม event listener สำหรับการเปลี่ยนแปลงของ layer
map.on('layeradd layerremove', updateLegend);

// 10. reset view
document.getElementById('resetView').addEventListener('click', () => {
  map.setView(initialCenter, initialZoom);
});

// 11. เพิ่ม feature info เมื่อคลิกที่ feature
map.on('click', function(e) {
  // กำหนดพารามิเตอร์สำหรับ GetFeatureInfo
  const point = map.latLngToContainerPoint(e.latlng, map.getZoom());
  const size = map.getSize();
  
  // ตรวจสอบ layers ที่เปิดใช้งานอยู่
  const activeLayers = [];
  layersConfig.forEach(cfg => {
    if (map.hasLayer(wmsLayers[cfg.id])) {
      activeLayers.push(cfg.id);
    }
  });
  
  if (activeLayers.length === 0) {
    // แสดง popup พิกัดเมื่อไม่มี layer เปิดใช้งาน
    const { lat, lng } = e.latlng;
    L.popup({ closeOnClick: true })
      .setLatLng(e.latlng)
      .setContent(`<small>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small>`)
      .openOn(map);
    return;
  }
  
  // สร้าง URL สำหรับ GetFeatureInfo
  const wmsParams = {
    service: 'WMS',
    version: '1.1.1',
    request: 'GetFeatureInfo',
    layers: activeLayers.join(','),
    query_layers: activeLayers.join(','),
    info_format: 'application/json',
    xy: `${Math.round(point.x)},${Math.round(point.y)}`,
    width: size.x,
    height: size.y,
    bbox: map.getBounds().toBBoxString(),
    srs: 'EPSG:4326'
  };
  
  // สร้าง URL
  const url = wmsUrl + L.Util.getParamString(wmsParams, wmsUrl, true);
  
  // ใช้ fetch API เพื่อดึงข้อมูล
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        // มีข้อมูล feature
        let popupContent = '<div class="feature-info">';
        data.features.forEach(feature => {
          console.log(popupContent)
          console.log(data)
          popupContent += `<h4>${feature.id.split('.')[0]}</h4>`;
          popupContent += '<table>';
          for (const prop in feature.properties) {
            popupContent += `<tr><td>${prop}</td><td>${feature.properties[prop]}</td></tr>`;
          }
          popupContent += '</table>';
        });
        popupContent += '</div>';
        
        L.popup({ maxWidth: 300 })
          .setLatLng(e.latlng)
          .setContent(popupContent)
          .openOn(map);
      } else {
        // ไม่พบข้อมูล feature - แสดงพิกัด
        const { lat, lng } = e.latlng;
        L.popup({ closeOnClick: true })
          .setLatLng(e.latlng)
          .setContent(`<small>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small>`)
          .openOn(map);
      }
    })
    .catch(error => {
      console.error('Error fetching feature info:', error);
      // console.log(popupContent)
      // console.log(data)
      // แสดงพิกัดเมื่อมีข้อผิดพลาด
      const { lat, lng } = e.latlng;
      L.popup({ closeOnClick: true })
        .setLatLng(e.latlng)
        .setContent(`<small>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small>`)
        .openOn(map);
    });
});

// 12. draw tools
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  position: 'topright',
  draw: {
    polygon: { allowIntersection: false, showArea: true },
    rectangle: true,
    marker: true,  // เปิดใช้งาน marker
    polyline: true,  // เปิดใช้งาน polyline
    circle: true,  // เปิดใช้งาน circle
    circlemarker: false
  },
  edit: { featureGroup: drawnItems, remove: true }
});
map.addControl(drawControl);

// จัดการกับ drawn items
map.on(L.Draw.Event.CREATED, function(e) {
  const layer = e.layer;
  const type = e.layerType;
  
  // เพิ่ม popup เมื่อคลิกที่ feature ที่วาด
  if (type === 'marker') {
    layer.bindPopup('Marker: ' + layer.getLatLng().toString());
  } else if (type === 'polygon' || type === 'rectangle') {
    // คำนวณพื้นที่
    const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
    const areaText = area < 10000 ? 
      `${area.toFixed(2)} ตร.ม.` : 
      `${(area / 1000000).toFixed(4)} ตร.กม.`;
    layer.bindPopup(`พื้นที่: ${areaText}`);
  } else if (type === 'polyline') {
    // คำนวณระยะทาง
    const latlngs = layer.getLatLngs();
    let distance = 0;
    for (let i = 0; i < latlngs.length - 1; i++) {
      distance += latlngs[i].distanceTo(latlngs[i + 1]);
    }
    const distanceText = distance < 1000 ? 
      `${distance.toFixed(2)} เมตร` : 
      `${(distance / 1000).toFixed(3)} กม.`;
    layer.bindPopup(`ระยะทาง: ${distanceText}`);
  } else if (type === 'circle') {
    const radius = layer.getRadius();
    const radiusText = radius < 1000 ? 
      `${radius.toFixed(2)} เมตร` : 
      `${(radius / 1000).toFixed(3)} กม.`;
    layer.bindPopup(`รัศมี: ${radiusText}`);
  }
  
  drawnItems.addLayer(layer);
  
  // เพิ่มข้อมูลลงใน sidebar
  addDrawnItemToSidebar(layer, type);
});

// ฟังก์ชันเพิ่มรายการที่วาดลงใน sidebar (ปรับแล้ว)
function addDrawnItemToSidebar(layer, type) {
    let listContainer = document.getElementById('drawn-items-list');
    if (!listContainer) {
      const drawnSection = document.createElement('div');
      drawnSection.className = 'layer-group';
      drawnSection.innerHTML = '<h3>รายการที่วาด</h3>';
      
      listContainer = document.createElement('div');
      listContainer.id = 'drawn-items-list';
      drawnSection.appendChild(listContainer);
      
      layersControl.appendChild(drawnSection);
    }
    
    const itemElement = document.createElement('div');
    itemElement.className = 'drawn-item';
    
    // กำหนดข้อความตามประเภท
    let itemText = '';
    switch(type) {
      case 'marker':    itemText = 'หมุด'; break;
      case 'polygon':   itemText = 'พื้นที่'; break;
      case 'rectangle': itemText = 'สี่เหลี่ยม'; break;
      case 'polyline':  itemText = 'เส้น'; break;
      case 'circle':    itemText = 'วงกลม'; break;
      default:          itemText = 'รูปร่าง';
    }
    
    // สร้างข้อความพิกัด (Lat,Lng) แยกตามประเภท layer
    let coordText;
    if (type === 'marker' || type === 'circle') {
      const latlng = layer.getLatLng();
      coordText = `Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`;
    } else {
      // กรณี polygon, rectangle, polyline ใช้จุดกึ่งกลางของ bounds
      const center = layer.getBounds().getCenter();
      coordText = `Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)}`;
    }
    
    itemElement.innerHTML = `
      <span class="item-type">${itemText}</span>
      <span class="item-coord">${coordText}</span>
      <button class="zoom-to-item">ซูม</button>
    `;
    
    // ปุ่มซูม
    itemElement.querySelector('.zoom-to-item').addEventListener('click', () => {
      if (type === 'marker' || type === 'circle') {
        map.setView(layer.getLatLng(), 15);
      } else {
        map.fitBounds(layer.getBounds());
      }
    });
    
    listContainer.appendChild(itemElement);
  }


// 13. เพิ่มเครื่องมือวัดระยะทางและพื้นที่
const measureToolsDiv = document.createElement('div');
measureToolsDiv.className = 'measure-tools';
measureToolsDiv.innerHTML = `
  <h3>เครื่องมือวัด</h3>
  <button id="measure-distance" class="measure-button">วัดระยะทาง</button>
  <button id="measure-area" class="measure-button">วัดพื้นที่</button>
  <button id="clear-measure" class="measure-button">ล้าง</button>
`;

// เพิ่มเครื่องมือวัดใน sidebar
document.getElementById('sidebar').appendChild(measureToolsDiv);

// ตัวแปรสำหรับเก็บ feature การวัด
let measureControl = {
  line: null,
  polygon: null,
  activeMode: null,
  markerGroup: L.layerGroup().addTo(map),
  resultLayer: L.layerGroup().addTo(map)
};

// ฟังก์ชันยกเลิกเครื่องมือวัด
function deactivateMeasureTool() {
  if (measureControl.activeMode) {
    document.getElementById('measure-distance').classList.remove('active');
    document.getElementById('measure-area').classList.remove('active');
    
    map.off('click', addMeasurePoint);
    
    // ลบ attribution ที่เพิ่มไว้
    const attributions = document.querySelectorAll('.leaflet-control-attribution');
    attributions.forEach(attr => {
      if (attr.textContent.includes('คลิกเพื่อเพิ่มจุด')) {
        map.removeControl(attr);
      }
    });
    
    measureControl.activeMode = null;
  }
}

// เพิ่ม event listener สำหรับปุ่มวัดระยะทาง
document.getElementById('measure-distance').addEventListener('click', function() {
  // ยกเลิกโหมดที่ใช้งานอยู่ก่อน
  deactivateMeasureTool();
  
  // เริ่มโหมดวัดระยะทาง
  measureControl.activeMode = 'distance';
  this.classList.add('active');
  
  // สร้าง polyline
  measureControl.line = L.polyline([], {
    color: '#FF4500',
    weight: 3
  }).addTo(measureControl.resultLayer);
  
  // แสดงคำแนะนำ
  const measureInstruction = L.control.attribution({
    position: 'bottomleft',
    prefix: 'คลิกเพื่อเพิ่มจุด กด ESC เพื่อยกเลิก'
  }).addTo(map);
  
  // เพิ่ม click handler
  map.on('click', addMeasurePoint);
});

// เพิ่ม event listener สำหรับปุ่มวัดพื้นที่
document.getElementById('measure-area').addEventListener('click', function() {
  // ยกเลิกโหมดที่ใช้งานอยู่ก่อน
  deactivateMeasureTool();
  
  // เริ่มโหมดวัดพื้นที่
  measureControl.activeMode = 'area';
  this.classList.add('active');
  
  // สร้าง polygon
  measureControl.polygon = L.polygon([], {
    color: '#3388ff',
    weight: 3,
    fillOpacity: 0.2
  }).addTo(measureControl.resultLayer);
  
  // แสดงคำแนะนำ
  const measureInstruction = L.control.attribution({
    position: 'bottomleft',
    prefix: 'คลิกเพื่อเพิ่มจุดวัดพื้นที่ กด ESC เพื่อยกเลิก'
  }).addTo(map);
  
  // เพิ่ม click handler
  map.on('click', addMeasurePoint);
});
// ปรับปรุงฟังก์ชัน addMeasurePoint สำหรับโหมดวัดพื้นที่
function addMeasurePoint(e) {
  const latlng = e.latlng;
  
  if (measureControl.activeMode === 'distance') {
    // เพิ่มจุดใน polyline
    const points = measureControl.line.getLatLngs();
    points.push(latlng);
    measureControl.line.setLatLngs(points);
    
    // สร้าง marker ที่จุด
    const marker = L.circleMarker(latlng, {
      radius: 4,
      color: '#FF4500',
      fillColor: '#FFF',
      fillOpacity: 1
    }).addTo(measureControl.markerGroup);
    
    // คำนวณระยะทางรวม
    if (points.length > 1) {
      let totalDistance = 0;
      for (let i = 0; i < points.length - 1; i++) {
        totalDistance += points[i].distanceTo(points[i + 1]);
      }
      
      // แสดงระยะทางรวม
      const distanceText = totalDistance < 1000 ? 
        `${totalDistance.toFixed(2)} เมตร` : 
        `${(totalDistance / 1000).toFixed(3)} กิโลเมตร`;
      
      // สร้าง popup แสดงระยะทาง
      measureControl.line.bindPopup(`ระยะทางรวม: ${distanceText}`).openPopup();
    }
  } else if (measureControl.activeMode === 'area') {
    // เพิ่มจุดใน polygon
    const points = measureControl.polygon.getLatLngs()[0] || [];
    points.push(latlng);
    measureControl.polygon.setLatLngs([points]);
    
    // สร้าง marker ที่จุด
    const marker = L.circleMarker(latlng, {
      radius: 4,
      color: '#3388ff',
      fillColor: '#FFF',
      fillOpacity: 1
    }).addTo(measureControl.markerGroup);
    
    // คำนวณพื้นที่
    if (points.length > 2) {
      const area = L.GeometryUtil.geodesicArea(points);
      
      // แสดงพื้นที่
      const areaText = area < 10000 ? 
        `${area.toFixed(2)} ตร.ม.` : 
        `${(area / 1000000).toFixed(4)} ตร.กม.`;
      
      // สร้าง popup แสดงพื้นที่
      measureControl.polygon.bindPopup(`พื้นที่: ${areaText}`).openPopup();
      
      // สร้าง bounds จาก polygon
      const bounds = L.latLngBounds(points);
      
      // ดึงข้อมูล WMS Features ที่อยู่ภายในพื้นที่
      getWMSFeaturesInPolygon(points).then(featuresInfo => {
        // เพิ่มการวัดลงในไซด์บาร์พร้อมข้อมูล WMS
        addMeasurementToSidebar({
          id: measurementCounter++,
          type: 'area',
          value: areaText,
          points: points,
          bounds: bounds,
          layer: measureControl.polygon,
          wmsInfo: featuresInfo
        });
      }).catch(error => {
        console.error('Error fetching WMS info:', error);
        // เพิ่มการวัดลงในไซด์บาร์โดยไม่มีข้อมูล WMS
        addMeasurementToSidebar({
          id: measurementCounter++,
          type: 'area',
          value: areaText,
          points: points,
          bounds: bounds,
          layer: measureControl.polygon,
          wmsInfo: null
        });
      });

    }
  }
}

// ฟังก์ชันใหม่สำหรับการดึงข้อมูล WMS ที่อยู่ภายในพื้นที่ polygon
function getWMSFeaturesInPolygon(points) {
  return new Promise((resolve, reject) => {
    // ตรวจสอบ layers ที่เปิดใช้งานอยู่
    const activeLayers = [];
    layersConfig.forEach(cfg => {
      if (map.hasLayer(wmsLayers[cfg.id])) {
        activeLayers.push(cfg.id);
      }
    });
    
    if (activeLayers.length === 0) {
      // ไม่มี layers ที่เปิดใช้งาน
      resolve(null);
      return;
    }
    
    // สร้าง GeoJSON ของ polygon
    const polygonGeoJSON = {
      type: "Polygon",
      coordinates: [[]]
    };
    
    // แปลงจุดเป็นรูปแบบ [lng, lat] สำหรับ GeoJSON
    points.forEach(point => {
      polygonGeoJSON.coordinates[0].push([point.lng, point.lat]);
    });
    
    // ปิด polygon ด้วยจุดแรก
    if (points.length > 0) {
      polygonGeoJSON.coordinates[0].push([points[0].lng, points[0].lat]);
    }
    
    // แปลง GeoJSON เป็น WKT (Well-Known Text)
    const wktPolygon = `POLYGON((${polygonGeoJSON.coordinates[0].map(c => `${c[0]} ${c[1]}`).join(', ')}))`;
    
    // สร้างคำขอ GetFeature สำหรับแต่ละ layer ที่เปิดใช้งาน
    const promises = activeLayers.map(layerId => {
      // สร้าง URL สำหรับ WFS GetFeature
      const wfsParams = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: layerId,
        outputFormat: 'application/json',
        CQL_FILTER: `INTERSECTS(geom, ${wktPolygon})`
      };
      
      const url = wmsUrl.replace('/wms', '/wfs') + L.Util.getParamString(wfsParams, wmsUrl.replace('/wms', '/wfs'), true);
      
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          return {
            layerId: layerId,
            layerName: layersConfig.find(cfg => cfg.id === layerId)?.name || layerId,
            features: data.features || []
          };
        })
        .catch(error => {
          console.warn(`Error fetching WFS data for layer ${layerId}:`, error);
          return {
            layerId: layerId,
            layerName: layersConfig.find(cfg => cfg.id === layerId)?.name || layerId,
            features: [],
            error: error.message
          };
        });
    });
    
    // รวมผลลัพธ์จากทุก layer
    Promise.all(promises)
      .then(results => {
        // กรองเฉพาะ layers ที่มีข้อมูล
        const filteredResults = results.filter(result => result.features.length > 0);
        resolve(filteredResults);
      })
      .catch(error => {
        reject(error);
      });
  });
}

// สร้าง container สำหรับแสดงผลการวัดในไซด์บาร์
const measureResultsDiv = document.createElement('div');
measureResultsDiv.className = 'measure-results';
measureResultsDiv.innerHTML = `
  <h3>ผลการวัดพื้นที่</h3>
  <div id="measure-results-container"></div>
`;

// เพิ่ม container ผลการวัดลงในไซด์บาร์หลังจากเครื่องมือวัด
document.getElementById('sidebar').appendChild(measureResultsDiv);

// ตัวแปรนับการวัด
let measurementCounter = 1;

// ฟังก์ชันเพิ่มการวัดลงในไซด์บาร์
function addMeasurementToSidebar(measurement) {
  const container = document.getElementById('measure-results-container');
  
  // สร้างองค์ประกอบสำหรับการวัดนี้
  const measureItem = document.createElement('div');
  measureItem.className = 'measure-result-item';
  measureItem.id = `measure-item-${measurement.id}`;
  
  // คำนวณจุดกึ่งกลางของพื้นที่
  const center = measurement.bounds.getCenter();
  
  // สร้าง HTML สำหรับข้อมูล WMS
  let wmsInfoHTML = '';
  let totalFeatures = 0;
  
  if (measurement.wmsInfo && measurement.wmsInfo.length > 0) {
    wmsInfoHTML = '<div class="wms-features">';
    wmsInfoHTML += '<h5>ข้อมูลในพื้นที่:</h5>';
    
    measurement.wmsInfo.forEach(layerInfo => {
      if (layerInfo.features.length > 0) {
        totalFeatures += layerInfo.features.length;
        wmsInfoHTML += `<div class="layer-info">
          <div class="layer-header">
            <span class="layer-name">${layerInfo.layerName}</span>
            <span class="feature-count">${layerInfo.features.length} รายการ</span>
          </div>
          <div class="feature-list">`;
        
       // แสดงตัวอย่างข้อมูล (จำกัดจำนวน)
const maxFeaturesToShow = Math.min(layerInfo.features.length);
for (let i = 0; i < maxFeaturesToShow; i++) {
  const feature = layerInfo.features[i];
  const name = feature.properties.name || feature.properties.NAME || '– ไม่พบชื่อ –';
  wmsInfoHTML += `
    <div class="feature-item">
      <div class="property"><span class="key">ชื่อ:</span> ${name}</div>
    </div>
  `;
}

        
        // แสดงว่ามีข้อมูลเพิ่มเติม
        if (layerInfo.features.length > maxFeaturesToShow) {
          wmsInfoHTML += `<div class="more-features">และอีก ${layerInfo.features.length - maxFeaturesToShow} รายการ</div>`;
        }
        
        wmsInfoHTML += `</div>
        </div>`;
      }
    });
    
    // ถ้าไม่พบข้อมูลใด ๆ
    if (totalFeatures === 0) {
      wmsInfoHTML += '<div class="no-features">ไม่พบข้อมูลในพื้นที่นี้</div>';

    }
    
    wmsInfoHTML += '</div>';
  }
  
  // สร้างเนื้อหาสำหรับรายการการวัด
  measureItem.innerHTML = `
    <div class="measure-header">
      <span class="measure-type">พื้นที่ #${measurement.id}</span>
      <span class="measure-value">${measurement.value}</span>
      <div class="measure-actions">
        <button class="zoom-to-measure" title="ซูมไปยังพื้นที่นี้">🔍</button>
        <button class="remove-measure" title="ลบรายการนี้">✖</button>
      </div>
    </div>
    <div class="measure-details">
      <div class="measure-location">
        พิกัดกลาง: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}
      </div>
      <div class="feature-summary">
        พบข้อมูลทั้งหมด: <strong>${totalFeatures}</strong> รายการ
      </div>
      ${wmsInfoHTML}
    </div>
  `;
  
  // เพิ่มลงใน container
  container.appendChild(measureItem);
  
  // เพิ่ม event listeners สำหรับปุ่ม
  measureItem.querySelector('.zoom-to-measure').addEventListener('click', () => {
    map.fitBounds(measurement.bounds);
  });
  
  measureItem.querySelector('.remove-measure').addEventListener('click', () => {
    // ลบออกจากไซด์บาร์
    measureItem.remove();
    
    // ถ้า layer ยังอยู่บนแผนที่ ให้ลบออก
    if (map.hasLayer(measurement.layer)) {
      map.removeLayer(measurement.layer);
    }
  });
}

// ฟังก์ชันใหม่สำหรับการดึงข้อมูล WMS ที่อยู่ภายในพื้นที่ polygon
function getWMSFeaturesInPolygon(points) {
  return new Promise((resolve, reject) => {
    // ตรวจสอบ layers ที่เปิดใช้งานอยู่
    const activeLayers = [];
    layersConfig.forEach(cfg => {
      if (map.hasLayer(wmsLayers[cfg.id])) {
        activeLayers.push(cfg.id);
      }
    });
    
    if (activeLayers.length === 0) {
      // ไม่มี layers ที่เปิดใช้งาน
      resolve(null);
      return;
    }
    
    // สร้าง GeoJSON ของ polygon
    const polygonGeoJSON = {
      type: "Polygon",
      coordinates: [[]]
    };
    
    // แปลงจุดเป็นรูปแบบ [lng, lat] สำหรับ GeoJSON
    points.forEach(point => {
      polygonGeoJSON.coordinates[0].push([point.lng, point.lat]);
    });
    
    // ปิด polygon ด้วยจุดแรก
    if (points.length > 0) {
      polygonGeoJSON.coordinates[0].push([points[0].lng, points[0].lat]);
    }
    
    // แปลง GeoJSON เป็น WKT (Well-Known Text)
    const wktPolygon = `POLYGON((${polygonGeoJSON.coordinates[0].map(c => `${c[0]} ${c[1]}`).join(', ')}))`;
    
    // สร้างคำขอ GetFeature สำหรับแต่ละ layer ที่เปิดใช้งาน
    const promises = activeLayers.map(layerId => {
      // สร้าง URL สำหรับ WFS GetFeature
      const wfsParams = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: layerId,
        outputFormat: 'application/json',
        CQL_FILTER: `INTERSECTS(geom, ${wktPolygon})`
      };
      
      const url = wmsUrl.replace('/wms', '/wfs') + L.Util.getParamString(wfsParams, wmsUrl.replace('/wms', '/wfs'), true);
      
      return fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          return {
            layerId: layerId,
            layerName: layersConfig.find(cfg => cfg.id === layerId)?.name || layerId,
            features: data.features || []
          };
        })
        .catch(error => {
          console.warn(`Error fetching WFS data for layer ${layerId}:`, error);
          return {
            layerId: layerId,
            layerName: layersConfig.find(cfg => cfg.id === layerId)?.name || layerId,
            features: [],
            error: error.message
          };
        });
    });
    
    // รวมผลลัพธ์จากทุก layer
    Promise.all(promises)
      .then(results => {
        // กรองเฉพาะ layers ที่มีข้อมูล
        const filteredResults = results.filter(result => result.features.length > 0);
        resolve(filteredResults);
      })
      .catch(error => {
        reject(error);
      });
  });
}

// สร้าง container สำหรับแสดงผลการวัดในไซด์บาร์
const measureResultsDiv = document.createElement('div');
measureResultsDiv.className = 'measure-results';
measureResultsDiv.innerHTML = `
  <h3>ผลการวัดพื้นที่</h3>
  <div id="measure-results-container"></div>
`;

// เพิ่ม container ผลการวัดลงในไซด์บาร์หลังจากเครื่องมือวัด
document.getElementById('sidebar').appendChild(measureResultsDiv);

// ตัวแปรนับการวัด
let measurementCounter = 1;

// ฟังก์ชันเพิ่มการวัดลงในไซด์บาร์
function addMeasurementToSidebar(measurement) {
  const container = document.getElementById('measure-results-container');
  
  // สร้างองค์ประกอบสำหรับการวัดนี้
  const measureItem = document.createElement('div');
  measureItem.className = 'measure-result-item';
  measureItem.id = `measure-item-${measurement.id}`;
  
  // คำนวณจุดกึ่งกลางของพื้นที่
  const center = measurement.bounds.getCenter();
  
  // สร้าง HTML สำหรับข้อมูล WMS
  let wmsInfoHTML = '';
  let totalFeatures = 0;
  
  if (measurement.wmsInfo && measurement.wmsInfo.length > 0) {
    wmsInfoHTML = '<div class="wms-features">';
    wmsInfoHTML += '<h5>ข้อมูลในพื้นที่:</h5>';
    
    measurement.wmsInfo.forEach(layerInfo => {
      if (layerInfo.features.length > 0) {
        totalFeatures += layerInfo.features.length;
        wmsInfoHTML += `<div class="layer-info">
          <div class="layer-header">
            <span class="layer-name">${layerInfo.layerName}</span>
            <span class="feature-count">${layerInfo.features.length} รายการ</span>
          </div>
          <div class="feature-list">`;
        
       // แสดงตัวอย่างข้อมูล (จำกัดจำนวน)
      const maxFeaturesToShow = Math.min(3, layerInfo.features.length);
      for (let i = 0; i < maxFeaturesToShow; i++) {
        const feature = layerInfo.features[i];
        const name = feature.properties.name || feature.properties.NAME || '– ไม่พบชื่อ –';
        wmsInfoHTML += `
          <div class="feature-item">
            <div class="property"><span class="key">ชื่อ:</span> ${name}</div>
          </div>
        `;
      }

        
        // แสดงว่ามีข้อมูลเพิ่มเติม
        if (layerInfo.features.length > maxFeaturesToShow) {
          wmsInfoHTML += `<div class="more-features">และอีก ${layerInfo.features.length - maxFeaturesToShow} รายการ</div>`;
        }
        
        wmsInfoHTML += `</div>
        </div>`;
      }
    });
    
    // ถ้าไม่พบข้อมูลใด ๆ
    if (totalFeatures === 0) {
      wmsInfoHTML += '<div class="no-features">ไม่พบข้อมูลในพื้นที่นี้</div>';
    }
    
    wmsInfoHTML += '</div>';
  }
  
  // สร้างเนื้อหาสำหรับรายการการวัด
  measureItem.innerHTML = `
    <div class="measure-header">
      <span class="measure-type">พื้นที่ #${measurement.id}</span>
      <span class="measure-value">${measurement.value}</span>
      <div class="measure-actions">
        <button class="zoom-to-measure" title="ซูมไปยังพื้นที่นี้">🔍</button>
        <button class="remove-measure" title="ลบรายการนี้">✖</button>
      </div>
    </div>
    <div class="measure-details">
      <div class="measure-location">
        พิกัดกลาง: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}
      </div>
      <div class="feature-summary">
        พบข้อมูลทั้งหมด: <strong>${totalFeatures}</strong> รายการ
      </div>
      ${wmsInfoHTML}
    </div>
  `;
  
  // เพิ่มลงใน container
  container.appendChild(measureItem);
  
  // เพิ่ม event listeners สำหรับปุ่ม
  measureItem.querySelector('.zoom-to-measure').addEventListener('click', () => {
    map.fitBounds(measurement.bounds);
  });
  
  measureItem.querySelector('.remove-measure').addEventListener('click', () => {
    // ลบออกจากไซด์บาร์
    measureItem.remove();
    
    // ถ้า layer ยังอยู่บนแผนที่ ให้ลบออก
    if (map.hasLayer(measurement.layer)) {
      map.removeLayer(measurement.layer);
    }
  });
}

// แก้ไขปุ่ม clear-measure ให้ล้างผลการวัดในไซด์บาร์ด้วย
document.getElementById('clear-measure').addEventListener('click', function() {
  // ยกเลิกโหมดที่ใช้งานอยู่
  deactivateMeasureTool();
  
  // ล้าง layers การวัด
  measureControl.resultLayer.clearLayers();
  measureControl.markerGroup.clearLayers();
  
  // รีเซ็ต polyline และ polygon
  measureControl.line = null;
  measureControl.polygon = null;
  
  // ล้างผลการวัดในไซด์บาร์
  document.getElementById('measure-results-container').innerHTML = '';
});

// จุดความร้อน
let hpData = axios.get("https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/SouthEast_Asia/c56f7d70bc06160e3c443a592fd9c87e/?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0&TYPENAME=ms:fires_snpp_24hrs&STARTINDEX=0&COUNT=10000&SRSNAME=urn:ogc:def:crs:EPSG::4326&BBOX=-90,-180,90,180,urn:ogc:def:crs:EPSG::4326&outputformat=geojson");
let onEachFeatureHotspot = (feature, layer) => {
    if (feature.properties) {
        layer.bindPopup(
            `<span class="kanit"><b>ตำแหน่งจุดความร้อน</b>
            <br/>ข้อมูลจาก <b>VIIRS</b>
            <br/>ตำแหน่งที่พบ : ${feature.properties.latitude}, ${feature.properties.longitude} 
            <br/>ค่า Brightness temperature: ${feature.properties.brightness} Kelvin
            <br/>วันที่: ${feature.properties.acq_datetime} UTC`
        );
    }
}

let loadHotspot = async () => {
    let hp = await hpData;
    const fs = hp.data.features;
    var geojsonMarkerOptions = {
        radius: 5,
        fillColor: "#ff5100",
        color: "#a60b00",
        weight: 0,
        opacity: 1,
        fillOpacity: 0.8
    };

    await L.geoJSON(fs, {
        filter: function (feature) {
            if (feature.geometry.coordinates[0] > 96.295861 && feature.geometry.coordinates[0] < 106.113154) {
                if (feature.geometry.coordinates[1] > 5.157973 && feature.geometry.coordinates[1] < 20.221918) {
                    // myModal.hide();
                    return feature
                }
            }
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        name: "lyr",
        onEachFeature: onEachFeatureHotspot
    }).addTo(fc)
}


const modisURL = 'https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/'
               + 'SouthEast_Asia/c56f7d70bc06160e3c443a592fd9c87e/'
               + '?SERVICE=WFS&REQUEST=GetFeature&VERSION=2.0.0'
               + '&TYPENAME=ms:fires_modis_24hrs&STARTINDEX=0&COUNT=10000'
               + '&SRSNAME=urn:ogc:def:crs:EPSG::4326'
               + '&BBOX=-90,-180,90,180,urn:ogc:def:crs:EPSG::4326'
               + '&outputformat=geojson';

const loadModis = async () => {
  const { data } = await axios.get(modisURL);
  const features = data.features;

  const style = {
    radius: 5,
    fillColor: '#ffcf33',   // สีเหลืองส้มต่างจาก VIIRS
    color: '#995700',
    weight: 0,
    opacity: 1,
    fillOpacity: 0.8
  };

  L.geoJSON(features, {
    filter: f => {
      const [lon, lat] = f.geometry.coordinates;
      return lon > 96.296 && lon < 106.113 && lat > 5.158 && lat < 20.222;
    },
    pointToLayer: (f, latlng) => L.circleMarker(latlng, style),
    onEachFeature: (f, layer) => {
      layer.bindPopup(`
        <span class="kanit"><b>ตำแหน่งจุดความร้อน</b>
        <br/>ข้อมูลจาก <b>MODIS</b>
        <br/>Lat/Lon : ${f.properties.latitude}, ${f.properties.longitude}
        <br/>Brightness&nbsp;temp&nbsp;: ${f.properties.brightness} K
        <br/>วันที่: ${f.properties.acq_datetime}&nbsp;UTC`);
    }
  }).addTo(modisFG);

  /* เปิดเลเยอร์ทันที (ตามต้องการ) */
  // modisFG.addTo(map);
};


  document.addEventListener('DOMContentLoaded', () => {
    loadHotspot(); // VIIRS
    loadModis();   // MODIS
  });

