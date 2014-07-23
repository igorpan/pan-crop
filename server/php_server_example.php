<?php

$cropData = json_decode($_REQUEST['cropData'], true);
$scale = $cropData['s'];
$cropWidth = $cropData['w'];
$cropHeight = $cropData['h'];

$tmpImageFile = $_FILES['image']['tmp_name'];
$img = imagecreatefromjpeg($tmpImageFile);

$dest = imagecreatetruecolor($cropWidth, $cropHeight);
imagecopyresampled(
  $dest, 
  $img, 
  0, 
  0, 
  $cropData['x1'] / $scale, 
  $cropData['y1'] / $scale, 
  $cropWidth, 
  $cropHeight, 
  $cropWidth / $scale, 
  $cropHeight / $scale
);

header('Content-Type: image/jpeg');
imagejpeg($dest);