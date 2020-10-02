<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $output = [];
    $countryCode = '';
    $countryIsoAlpha3 = '';
    $userCurrency = $_REQUEST['currency'];

    /*Gets Country Code using GeoNames */
    if(isset($_REQUEST['lat']) && isset($_REQUEST['lng'])){
        $countryCodeUrl = 'api.geonames.org/countryCodeJSON?lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=ryan.bell1997';

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL, $countryCodeUrl);

        $countryCodeResponse = curl_exec($ch);
        curl_close($ch);

        $countryCodeResult = json_decode($countryCodeResponse, true);

        $countryCode = $countryCodeResult['countryCode'];

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "Country Code acquired";
    $output['CountryCode'] = $countryCodeResult;
    } else {
        $countryCode = $_REQUEST['countryCode'];
    }
    

    /*Gets country info from Geonames using country code*/
    $countryInfoUrl = 'http://api.geonames.org/countryInfoJSON?country=' . $countryCode . '&username=ryan.bell1997';

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL, $countryInfoUrl);

        $countryInfoResult = curl_exec($ch);

        curl_close($ch);

    $countryInfoDecode = json_decode($countryInfoResult, true);
    $countryIsoAlpha3 = $countryInfoDecode['geonames'][0]['isoAlpha3'];

    $output['CountryInfo'] = $countryInfoDecode;

    /*Currently, this api converts the SEARCHED country currency against USD.*/
    $currencyInfoURL = '';
    if($userCurrency != $countryInfoDecode['geonames'][0]['currencyCode']){
        $currencyInfoURL = 'https://api.exchangerate.host/convert?from=' . $userCurrency . '&to=' . $countryInfoDecode['geonames'][0]['currencyCode'];
    } else {
        $currencyInfoURL = 'https://api.exchangerate.host/convert?from=' . $userCurrency . '&symbols=GBP,USD,EUR';
    }

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL, $currencyInfoURL);

        $currencyInfoResult = curl_exec($ch);

        curl_close($ch);

        $currencyInfoDecode = json_decode($currencyInfoResult);

        $output['CurrencyInfo'] = $currencyInfoDecode;


    /*Gets Weather for the capital city of the selected country using the capital city from Geonames country info */
    $weatherUrl = 'http://api.weatherapi.com/v1/forecast.json?key=7198bbffcd0b4151847165019202809&q=' . $countryInfoDecode['geonames'][0]['capital'] . '&days=7';

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL, $weatherUrl);

        $weatherForecastResult = curl_exec($ch);

        curl_close($ch);

        $weatherForecastDecode = json_decode($weatherForecastResult);

        $output['WeatherInfo'] = $weatherForecastDecode;

    /*Gets Venue Recomendations using FourSqaure API, based off location*/
    $venueUrl = 'https://api.foursquare.com/v2/venues/explore?client_id=3ORME23U3ZYMEPSL0MSIUQDHQTRJ5OOIDFMKFTRFRT2MT3A3&client_secret=GWVFCNAITRF2ODKFXCEYG1XH22JQTWHHVW52WE3Z1QKXOSAE&near=' . $countryInfoDecode['geonames'][0]['capital'] . '&section=topPicks&limit=3&v=20210224';
    
    $ch = curl_init();

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL, $venueUrl);

        $venueResult = curl_exec($ch);

        curl_close($ch);
    
    $venueDecode = json_decode($venueResult,true);

    $output['Venues'] = $venueDecode;

    /*Getting the geoJson for the country*/
    $geoJsonString = file_get_contents("../geoJson/countries_small.geo.json");

    $geoJsonDecode = json_decode($geoJsonString,true);
    $geoJsonCountries = $geoJsonDecode['features'];
    $countryGeoJson = '';

    foreach($geoJsonCountries as $country){
        if($country['id'] == $countryIsoAlpha3){
            $countryGeoJson = $country['geometry'];
        break;
        }
    }

    $output['geoJson'] = $countryGeoJson;


    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "Information acquired";

    header('Content-Type:application/json; charset=UTF-8');
    
    echo json_encode($output);
?>