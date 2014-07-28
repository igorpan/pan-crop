<?php

namespace Pancrop;

class ImageCropper
{
    const FORMAT_JPG = 'jpg';
    const FORMAT_PNG = 'png';

    /**
     * @var resource
     */
    protected $image;

    /**
     * @var resource
     */
    protected $cropped;

    /**
     * @var array
     */
    protected $formats;

    public function __construct()
    {
        $this->initializeFormatCallables();
    }

    /**
     * Loads image from string
     *
     * @param string $imageData
     */
    public function loadImageFromString($imageData)
    {
        $this->image = imagecreatefromstring($imageData);
    }

    /**
     * Loads image from file
     *
     * @param string $filepath
     */
    public function loadImageFromFile($filepath)
    {
        $this->image = imagecreatefromstring(file_get_contents($filepath));
    }

    /**
     * Crops image
     *
     * @param int $sourceX      Source image top left X coordinate
     * @param int $sourceY      Source image top left Y coordinate
     * @param int $sourceWidth  Area width on source image
     * @param int $sourceHeight Area height on source image
     * @param int $targetWidth  Area width on destination image
     * @param int $targetHeight Area height on destination image
     *
     * @throws \LogicException
     */
    public function crop($sourceX, $sourceY, $sourceWidth, $sourceHeight, $targetWidth, $targetHeight)
    {
        if (null === $this->image) {
            throw new \LogicException(
                'You have to load an image before croping it. 
                Use loadImageFromString or loadImageFromFile'
            );
        }

        $destination = imagecreatetruecolor($targetWidth, $targetHeight);
        imagecopyresampled(
            $destination, 
            $this->image, 
            0, 
            0, 
            $sourceX, 
            $sourceY, 
            $targetWidth, 
            $targetHeight, 
            $sourceWidth, 
            $sourceHeight
        );

        $this->cropped = $destination;
    }

    /**
     * Returns image as string
     *
     * @param string $format
     *
     * @return string
     *
     * @throws \LogicException
     */
    public function getCroppedImageAsString($format = self::FORMAT_PNG)
    {
        if (null === $this->cropped) {
            throw new \LogicException('You have to crop image first before getting it');
        }

        return $this->formatImageData($this->cropped, $format);
    }

    /**
     * Saves image to a file
     *
     * @param string $filepath
     * @param string $format
     */
    public function saveCroppedImageToFile($filepath, $format = self::FORMAT_PNG)
    {
        file_put_contents($filepath, $this->getCroppedImageAsString($format));
    }

    /**
     * Initialize supported format and their callables
     */
    protected function initializeFormatCallables()
    {
        $this->formats = array(
            self::FORMAT_PNG => 'imagepng',
            self::FORMAT_JPG => 'imagejpeg',
        );
    }

    /**
     * Formats image resource data to chosen format.
     *
     * @param resource $data
     * @param string $format
     *
     * @return string
     *
     * @throws \InvalidArgumentException
     */
    private function formatImageData($data, $format)
    {
        if (!isset($this->formats[$format])) {
            throw new \InvalidArgumentException(sprintf(
                'Unsupported format %s. Supported foramts are: %s',
                $format,
                implode(', ', array_keys($this->formats))
            ));
        }

        ob_start();
        call_user_func($this->formats[$format], $data);
        $formatted = ob_get_clean();

        return $formatted;
    }
}