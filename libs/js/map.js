var map = L.map('map').setView([51.505, -0.09], 13);

function main(){
    L.tileLayer('https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=2e011da1ea684120b8c6bf9fa2df5a98', {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '2e011da1ea684120b8c6bf9fa2df5a98',
        maxZoom: 22
    },
    ).addTo(map);
    //Overall Information Button
    L.easyButton('<i class="material-icons icon">info</i>', () => {DisplayGeneralInfo()}).addTo(map);
    L.easyButton('<i class="material-icons icon">attach_money</i>', () => {DisplayCurrencyInfo()}).addTo(map);
    L.easyButton('<i class="material-icons icon">wb_sunny</i>', () => {DisplayWeatherInfo()}).addTo(map);
    L.easyButton('<i class="material-icons icon">confirmation_number</i>', () => {DisplayVenueInfo()}).addTo(map);
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
let callingCodes = [];

//Currency Vars
let currencyName = '';
let currencySymbol = '';
let gdpInfo = 0; 
let gdpGrowthInfo = 0;

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
let date1Button = 'arrow_circle_down';

//Weather Date 2
let weatherDate2 = '';
let date2Conditions = '';
let date2Icon = '';
let date2Temp = 0;
let date2Wind =  0;
let date2Humidity = 0;
let date2Precip = 0;
let date2Button = 'arrow_circle_down';

//Weather Date 3
let weatherDate3 = '';
let date3Conditions = '';
let date3Icon = '';
let date3Temp = 0;
let date3Wind =  0;
let date3Humidity = 0;
let date3Precip = 0;
let date3Button = 'arrow_circle_down';

//Recommended Places Variables
let venueNames = [];
let venueLatLngs = [];
let venueLinks = [];
let venueAddresses = [];



var geoJsonStyle = {
    "color": "#85e384",
    "opacity": 0.8,
    "weight": 2,
}

var geoJsonLayer = [];

function getInitialLocation(){
        if('geolocation' in navigator){
            navigator.geolocation.getCurrentPosition((position) => {
                $('#loading').show();
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
                            capital = result['RestCountries']['capital'];
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

                            for(let i = 0; i < result['RestCountries']['callingCodes'].length; i++){
                                const callingCode = '+' + result['RestCountries']['callingCodes'][i];
                                callingCodes.push(callingCode);
                            }
                            
                            for(let i = 0; i < result['RestCountries']['languages'].length; i++){
                                languages.push(result['RestCountries']['languages'][i]['name']);
                            }

                            gdpInfo = result['Indicator'][1][0]['value'];
                            gdpGrowthInfo = result['IndicatorGrowth'][1][0]['value'];

                            //weather var sets
                            setWeatherVars(result);
                            setVenueVars(result);
                            addVenueMarkers();
                            
                            setLJSON("userCurrency", currency);
                            createGeoJson(countryGeoJson);
                            geoJsonLayer.bindTooltip(mapInfoDisplay()).toggleTooltip();
                            $('#loading').hide();

                        }
                    },
                    error: (jqXHR, textStatus, errorThrown) => {
                        console.warn(jqXHR.responseText)
                        console.log(errorThrown);
                        $('#loading').hide();
                    }
                });
            });
        };
};

function setCountryInformation(){
            $('#loading').show();
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
                        capital = result['RestCountries']['capital'];
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

                        callingCodes = [];
                        for(let i = 0; i < result['RestCountries']['callingCodes'].length; i++){
                            const callingCode = '+' + result['RestCountries']['callingCodes'][i];
                            callingCodes.push(callingCode);
                        }
                        
                        languages = [];
                        for(let i = 0; i < result['RestCountries']['languages'].length; i++){
                            languages.push(result['RestCountries']['languages'][i]['name']);
                        }

                        gdpInfo = result['Indicator'][1][0]['value'];
                        gdpGrowthInfo = result['IndicatorGrowth'][1][0]['value'];
                        //weather var sets
                        setWeatherVars(result);
                        setVenueVars(result);
                        addVenueMarkers();

                        createGeoJson(countryGeoJson);
                        geoJsonLayer.bindTooltip(mapInfoDisplay()).toggleTooltip();
                        $('#loading').hide();
                    }
                },
                error: (jqXHR, textStatus, errorThrown) => {
                    console.warn(jqXHR.responseText)
                    console.log(errorThrown);
                    $('#loading').hide();
                }
            });
        };

