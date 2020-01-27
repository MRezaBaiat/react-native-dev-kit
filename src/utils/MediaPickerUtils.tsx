import ImagePicker, { Image, Options } from 'react-native-image-crop-picker';

export default class MediaPickerUtils {


  /**
     Request Object :
     Property	Type	Description
     cropping	bool (default false)	Enable or disable cropping
     width	number	Width of result image when used with cropping option
     height	number	Height of result image when used with cropping option
     multiple	bool (default false)	Enable or disable multiple image selection
     writeTempFile (ios only)	bool (default true)	When set to false, does not write temporary files for the selected images. This is useful to improve performance when you are retrieving file contents with the includeBase64 option and don't need to read files from disk.
     includeBase64	bool (default false)	When set to true, the image file content will be available as a base64-encoded string in the data property. Hint: To use this string as an image source, use it like: <Image source={{uri: `data:${image.mime};base64,${image.data}`}} />
     includeExif	bool (default false)	Include image exif data in the response
     avoidEmptySpaceAroundImage	bool (default true)	When set to true, the image will always fill the mask space.
     cropperActiveWidgetColor (android only)	string (default "#424242")	When cropping image, determines ActiveWidget color.
     cropperStatusBarColor (android only)	string (default #424242)	When cropping image, determines the color of StatusBar.
     cropperToolbarColor (android only)	string (default #424242)	When cropping image, determines the color of Toolbar.
     freeStyleCropEnabled (android only)	bool (default false)	Enables user to apply custom rectangle area for cropping
     cropperToolbarTitle	string (default Edit Photo)	When cropping image, determines the title of Toolbar.
     cropperCircleOverlay	bool (default false)	Enable or disable circular cropping mask.
     disableCropperColorSetters (android only)	bool (default false)	When cropping image, disables the color setters for cropping library.
     minFiles (ios only)	number (default 1)	Min number of files to select when using multiple option
     maxFiles (ios only)	number (default 5)	Max number of files to select when using multiple option
     waitAnimationEnd (ios only)	bool (default true)	Promise will resolve/reject once ViewController completion block is called
     smartAlbums (ios only)	array (supported values) (default ['UserLibrary', 'PhotoStream', 'Panoramas', 'Videos', 'Bursts'])	List of smart albums to choose from
     useFrontCamera	bool (default false)	Whether to default to the front/'selfie' camera when opened
     compressVideoPreset (ios only)	string (default MediumQuality)	Choose which preset will be used for video compression
     compressImageMaxWidth	number (default none)	Compress image with maximum width
     compressImageMaxHeight	number (default none)	Compress image with maximum height
     compressImageQuality	number (default 1 (Android)/0.8 (iOS))	Compress image with quality (from 0 to 1, where 1 is best quality). On iOS, values larger than 0.8 don't produce a noticable quality increase in most images, while a value of 0.8 will reduce the file size by about half or less compared to a value of 1.
     loadingLabelText (ios only)	string (default "Processing assets...")	Text displayed while photo is loading in picker
     mediaType	string (default any)	Accepted mediaType for image selection, can be one of: 'photo', 'video', or 'any'
     showsSelectedCount (ios only)	bool (default true)	Whether to show the number of selected assets
     forceJpg (ios only)	bool (default false)	Whether to convert photos to JPG. This will also convert any Live Photo into its JPG representation
     showCropGuidelines (android only)	bool (default true)	Whether to show the 3x3 grid on top of the image during cropping
     hideBottomControls (android only)	bool (default false)	Whether to display bottom controls
     enableRotationGesture (android only)	bool (default false)	Whether to enable rotating the image by hand gesture
     cropperChooseText (ios only) 	          string (default choose)        	Choose button text
     cropperCancelText (ios only)	string (default Cancel)	Cancel button text
     *
     *
     *
     *
     Response Object :
     Property	Type	Description
     path	string	Selected image location. This is null when the writeTempFile option is set to false.
     localIdentifier(ios only)	string	Selected images' localidentifier, used for PHAsset searching
     sourceURL(ios only)	string	Selected images' source path, do not have write access
     filename(ios only)	string	Selected images' filename
     width	number	Selected image width
     height	number	Selected image height
     mime	string	Selected image MIME type (image/jpeg, image/png)
     size	number	Selected image size in bytes
     data	base64	Optional base64 selected file representation
     exif	object	Extracted exif data from image. Response format is platform specific
     cropRect	object	Cropped image rectangle (width, height, x, y)
     creationDate (ios only)	string	UNIX timestamp when image was created
     modificationDate	string	UNIX timestamp when image was last modified
     */


  public static openPicker(mediaType : 'photo'|'video'|'any', options : Options) : Promise<Image | Image[]> {
    if (options && mediaType === 'video') {
      options.cropping = false;
    }
    return ImagePicker.openPicker({
      mediaType,
      ...options,
    });
  }

  public static openCamera(mediaType : 'photo'|'video'|'any', options : Options) : Promise<Image | Image[]> {
    if (options && mediaType === 'video') {
      options.cropping = false;
    }
    return ImagePicker.openCamera({
      mediaType,
      ...options,
    });
  }

  public static forceCleanUp() {
    ImagePicker.clean().then(() => {
    }).catch((e) => {
      alert(e);
    });
  }
}
