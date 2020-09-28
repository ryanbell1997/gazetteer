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
let population = '';
let region = '';
let capital = '';
let landMass = 0;


function getInitialLocation(){
    if(!getLJSON('initialLocation') || !getLJSON('initialLocation')){
        if('geolocation' in navigator){
            navigator.geolocation.getCurrentPosition((position) => {
                $.ajax({
                    url: '../libs/php/getCountry.php',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    },
                    success: (result) => {
                        setView(result['data'][0]['latlng'][0], result['data'][0]['latlng'][1]);
                        L.marker([result['data'][0]['latlng'][0], result['data'][0]['latlng'][1]]).addTo(map).bindPopup(`<b>${result['data'][0]['name']}</b>`).openPopup();
                    }
                });
            });
        };
    };
};

function displayCountryInformation() {
    $(document).ready(() => {
        $.ajax({
            url: './libs/php/searchProcessor.php',
            type: 'POST',
            dataType: 'json',
            data: {
                country: $('#countryInput').val(),
            },
            success: (result) => {
                map.setView([result['data'][0]['latlng'][0], result['data'][0]['latlng'][1]]);
                map.setZoom(6);
                L.marker([result['data'][0]['latlng'][0], result['data'][0]['latlng'][1]]).addTo(map).bindPopup(`<b>${result['data'][0]['name']}</b><br>
                Capital: ${result['data'][0]['capital']}<br>
                Region: ${result['data'][0]['region']}<br>
                Population: ${result['data'][0]['population']}<br>
                Currency: ${result['data'][0]['currencies'][0]['name']}<br>
                <br>
                <a href="#">See more info</a><br>
                `).openPopup();

            }
        })
    })
}

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

$('#countrySearch').on('submit', () => {
    displayCountryInformation();
})

$('#countryInput').on('submit', () => {
    displayCountryInformation();
})
//Get enter press working in order to search.
/*
$('#countryInput').on('keyup', (e) => {
    if(e.which == 13) {
        returnCountryInformation();
    }
})
*/

$(document).ready(() => {
    main();
    
});