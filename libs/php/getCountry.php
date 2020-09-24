<?php
if($_REQUEST['lat'] || $_REQUEST['lng']){
    $openCageUrl = 'https://api.opencagedata.com/geocode/v1/json?q=' . urlencode($_REQUEST['lat'] . ',' . $_REQUEST['lng']) . '&key=a32b5f964b3443258ab53e866c1c80d6&pretty=1';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $openCageUrl);
    
    $result=curl_exec($ch);
    
    curl_close($ch);
    
    $decodeCountry = json_decode($result,true);
}

$restCountryUrl = 'https://restcountries.eu/rest/v2/name/' . $decodeCountry['results'][0]['components']['country'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $restCountryUrl);

$result=curl_exec($ch);

curl_close($ch);

$restCountryDecode = json_decode($result,true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "data acquired";
$output['data'] = $restCountryDecode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>