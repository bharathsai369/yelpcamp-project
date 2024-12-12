maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.BRIGHT,
    // style: maptilersdk.MapStyle.SATELLITE,
    // style: maptilersdk.MapStyle.OUTDOOR,
    // style: maptilersdk.MapStyle.DARK,
    // style: maptilersdk.MapStyle.STREETS,
    // style: maptilersdk.MapStyle.WINTER,
    // style: maptilersdk.MapStyle.HYBRID,
    // style: maptilersdk.MapStyle.BASIC,
    // style: maptilersdk.MapStyle.LIGHT,
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

new maptilersdk.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)