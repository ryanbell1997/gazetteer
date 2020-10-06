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
    L.easyButton('<span class="icon">&#9729</span>', () => {DisplayWeatherInfo()}).addTo(map);
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
let countryFlagLink = '';
let languages = [];

//Currency Vars
let currencyName = '';
let currencySymbol = ''; 

//Weather Vars
let currentWeatherIcon = '';
let currentConditions = '';
let currentGust = 0;
let currentTemp = 0;
let currentHumidity = 0;
let currentPrecip = 0;
let currentCloud = 0;

//Weather Date 1
let weatherDate1 = '';
let date1Conditions = '';
let date1Icon = '';
let date1Temp = 0;
let date1Wind =  0;
let date1Humidity = 0;
let date1Precip = 0;

//Weather Date 2
let weatherDate2 = '';
let date2Conditions = '';
let date2Icon = '';
let date2Temp = 0;
let date2Wind =  0;
let date2Humidity = 0;
let date2Precip = 0;

//Weather Date 3
let weatherDate3 = '';
let date3Conditions = '';
let date3Icon = '';
let date3Temp = 0;
let date3Wind =  0;
let date3Humidity = 0;
let date3Precip = 0;


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
                            countryFlagLink = result['RestCountries']['flag'];
                            countryGeoJson =  result['geoJson'];
                            
                            for(language in result['RestCountries']['languages']){
                                languages.push(language['name']);
                            }

                            //weather var sets
                            setWeatherVars(result);
                            
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
                        countryFlagLink = result['RestCountries']['flag'];
                        countryGeoJson =  result['geoJson'];
                        
                        /*
                        for(let i = 0; i <= result['RestCountries']['languages'].length; i++){
                            languages.push(result['RestCountries']['languages'][i]['name']);
                        }
                        */
                        //weather var sets
                        setWeatherVars(result);

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

function setWeatherVars(resultJson) {
    currentWeatherIcon =  resultJson['WeatherInfo']['current']['condition']['icon'];
    currentConditions = resultJson['WeatherInfo']['current']['condition']['text'];
    currentTemp = resultJson['WeatherInfo']['current']['feelslike_c'];
    currentHumidity = resultJson['WeatherInfo']['current']['humidity'];
    currentPrecip =  resultJson['WeatherInfo']['current']['precip_mm'];
    currentGust = resultJson['WeatherInfo']['current']['gust_mph'];
    currentCloud = resultJson['WeatherInfo']['current']['cloud'];
    
    //date1
    weatherDate1 =  resultJson['WeatherInfo']['forecast']['forecastday'][0]['date'];
    date1Conditions = resultJson['WeatherInfo']['forecast']['forecastday'][0]['day']['condition']['text'];
    date1Icon =  resultJson['WeatherInfo']['forecast']['forecastday'][0]['day']['condition']['icon'];
    date1Temp = resultJson['WeatherInfo']['forecast']['forecastday'][0]['day']['avgtemp_c'];
    date1Wind = resultJson['WeatherInfo']['forecast']['forecastday'][0]['day']['maxwind_mph'];
    date1Humidity = resultJson['WeatherInfo']['forecast']['forecastday'][0]['day']['avghumidity'];
    date1Precip = resultJson['WeatherInfo']['forecast']['forecastday'][0]['day']['totalprecip_mm'];

    //date2
    weatherDate2 =  resultJson['WeatherInfo']['forecast']['forecastday'][1]['date'];
    date2Conditions = resultJson['WeatherInfo']['forecast']['forecastday'][1]['day']['condition']['text'];
    date2Icon =  resultJson['WeatherInfo']['forecast']['forecastday'][1]['day']['condition']['icon'];
    date2Temp = resultJson['WeatherInfo']['forecast']['forecastday'][1]['day']['avgtemp_c'];
    date2Wind = resultJson['WeatherInfo']['forecast']['forecastday'][1]['day']['maxwind_mph'];
    date2Humidity = resultJson['WeatherInfo']['forecast']['forecastday'][1]['day']['avghumidity'];
    date2Precip = resultJson['WeatherInfo']['forecast']['forecastday'][1]['day']['totalprecip_mm'];

    //date 3
    weatherDate3 =  resultJson['WeatherInfo']['forecast']['forecastday'][2]['date'];
    date3Conditions = resultJson['WeatherInfo']['forecast']['forecastday'][2]['day']['condition']['text'];
    date3Icon =  resultJson['WeatherInfo']['forecast']['forecastday'][2]['day']['condition']['icon'];
    date3Temp = resultJson['WeatherInfo']['forecast']['forecastday'][2]['day']['avgtemp_c'];
    date3Wind = resultJson['WeatherInfo']['forecast']['forecastday'][2]['day']['maxwind_mph'];
    date3Humidity = resultJson['WeatherInfo']['forecast']['forecastday'][2]['day']['avghumidity'];
    date3Precip = resultJson['WeatherInfo']['forecast']['forecastday'][2]['day']['totalprecip_mm'];
}

