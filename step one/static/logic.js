var groundnPoundUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform request to the query URL
d3.json(groundnPoundUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function we want to run once for each feature the array
  // description 
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      "<h3>" +
        feature.properties.place +
        "</h3><hr><p>" +
        new Date(feature.properties.time) +
        "</p><h4><hr><p>" +
        "Magnitude: " + (feature.properties.mag) +
        " |          Depth: " + (feature.geometry.coordinates[2]) +
        "</p></h4>"
        );
  }

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 6;
  }

  function getColor(depth) {
    switch (true) {
      case depth > 40:
        return "#704214";
      case depth > 30:
        return "#382C1E";
      case depth > 20:
        return "#45CEA2";
      case depth > 10:
        return "#009A63";
      case depth > 1:
        return "#76FF7A";
      default:
        return "#2E8B57";
    }
  }

  function circleStyle(feature) {
    return {
      radius: getRadius(feature.properties.mag),
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#808080",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    };
  }

  // Create a GeoJSON layer containing the features for earthquakeData object
  // Run the onEachFeature function once for each piece of data

  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: circleStyle,
    onEachFeature: onEachFeature,
  });

  // Sending to the createMap
  createMap(earthquakes);
}

function createMap(earthquakes) {
  var lightmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY,
    }
  );

  // Create map, giving it the streatmap and layers 
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [lightmap, earthquakes],
  });

  //-----------------LEGEND---------------//

  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [1, 10, 20, 30, 40];
    var colors = [
      "#704214",
      "#382C1E",
      "#45CEA2",
      "#009A63",
      "#76FF7A",
      "#2E8B57"
    ];

    // loop through our magnitude and generate a label 
    var legendInfo = "<h3>Depth of Earthquakes</h3>"
    div.innerHTML = legendInfo;

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        "<i style='background: " +
        colors[i] +
        "'></i> " +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<p>" : "+");
    }

    return div;
  };


  legend.addTo(myMap);

}