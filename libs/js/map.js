var map = L.map('map').setView([51.505, -0.09], 13);

function main(){
    L.tileLayer('https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=2e011da1ea684120b8c6bf9fa2df5a98', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '2e011da1ea684120b8c6bf9fa2df5a98',
        maxZoom: 22
    },
    ).addTo(map);
    //Overall Information Button
    L.easyButton('<span>&#8505</span>', () => {displayGeneralInfo()}).addTo(map);
    L.easyButton('<span>&starf;</span>', () => {alert('Hello');}).addTo(map);
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
let area = 0;
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
                        lng: position.coords.longitude,
                        currency: '',
                    },
                    success: (result) => {

                        console.log(result);

                        if(result.status.name == "ok"){
                            countryName = result['CountryInfo']['geonames'][0]['countryName'];
                            population = result['CountryInfo']['geonames'][0]['population'];
                            region = result['CountryInfo']['geonames'][0]['continentName'];
                            capital = result['CountryInfo']['geonames'][0]['capital'];
                            currency = result['CountryInfo']['geonames'][0]['currencyCode'];
                            if(result['CurrencyInfo']['error']) {
                                exchangeRate = "N/A"
                            } else {
                                exchangeRate = result['CurrencyInfo']['result'];
                            }
                            countryCode = result['CountryCode']['countryCode'];
                            area = result['CountryInfo']['geonames'][0]['areaInSqKm']
                            countryGeoJson =  result['geoJson'];
                            setLJSON("userCurrency", currency);
                            createGeoJson(countryGeoJson);
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

function setCountryInformation(){
            $.ajax({
                url: 'libs/php/getCountry.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    countryCode: $('#countryInput').find(':selected').val(),
                    currency: getLJSON("userCurrency")
                },
                success: (result) => {

                    console.log(result);

                    if(result.status.name == "ok"){
                        countryName = result['CountryInfo']['geonames'][0]['countryName'];
                        population = result['CountryInfo']['geonames'][0]['population'];
                        region = result['CountryInfo']['geonames'][0]['continentName'];
                        capital = result['CountryInfo']['geonames'][0]['capital'];
                        currency = result['CountryInfo']['geonames'][0]['currencyCode'];
                        if(result['CurrencyInfo']['error']) {
                            exchangeRate = "N/A"
                        } else {
                            exchangeRate = result['CurrencyInfo']['result'];
                        }
                        countryCode = $('#countryInput').find(':selected').val();
                        area = result['CountryInfo']['geonames'][0]['areaInSqKm'];
                        countryGeoJson =  result['geoJson'];
                        createGeoJson(countryGeoJson);
                        geoJsonLayer.bindTooltip(mapInfoDisplay()).toggleTooltip();

                    }
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.warn(jqXHR.responseText)
                    console.log(errorThrown);
                }
            });
        };

function setLJSON(storageName,item) {
    localStorage.setItem(storageName, JSON.stringify(item));
}

function getLJSON(item) {
    return JSON.parse(localStorage.getItem(item));
}

function createGeoJson(geoJson) {
    if(geoJsonLayer){
        map.removeLayer(geoJsonLayer);
    }
    geoJsonLayer = L.geoJson(geoJson, {
        style: geoJsonStyle
    }).addTo(map);
    map.fitBounds(geoJsonLayer.getBounds());
}

function GeneralInfo() {
    return `<table>
    <tbody>
        <tr>
            <td>Capital City:</td>
            <td>${capital}</td>
        </tr>

        <tr>
            <td>Continent:</td>
            <td>${region}</td>
        </tr>

        <tr>
            <td>Population:</td>
            <td>${population}</td>
        </tr>

        <tr>
            <td>Area</td>
            <td>${area}km<sup>2</sup></td>
        </tr>
    </tbody>
    </table>
    `
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

//Event Listeners
$('#countryInput').on('change', () => {
    setCountryInformation();
})

function displayGeneralInfo(){
    $('.modal-title').html(`</b>${countryName}</b>`);
    $('.modal-body').html(GeneralInfo());
    $('.modal').toggle();
}

$('.close').on('click', () => {
    $('.modal').toggle();
})

$('.btn').on('click', () => {
   $('.modal').toggle();
})


$(document).ready(() => {
    main();
});