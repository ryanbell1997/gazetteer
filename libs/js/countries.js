$(document).ready(() => {
    $.getJSON('../geoJson/countries_small.geo.json',
        function(data) {
            data.forEach(element => {
                $('#countryInput').append("<option value='" + element[0]['id'] + "'>" + element[0]['name'] + "</option>");
            });
    })
});