function setWeatherVars(resultJson) {
    if(resultJson['WeatherInfo'] != null){
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
    } else {
    currentWeatherIcon =  "N/A";
    currentConditions = "N/A";
    currentTemp = "N/A";
    currentHumidity = "N/A";
    currentPrecip =  "N/A";
    currentGust = "N/A";
    currentCloud = "N/A";
    
    //date1
    weatherDate1 =  "N/A";
    date1Conditions = "N/A";
    date1Icon =  "N/A";
    date1Temp = "N/A";
    date1Wind = "N/A";
    date1Humidity = "N/A";
    date1Precip = "N/A";

    //date2
    weatherDate2 =  "N/A";
    date2Conditions = "N/A";
    date2Icon =  "N/A";
    date2Temp = "N/A";
    date2Wind = "N/A";
    date2Humidity = "N/A";
    date2Precip = "N/A";

    //date 3
    weatherDate3 =  "N/A";
    date3Conditions = "N/A";
    date3Icon =  "N/A";
    date3Temp = "N/A";
    date3Wind = "N/A";
    date3Humidity = "N/A";
    date3Precip = "N/A";
    }
    
}

function setVenueVars(resultJson) {
    venueNames = [];
    venueLatLngs = [];
    venueLinks = [];
    venueAddresses = [];

    if(resultJson['Venues']){
        for(let i = 0; i < resultJson['Venues']['response']['groups'][0]['items'].length; i++) {
            let latLng = [];
            venueNames.push(resultJson['Venues']['response']['groups'][0]['items'][i]['venue']['name']);
            latLng.push(resultJson['Venues']['response']['groups'][0]['items'][i]['venue']['location']['lat']);
            latLng.push(resultJson['Venues']['response']['groups'][0]['items'][i]['venue']['location']['lng']);
            venueLatLngs.push(latLng);
            venueLinks.push("https://foursquare.com/v/resultJson['Venues']['response']['groups'][0]['items'][i]['venue']['name']" +"/" + resultJson['Venues']['response']['groups'][0]['items'][i]['venue']['id']);
            venueAddresses.push(resultJson['Venues']['response']['groups'][0]['items'][i]['venue']['location']['formattedAddress']);
        }     
    }
}

function addVenueMarkers() {
    for(let i = 0; i < venueLatLngs.length; i++){
        L.marker([venueLatLngs[i][0], venueLatLngs[i][1]]).bindTooltip(VenueInfoDisplay(i), { }).addTo(map);
    }
}

function VenueAddressCreator(venueAddress){
    let returnVenueAddress = '';
    for(let i = 0; i < venueAddress.length; i++){
        returnVenueAddress += `<tr><td class="value">${venueAddress[i]}</td></tr>`;
    }
    return returnVenueAddress;
}

function VenueInfoDisplay(i){
    return `
    <table id="mapInfo">
        <tbody>
            <tr>
                <td class="titleCell" colspan="2"><b>Recommeneded Venue: ${venueNames[i]}</b></td>
            </tr>

            <tr>
                <td><b>Address</b></td>
            </tr>

            <tr>
                <td class="value">${VenueAddressCreator(venueAddresses[i])}</td>
            </tr>
        </tbody>
    </table>
 `
}

