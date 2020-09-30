var map = L.map('map').setView([51.505, -0.09], 13);

function main(){
    L.tileLayer('https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=2e011da1ea684120b8c6bf9fa2df5a98', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '2e011da1ea684120b8c6bf9fa2df5a98',
        maxZoom: 22
    },
    ).addTo(map);
    //Overall Information Button
    L.easyButton('<span>&starf;</span>', () => {alert('Hello');}).addTo(map);
    getInitialLocation();
}

//Country Information
let countryName = '';
let population = 0;
let region = '';
let capital = '';
let landMass = 0;
let exchangeRate = 0;
let countryGeoJson = [];

var geoJsonStyle = {
    "color": "#85e384",
    "opacity": 0.8,
    "weight": 2,
}

var geoJsonLayer = [];

function getInitialLocation(){
        if('geolocation' in navigator){
            navigator.geolocation.getCurrentPosition((position) => {
                $.ajax({
                    url: 'libs/php/getCountry.php',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    },
                    success: (result) => {

                        console.log(result);

                        if(result.status.name == "ok"){
                            countryName = result['CountryInfo']['geonames'][0]['countryName'];
                            population = result['CountryInfo']['geonames'][0]['population'];
                            region = result['CountryInfo']['geonames'][0]['continentName'];
                            capital = result['CountryInfo']['geonames'][0]['capital'];
                            currency = result['CountryInfo']['geonames'][0]['currencyCode'];
                            exchangeRate = result['CurrencyInfo']['rates'][currency];
                            countryCode = result['CountryCode']['countryCode'];
                            countryGeoJson =  result['geoJson'];
                            createGeoJson(countryGeoJson);
                            setView(countryGeoJson);
                            geoJsonLayer.bindTooltip(mapInfoDisplay()).toggleTooltip();

                        }
                    },
                    error: (jqXHR, textStatus, errorThrown) => {
                        console.warn(jqXHR.responseText)
                        console.log(errorThrown);
                    }
                });
            });
        };
};

function setLJSON(storageName,item) {
    localStorage.setItem(storageName, JSON.stringify(item));
}

function getLJSON(item) {
    return JSON.parse(localStorage.getItem(item));
}

function setView(){
    map.fitBounds(geoJsonLayer.getBounds());
}

function createGeoJson(geoJson) {
    geoJsonLayer = L.geoJson(geoJson, {
        style: geoJsonStyle
    }).addTo(map);
}



function mapInfoDisplay(){
    return `<b>${countryName}</b><br>
    Capital City: ${capital}<br>
    Continent: ${region}<br>
    Population: ${population}<br>
    Currency: ${currency}<br>
    Exchange Rate: ${exchangeRate}<br>
    <a href="#">See more info</a>`
}

$('#countrySearch').on('submit', () => {
    displayCountryInformation();
})

$('#countryInput').on('submit', () => {
    displayCountryInformation();
})

$(document).ready(() => {
    main();
    
});