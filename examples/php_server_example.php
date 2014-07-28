<?php

// Deserialize crop data to array
$cropData = json_decode($_REQUEST['cropData'], true);

// Get uploaded file path
$tmpImageFile = $_FILES['image']['tmp_name'];

// Include cropper
require '../server/php/ImageCropper.php';

$cropper = new Pancrop\ImageCropper();

// Load image from file
$cropper->loadImageFromFile($tmpImageFile);

// Crop it
$cropper->crop($cropData['sx'], $cropData['sy'], $cropData['sw'], $cropData['sh'], $cropData['w'], $cropData['h']);

// Output it as response
header('Content-Type: image/png');
echo $cropper->getCroppedImageAsString();

// Save it to file
$cropper->saveCroppedImageToFile('cropped.png');