function VenueInfo(){
    let venueInformation = '';
    if(venueNames.length == 0){
        venueInformation += `<tr><td>Sorry no results found!<br>
        Try a different country</td></tr>`;
    } else {         
        for(let i = 0; i < venueNames.length; i++){
            venueInformation += `<tr><td class="venueTitle">Recommeneded Venue #${i+1} ${venueNames[i]}<td></tr>
                <tr>
                    <td class="venueAddressHeader">Venue Address</td>
                </tr>
                ${VenueAddressCreator(venueAddresses[i])}
                <tr>
                    <td class="venueLinks"><a href="${venueLinks[i]}" target="_blank">Click here for more info</a></td>
                </tr>
                <br>
            `
        }
    }

    return `<table>
    <tbody>
            ${venueInformation}
        </tbody>
    </table>
    `
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
                <td class="value">${numberWithCommas(population)}</td>
            </tr>

            <tr>
                <td class="key">Area:</td>
                <td class="value">${numberWithCommas(area)}km<sup>2</sup></td>
            </tr>

            <tr>
                <td class="key">Languages:</td>
                <td class="value">${languages}</td>
            </tr>

            <tr>
                <td class="key">Country Code:</td>
                <td class="value">${countryCode}</td>
            </tr>

            <tr>
                <td class="key">Calling Codes:</td>
                <td class="value">${callingCodes}</td>
            </tr>

            <tr>
                <td colspan="2" class="linkCell"><a href="https://wikipedia.com/wiki/${countryName}" target="_blank">Wikipedia Information on ${countryName}</a></td>
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

            <tr>
                <td class="key">GDP (2019):</td>
                <td class="value">$${numberWithCommas(gdpInfo)}</td>
            <tr>

            <tr>
                <td class="key">GDP Growth:</td>
                <td class="value">${gdpGrowthInfo.toFixed(2)}%</td>
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
                <td id="tableTitle" colspan="4"><b>Current Weather in ${countryName}</b></td>
            </tr>  
            
            <tr>
                <td colspan="4"><img class="weatherIcon" src=${currentWeatherIcon}></td>                
            </tr>

            <tr>
                <td colspan="4" class="weatherTitle"><b>${currentConditions}</b></td>
            </tr>

            <tr>
                <td class="currentKey thermometer currentSpace"><i class="fas fa-thermometer-half fa-2x"></i></td>
                <td class="currentValue currentSpace">${currentTemp}<span>&#176</span>C</td>
                <td class="currentKey wind currentSpace"><i class="fas fa-wind fa-2x"></i></td>
                <td class="currentValue currentSpace">${currentGust} mph</td>
            </tr>

            <tr>
                <td class="currentKey cloud currentSpace"><i class="fas fa-cloud fa-2x"></i></td>
                <td class="currentValue currentSpace">${currentCloud}%</td>
                <td class="currentKey rain currentSpace"><i class="fas fa-tint fa-2x"></i></td>
                <td class="currentValue currentSpace">${currentPrecip}mm</td>
            </tr>
        </tbody>
    </table>
    <hr>
    <table class="forecastTable">
        <tbody>
            <tr>
                <td colspan="4" class="weatherTitle"><b>Forecast for ${countryName}</b></td>
            </tr>

            <tr>
                <td class="forecastIconCell"><img class="foreCastIcon" src=${date1Icon}></td>
                <td class="forecastCell">${weatherDate1}</td>
                <td class="forecastCell">${date1Temp}<span>&#176</span>C</td>
                <td class="forecastButton"><i class="material-icons moreButton" id="moreButton1">${date1Button}</i></td>
            </tr>

                <tr id="date1Forecast">
                    <td colspan="4">    
                        <table id="info">
                            <tbody>
                                    <tr>
                                        <td class="key" colspan="2">Conditions:</td>
                                        <td class="value" colspan="2">${date1Conditions}</td>
                                    </tr>

                                    <tr>
                                        <td class="key thermometer" colspan="2"><i class="fas fa-thermometer-half fa-2x"></i></td>
                                        <td class="value" colspan="2">${date1Temp}<span>&#176</span>C</td>
                                    </tr>
                        
                                    <tr>
                                        <td class="key wind" colspan="2"><i class="fas fa-wind fa-2x"></td>
                                        <td class="value" colspan="2">${date1Wind} mph</td>
                                    </tr>
                                    
                                    <tr>
                                        <td class="key rain" colspan="2"><i class="fas fa-tint fa-2x"></td>
                                        <td class="value" colspan="2">${date1Precip}mm</td>
                                    </tr>

                                    <tr>
                                        <td class="key" colspan="2">Avg. Humidity:</td>
                                        <td class="value" colspan="2">${date1Humidity}%</td>
                                    </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>


            <tr>
                <td class="forecastIconCell"><img class="foreCastIcon" src=${date2Icon}></td>
                <td class="forecastCell">${weatherDate2}</td>
                <td class="forecastCell">${date2Temp}<span>&#176</span>C</td>
                <td class="forecastButton"><i class="material-icons moreButton" id="moreButton2">${date2Button}</i></td>
            </tr>


                <tr id="date2Forecast">
                    <td colspan="4">
                    <table id="info">
                        <tbody>
                            <tr>
                                <td class="key" colspan="2">Conditions:</td>
                                <td class="value" colspan="2">${date2Conditions}</td>
                            </tr>

                            <tr>
                                <td class="key thermometer" colspan="2"><i class="fas fa-thermometer-half fa-2x"></td>
                                <td class="value" colspan="2">${date2Temp}<span>&#176</span>C</td>
                            </tr>
                
                            <tr>
                                <td class="key wind" colspan="2"><i class="fas fa-wind fa-2x"></td>
                                <td class="value" colspan="2">${date2Wind} mph</td>
                            </tr>
                            
                            <tr>
                                <td class="key rain" colspan="2"><i class="fas fa-tint fa-2x"></td>
                                <td class="value" colspan="2">${date2Precip}mm</td>
                            </tr>

                            <tr>
                                <td class="key" colspan="2">Average Humidity:</td>
                                <td class="value" colspan="2">${date2Humidity}%</td>
                            </tr>
                        </tbody>
                    </table>
                    </td>
                </tr>

            <tr>
                <td class="forecastIconCell"><img class="foreCastIcon" src=${date3Icon}></td>
                <td class="forecastCell">${weatherDate3}</td>
                <td class="forecastCell">${date3Temp}<span>&#176</span>C</td>
                <td class="forecastButton"><i class="material-icons moreButton" id="moreButton3">${date3Button}</i></td>
            </tr>
                <tr id="date3Forecast">
                    <td colspan="4">
                    <table id="info">
                        <tbody>
                            <tr>
                                <td class="key" colspan="2">Conditions:</td>
                                <td class="value" colspan="2">${date3Conditions}</td>
                            </tr>

                            <tr>
                                <td class="key thermometer" colspan="2"><i class="fas fa-thermometer-half fa-2x"></td>
                                <td class="value" colspan="2">${date3Temp}<span>&#176</span>C</td>
                            </tr>
                
                            <tr>
                                <td class="key wind" colspan="2"><i class="fas fa-wind fa-2x"></td>
                                <td class="value" colspan="2">${date3Wind} mph</td>
                            </tr>
                            
                            <tr>
                                <td class="key rain" colspan="2"><i class="fas fa-tint fa-2x"></td>
                                <td class="value" colspan="2">${date3Precip}mm</td>
                            </tr>

                            <tr>
                                <td class="key" colspan="2">Average Humidity:</td>
                                <td class="value" colspan="2">${date3Humidity}%</td>
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
                <td class="value">${numberWithCommas(population)}</td>
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
    $('.modal-title').html(`</b>${countryName} - Currency & Economy</b>`);
    $('.modal-body').html(CurrencyInfo());
    map.closeTooltip();
    $('.modal').show()
}