function forecastInfo(resultJson){
    for(day in resultJson['WeatherInfo']['forecast']['forecastday']){

    }
}

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
    console.log(languages);
    return `
    <table id="info">
        <tbody>
            <tr>
                <td id="imageCell" colspan="2"><img class="flagImage" src="${countryFlagLink}"></td>
            </tr>

            <tr>
                <td id="tableTitle" colspan="2"><b>General Information</b></td>
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

            <tr>
                <td class="key">Languages</td>
                <td class="value">${languages}</td>
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
                <td id="imageCell" colspan="2"><img class="flagImage" src="${countryFlagLink}"></td>
            </tr>

            <tr>
                <td id="tableTitle" colspan="2"><b>Currency Information</b></td>
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

function WeatherInfo() {
    return `
    <table id="info">
        <tbody>
            <tr>
                <td id="tableTitle" colspan="2"><b>Weather Information</b></td>
            </tr>

            <tr>
                <td colspan="2" class="weatherTitle"><b>Current Weather: ${currentConditions}</b></td>
            </tr>    
            
            <tr>
                <td colspan="2"><img class="weatherIcon" src=${currentWeatherIcon}></td>
            </tr>

            <tr>
                <td class="key">Temperature:</td>
                <td class="value">${currentTemp}<span>&#176</span>C</td>
            </tr>

            <tr>
                <td class="key">Gust:</td>
                <td class="value">${currentGust} mph</td>
            </tr>

            <tr>
                <td class="key">Humidity:</td>
                <td class="value">${currentHumidity}%</td>
            </tr>
            
            <tr>
                <td class="key">Precipitation:</td>
                <td class="value">${currentPrecip}mm</td>
            </tr>
            
            <tr>
                <td class="key">Cloud:</td>
                <td class="value">${currentCloud}%</td>
            </tr>
        </tbody>
    </table>

    <table>
        <tbody>
            <tr>
                <td colspan="4" class="weatherTitle"><b>Forecast for ${countryName}</b></td>
            </tr>

            <tr>
                <td>${weatherDate1}</td>
                <td>${date1Temp}<span>&#176</span>C</td>
                <td><img class="foreCastIcon" src=${date1Icon}></td>
                <td id="moreButton1"><img class="moreButton" src="https://img.icons8.com/ios/100/000000/circled-chevron-down.png"/></td>
            </tr>

                <tr id="date1Forecast">
                    <td>    
                        <table id="info">
                            <tbody>
                                    <tr>
                                        <td class="key">Conditions:</td>
                                        <td class="value">${date1Conditions}</td>
                                    </tr>

                                    <tr>
                                        <td class="key">Avgerage Temperature:</td>
                                        <td class="value">${date1Temp}<span>&#176</span>C</td>
                                    </tr>
                        
                                    <tr>
                                        <td class="key">Max Wind:</td>
                                        <td class="value">${date1Wind} mph</td>
                                    </tr>
                        
                                    <tr>
                                        <td class="key">Average Humidity:</td>
                                        <td class="value">${date1Humidity}%</td>
                                    </tr>
                                    
                                    <tr>
                                        <td class="key">Total Precipitation:</td>
                                        <td class="value">${date1Precip}mm</td>
                                    </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>


            <tr>
                <td>${weatherDate2}</td>
                <td>${date2Temp}<span>&#176</span>C</td>
                <td><img class="foreCastIcon" src=${date2Icon}></td>
                <td id="moreButton2"><img class="moreButton"  src="https://img.icons8.com/ios/100/000000/circled-chevron-down.png"/></td>
            </tr>


                <tr id="date2Forecast">
                    <td>
                    <table id="info">
                        <tbody>
                            <tr>
                                <td class="key">Conditions:</td>
                                <td class="value">${date2Conditions}</td>
                            </tr>

                            <tr>
                                <td class="key">Avgerage Temperature:</td>
                                <td class="value">${date2Temp}<span>&#176</span>C</td>
                            </tr>
                
                            <tr>
                                <td class="key">Max Wind:</td>
                                <td class="value">${date2Wind} mph</td>
                            </tr>
                
                            <tr>
                                <td class="key">Average Humidity:</td>
                                <td class="value">${date2Humidity}%</td>
                            </tr>
                            
                            <tr>
                                <td class="key">Total Precipitation:</td>
                                <td class="value">${date2Precip}mm</td>
                            </tr>
                        </tbody>
                    </table>
                    </td>
                </tr>

            <tr>
                <td>${weatherDate3}</td>
                <td>${date3Temp}<span>&#176</span>C</td>
                <td><img class="foreCastIcon" src=${date3Icon}></td>
                <td id="moreButton3"><img class="moreButton" src="https://img.icons8.com/ios/100/000000/circled-chevron-down.png"/></td>
            </tr>
                <tr id="date3Forecast">
                    <td>
                    <table id="info">
                        <tbody>
                            <tr>
                                <td class="key">Conditions:</td>
                                <td class="value">${date3Conditions}</td>
                            </tr>

                            <tr>
                                <td class="key">Avgerage Temperature:</td>
                                <td class="value">${date3Temp}<span>&#176</span>C</td>
                            </tr>
                
                            <tr>
                                <td class="key">Max Wind:</td>
                                <td class="value">${date3Wind} mph</td>
                            </tr>
                
                            <tr>
                                <td class="key">Average Humidity:</td>
                                <td class="value">${date3Humidity}%</td>
                            </tr>
                            
                            <tr>
                                <td class="key">Total Precipitation:</td>
                                <td class="value">${date3Precip}mm</td>
                            </tr>
                        </tbody>
                    </table>
                    </td>
                </tr>
        </tbody>
    </table>
    `
}

function mapInfoDisplay(){
    return `
    <table id="mapInfo">
        <tbody>
            <tr>
                <td id="imageCell"><img class="flagImage" src="${countryFlagLink}"></td>
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

function DisplayWeatherInfo() {
    $('.modal-title').html(`</b>${countryName}</b>`);
    $('.modal-body').html(WeatherInfo());
    map.closeTooltip();
    $('.modal').show()
}


//Event Listeners

    $('#countryInput').on('change', () => {
        setCountryInformation();
    });
    
    $('.close').on('click', () => {
        $('.modal').hide();
    });
    
    $('.btn').on('click', () => {
       $('.modal').hide();
    });
    
    $("#moreButton1").click(function() {
        console.log("clicked");
        $("#date1Forecast").slideDown();
    });
    
    $("#moreButton2").click(function() {
        console.log("clicked");
        $("#date2Forecast").slideToggle();
    });
    
    $("#moreButton3").click(function() {
        console.log("clicked");
        $('#date3Forecast').slideToggle();
    });


$(document).ready(() => {
    main();
});

//TODO Sort out jquery buttons so that the forecast slides down when you press it! Currently not receiving any input.