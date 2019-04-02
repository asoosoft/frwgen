/**
 * @author 
 */

var CameraManager = {};

//--------------------------------------------------------------------------------
//	사진 정보 가져오기
CameraManager.openFilePicker = function(callback)
{
    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    var options = this.setOptions(srcType);
    var func = this.createNewFileEntry;
	
	
    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        callback(imageUri);

    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
//	cordova.exec(callback, null, "DevicePlugin", "getDeviceUniqueId", [isHex]);
};

//--------------------------------------------------------------------------------
CameraManager.createNewFileEntry = function(imgUri)
{
    window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

        // JPEG file
        dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {

            // Do something with it, like write to it, upload it, etc.
            // writeFile(fileEntry, imgUri);
            console.log("got file: " + fileEntry.fullPath);
            // displayFileData(fileEntry.fullPath, "File copied to");

        }, onErrorCreateFile);

    }, onErrorResolveUrl);
};

//--------------------------------------------------------------------------------
//	카메라 옵션 세팅
CameraManager.setOptions = function(srcType)
{
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
		//destinationType: Camera.DestinationType.FILE_URI,
		destinationType: Camera.DestinationType.DATA_URL,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
};
