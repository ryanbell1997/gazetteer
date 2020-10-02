var map = L.map('map').setView([51.505, -0.09], 13);

function main(){
    L.tileLayer('https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=2e011da1ea684120b8c6bf9fa2df5a98', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '2e011da1ea684120b8c6bf9fa2df5a98',
        maxZoom: 22
    },
    ).addTo(map);
    //Overall Information Button
    L.easyButton('<span class="icon">&#8505</span>', () => {DisplayGeneralInfo()}).addTo(map);
    L.easyButton('<span class="icon"><b>$<b></span>', () => {DisplayCurrencyInfo()}).addTo(map);
    L.easyButton('<span class="icon">&#9729</span>', () => {alert('Hello');}).addTo(map);
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
let countryCode = '';

let currencyName = '';
let currencySymbol = ''; 

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
                            currencyName = result['RestCountries']['currencies'][0]['name'];
                            currencySymbol = result['RestCountries']['currencies'][0]['symbol'];
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
                        currencyName = result['RestCountries']['currencies'][0]['name'];
                        currencySymbol = result['RestCountries']['currencies'][0]['symbol'];
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
    return `
    <table id="info">
        <tbody>
            <tr>
                <td id="imageCell" colspan="2"><img class="flagImage" src="https:/www.countryflags.io/${countryCode}/flat/64.png"></td>
            </tr>

            <tr>
                <td class="key">Capital City:</td>
                <td class="value">${capital}</td>
            </tr>

            <tr>
                <td class="key">Continent:</td>
                <td class="value">${region}</td>
            </tr>

            <tr>
                <td class="key">Population:</td>
                <td class="value">${population}</td>
            </tr>

            <tr>
                <td class="key">Area</td>
                <td class="value">${area}km<sup>2</sup></td>
            </tr>
        </tbody>
    </table>
    `
}

function CurrencyInfo() {
    return `
    <table id="info">
        <tbody>
            <tr>
                <td id="imageCell" colspan="2"><img class="flagImage" src="https:/www.countryflags.io/${countryCode}/flat/64.png"></td>
            </tr>

            <tr>
                <td class="key">Currency Name:</td>
                <td class="value">${currencyName}</td>
            <tr>

            <tr>
                <td class="key">Currency Symbol:</td>
                <td class="value">${currencySymbol}</td>
            <tr>

            <tr>
                <td class="key">Currency Code:</td>
                <td class="value">${currency}</td>
            <tr>

            <tr>
                <td class="key">Current Exchange Rate:</td>
                <td class="value">${exchangeRate}</td>
            <tr>
        </tbody>
    </table>

    <canvas id="myChart"></canvas>
    `
}

function mapInfoDisplay(){
    return `
    <table id="mapInfo">
        <tbody>
            <tr>
                <td id="imageCell"><img class="flagImage" src="https:/www.countryflags.io/${countryCode}/flat/64.png"></td>
                <td class="titleCell"><b>${countryName}</b></td>
            </tr>

            <tr>
                <td class="key">Capital City:</td>
                <td class="value">${capital}</td>
            </tr>

            <tr>
                <td class="key">Continent:</td>
                <td class="value">${region}</td>
            </tr>

            <tr>
                <td class="key">Population:</td>
                <td class="value">${population}</td>
            </tr>

            <tr>
                <td class="key">Currency:</td>
                <td class="value">${currencyName}</td>
            </tr>

            <tr>
                <td class="key">Exchange Rate:</td>
                <td class="value">${exchangeRate}</td>
            </tr>
        </tbody>
    </table>
`
}

function DisplayGeneralInfo(){
    $('.modal-title').html(`</b>${countryName}</b>`);
    $('.modal-body').html(GeneralInfo());
    map.closeTooltip();
    $('.modal').show();
}

function DisplayCurrencyInfo(){
    $('.modal-title').html(`</b>${countryName}</b>`);
    $('.modal-body').html(CurrencyInfo());
    map.closeTooltip();
    $('.modal').show()
}

//Event Listeners
$('#countryInput').on('change', () => {
    setCountryInformation();
})

$('.close').on('click', () => {
    $('.modal').hide();
})

$('.btn').on('click', () => {
   $('.modal').hide();
})


$(document).ready(() => {
    main();
});