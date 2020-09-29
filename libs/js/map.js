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
let latitude = 0;
let longitude = 0;


function getInitialLocation(){
        if('geolocation' in navigator){
            navigator.geolocation.getCurrentPosition((position) => {
                $.ajax({
                    url: '../../../gazetteer/libs/php/getCountry.php',
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
                            latitude = result['openCage']['results'][0]['geometry']['lat'];
                            longitude = result['openCage']['results'][0]['geometry']['lng'];
                            setView(latitude, longitude);
                            L.marker([latitude, longitude]).addTo(map).bindPopup(mapInfoDisplay()).openPopup();
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

function setView(lat, lang, zoom=6){
    map.setView([lat, lang]);
    map.setZoom(zoom);
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