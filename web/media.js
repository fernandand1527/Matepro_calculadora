const locationButton = document.querySelector("#location-button");
const locationStatus = document.querySelector("#location-status");
const locationMapElement = document.querySelector("#location-map");
const mapLink = document.querySelector("#map-link");

if (locationButton && locationStatus) {
  let locationMap;
  let locationMarker;
  let accuracyCircle;

  locationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      locationStatus.textContent = "Este navegador no ofrece geolocalización.";
      return;
    }

    locationButton.disabled = true;
    locationStatus.textContent = "Solicitando permiso de ubicación…";
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point = [coords.latitude, coords.longitude];
        locationStatus.textContent = `Precisión aproximada: ${Math.round(coords.accuracy)} metros.`;
        if (locationMapElement && window.L) {
          locationMapElement.hidden = false;
          if (!locationMap) {
            locationMap = window.L.map(locationMapElement).setView(point, 16);
            window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              maxZoom: 19,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(locationMap);
            locationMarker = window.L.marker(point).addTo(locationMap);
            accuracyCircle = window.L.circle(point, {
              radius: coords.accuracy,
              color: "#00cdd8",
              fillColor: "#00f5ff",
              fillOpacity: 0.14,
              weight: 2,
            }).addTo(locationMap);
          } else {
            locationMap.setView(point, 16);
            locationMarker.setLatLng(point);
            accuracyCircle.setLatLng(point).setRadius(coords.accuracy);
          }
          window.setTimeout(() => locationMap.invalidateSize(), 0);
        } else {
          locationStatus.textContent = "No se pudo cargar el mapa. Revisa tu conexión e inténtalo de nuevo.";
        }
        if (mapLink) {
          mapLink.href = `https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}#map=16/${coords.latitude}/${coords.longitude}`;
          mapLink.hidden = false;
        }
        locationButton.disabled = false;
      },
      (error) => {
        const messages = {
          1: "No se concedió permiso para consultar la ubicación.",
          2: "No se pudo determinar la ubicación del dispositivo.",
          3: "La solicitud de ubicación agotó el tiempo de espera.",
        };
        locationStatus.textContent = messages[error.code] || "No se pudo consultar la ubicación.";
        locationButton.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  });
}