function DisplayWeatherInfo() {
    $('.modal-title').html(`</b>${countryName} - Weather</b>`);
    $('.modal-body').html(WeatherInfo());
    map.closeTooltip();
    $('.modal').show()
        $("#moreButton1").click(() => {
            if(date1Button == 'arrow_circle_down'){
                date1Button = 'arrow_circle_up';
                $('#moreButton1').text(date1Button);
            } else {
                date1Button = 'arrow_circle_down';
                $('#moreButton1').text(date1Button);
            }
            $("#date1Forecast").slideToggle();
        });
        
        $("#moreButton2").click(() => {
            if(date2Button == 'arrow_circle_down'){
                date2Button = 'arrow_circle_up';
                $('#moreButton2').text(date2Button);
            } else {
                date2Button = 'arrow_circle_down';
                $('#moreButton2').text(date2Button);
            }
            $("#date2Forecast").slideToggle();
        });
        
        $("#moreButton3").click(() => {
            if(date3Button == 'arrow_circle_down'){
                date3Button = 'arrow_circle_up';
                $('#moreButton3').text(date3Button);
                
            } else {
                date3Button = 'arrow_circle_down';
                $('#moreButton3').text(date3Button);
            }
            $('#date3Forecast').slideToggle();
        });    
}

function DisplayVenueInfo() {
    $('.modal-title').html(`</b>${countryName} - Venues</b>`);
    $('.modal-body').html(VenueInfo());
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
           

$(document).ready(() => {
    main();
});

//TODO Sort out jquery buttons so that the forecast slides down when you press it! Currently not receiving any input.