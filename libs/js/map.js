var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=NHZ05sbIiAjl55cMhy0p', {
    attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
}).addTo(map);

function setLJSON(storageName,item) {
    localStorage.setItem(storageName, JSON.stringify(item));
}

function getLJSON(item) {
    return JSON.parse(localStorage.getItem(item));
}

function getInitialLocation(){
    if(!getLJSON('initialLocation') || !getLJSON('initialLocation')){
        if('geolocation' in navigator){
            navigator.geolocation.getCurrentPosition((position) => {
                $(document).ready(() => {
                    $.ajax({
                        url: '../libs/php/getCountry.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        },
                        success: (result) => {
                            if(result.status.name == "ok"){
                                const currentCountryName = result['data'][0]['components']['country'];
                                const currentLatLng = [position.coords.latitude, position.coords.longitude];
                                map.setView([position.coords.latitude, position.coords.longitude]);
                                L.marker([position.coords.latitude, position.coords.longitude]).addTo(map).bindPopup(`<b>${currentCountryName}!</b><br>`).openPopup();
                                setLJSON('initialLocation', currentCountryName);
                                setLJSON('initialCoords', currentLatLng);
                                setLJSON('initialCountry', currentCountryName);
                            }
                        }, error: (jqXHR, textStatus, errorThrown) => {
                            alert("Get Country Failed");
                        }
                    });
                })
            });
        } else {
            alert("Please enable location to proceed.");
        }
    } else {
        var coords = getLJSON('initialCoords');
        map.setView([coords[0], coords[1]]);
        L.marker([coords[0], coords[1]]).addTo(map).bindPopup(`<b>${getLJSON('initialCountry')}!</b><br>`).openPopup();
    }     
}

function returnCountryInformation() {
    $(document).ready(() => {
        $.ajax({
            url: '../libs/php/searchProcessor.php',
            type: 'POST',
            dataType: 'json',
            data: {
                country: $('#countryInput').val(),
            },
            success: (result) => {
                map.setView([result['data'][0]['latlng'][0], result['data'][0]['latlng'][1]]);
                L.marker([result['data'][0]['latlng'][0], result['data'][0]['latlng'][1]]).addTo(map).bindPopup(`<b>${result['data'][0]['name']}!</b><br>
                Capital: ${result['data'][0]['capital']}<br>
                Region: ${result['data'][0]['region']}<br>
                Population: ${result['data'][0]['population']}<br>
                Currency: ${result['data'][0]['currencies'][0]['name']}<br>
                `).openPopup();

            }
        })
    })
}

$(document).ready(() => {
    getInitialLocation();
})

$('#countrySearch').on('click', () => {
    returnCountryInformation();
}) 



