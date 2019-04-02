var VoiceRecognitionManager = {};

VoiceRecognitionManager.callbackFunc = null;
VoiceRecognitionManager.recognitionWorkDone = function(data)
{
	VoiceRecognitionManager.callbackFunc(data);
	VoiceRecognitionManager.callbackFunc = null;
};

VoiceRecognitionManager.functionCheck = function(callback)
{
	if(VoiceRecognitionManager.callbackFunc) 
	{
		callback(0);
		return false;
	}
	VoiceRecognitionManager.callbackFunc = callback;
	return true;
};

VoiceRecognitionManager.openRecognition = function(callback)
{
	if(VoiceRecognitionManager.functionCheck(callback))
// 		cordova.exec(null, null, "VoiceRecognitionPlugin", "openRecognition");
		cordova.exec( null, null, "AppPlugin" , "voice", []);
};


