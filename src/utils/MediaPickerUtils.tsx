import ImagePicker, { Image,Video, Options} from 'react-native-image-crop-picker';

export default class MediaPickerUtils {

  public static openPicker(options : Options)  {
    return ImagePicker.openPicker(options);
  }

  public static openCamera(mediaType : 'photo'|'video'|'any', options : Options)  {
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
