<?php

$url = 'https://api.opencagedata.com/geocode/v1/json?q=' . urlencode($_REQUEST['lat'] . ',' . $_REQUEST['lng']) . '&key=a32b5f964b3443258ab53e866c1c80d6&pretty=1';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "data acquired";
$output['data'] = $decode['results'];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>