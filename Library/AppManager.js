
var AppManager = 
{
	//상수값
	SCREEN_ORIENTATION_LANDSCAPE 					:		0,
	SCREEN_ORIENTATION_PORTRAIT 					:		1,
	SCREEN_ORIENTATION_SENSOR						:		4,
	SCREEN_ORIENTATION_SENSOR_LANDSCAPE				:		6,
	SCREEN_ORIENTATION_REVERSE_LANDSCAPE 			: 		8,
	SCREEN_ORIENTATION_REVERSE_PORTRAIT 			:		9,
	
	//
	PROGRESS_SHOW : 1,	
	PROGRESS_HIDE : 0,
	
	IS_PROGRESS_SHOW : false,
	isHidePatchView : false,	//패치뷰 숨김 여부
	isShowProgress : false,
	
	TOUCH_DELAY_TIME: 300
	
};

//load notice
AppManager.loadWebView = function(ele, url)
{
    var docWidth = $(document).width();
    var docHeight = $(document).height();
    
    var leftRate = parseInt(ele.offset().left)/docWidth;
    var topRate = parseInt(ele.offset().top)/docHeight;
    var widthRate = ele.width()/docWidth;
    var heightRate = ele.height()/docHeight;
    
    var params = [leftRate,
                  topRate,
                  widthRate,
                  heightRate,
                  ele[0].id,
				  url
                  ];
				  
// afc.log("========================================");
// afc.log(JSON.stringify(params));
// afc.log("========================================");
// ChironStudio => [0.03125,0.09384775808133472,0.928125,0.8790406673618353,"MS0710--ContWebView"]

    
    cordova.exec( null , null, "AppPlugin" , "loadWebView", params);
};

//notice
AppManager.bringToFront = function(isFront)
{
	if(isFront){
		theApp.frmPage.view.show(AComponent.INVISIBLE);
	}else{
		theApp.frmPage.view.show(AComponent.VISIBLE);
	}	
    cordova.exec( null , null, "AppPlugin" , "bringToFront", [isFront]);
};

//close notice
AppManager.destroyWebView = function(ele)
{
    cordova.exec( null , null, "AppPlugin" , "destroyWebView", [ele[0].id]);
};

AppManager.sendEmail = function(mailAddr, mailTitle, mailContent)
{
    cordova.exec( null , null, "AppPlugin" , "sendEmail", [mailAddr, mailTitle, mailContent]);
};


AppManager.setPortrait = function(isPortrait)
{
	if(isPortrait)
		cordova.exec( null , null, "AppPlugin" , "setOrientation", [ AppManager.SCREEN_ORIENTATION_PORTRAIT ]);  
	else
		cordova.exec( null , null, "AppPlugin" , "setOrientation", [ AppManager.SCREEN_ORIENTATION_LANDSCAPE ]);  
};

AppManager.setOrientation = function(orientation)
{
	cordova.exec( null, null, "AppPlugin" , "setOrientation", [ orientation ]);
};

AppManager.deleteFile = function(path)
{
	cordova.exec( null, null, "AppPlugin" , "deleteFile", [path]);  
};

AppManager.kakaoLogin = function(callback)
{
	//cordova.exec( function(result){ callback('k', result); }, null, "AppPlugin" , "kakaoLogin", []);
};

AppManager.screenShoot = function(callback, filename)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "screenShoot", [filename]);
};

AppManager.callApp = function(schemaUrl, marketUrl)
{
	cordova.exec( null , null, "AppPlugin" , "callApp", [schemaUrl, marketUrl]);
};

AppManager.goDeepLink = function(schemaUrl, marketUrl)
{
	cordova.exec( null , null, "AppPlugin" , "goDeepLink", [schemaUrl, marketUrl]);
};

/*
AppManager.writeFile = function(data, path, file, callback)
{
	 if(afc.isAndroid) cordova.exec(null , null, "AppPlugin" , "writeFile", [data , path, file]);  	
};
*/

AppManager.addLog = function(txt)
{
	 if(afc.isAndroid) cordova.exec(null , null, "AppPlugin" , "addLog", [txt]);
};

AppManager.appAlert = function(alertInfo, callback)
{
	cordova.exec(function(result)
	{ 
		callback(parseInt(result, 10));
	}
	, null, "AppPlugin" , "appAlert", alertInfo);  	
};

AppManager.closeAppAlert = function(msg)
{
	if(afc.isAndroid) cordova.exec(null , null, "AppPlugin" , "closeAppAlert", [msg]);  	
};

AppManager.callApplication = function()
{
	if(afc.isAndroid) cordova.exec(null , null, "AppPlugin" , "callApplication", []);  	
};


AppManager.vibrator = function()
{
	cordova.exec( null , null, "AppPlugin" , "vibrator", []);  
};

AppManager.beep = function(volumn)
{
	cordova.exec( null , null, "AppPlugin" , "beep", [volumn]);  
};

AppManager.applyPref = function()
{
	cordova.exec( null , null, "AppPlugin" , "applyPref", []);  
};

AppManager.hidePatchView = function()
{
	AppManager.isHidePatchView = true;
	cordova.exec( null , null, "AppPlugin" , "hidePatchView", []);  
};

AppManager.setPref = function(key, val)
{
	cordova.exec( null , null, "AppPlugin" , "setPref", [key, val]);  
};

AppManager.getPref = function(key, callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "getPref", [key]);  
};

AppManager.clearPref = function(key)
{
	cordova.exec( null , null, "AppPlugin" , "clearPref", [key]);  
};

AppManager.getSystemInfo = function(callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "getSystemInfo", []);  
};

AppManager.getAppName = function(callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "getAppName", []);  
};

AppManager.getVersion = function(callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "getVersion", []);  
};

AppManager.goUrl = function(url, isClose)
{
	cordova.exec( null , null, "AppPlugin" , "goUrl", [url, isClose]);  
};

AppManager.goUrlWebView = function(url)
{
	cordova.exec( null , null, "AppPlugin" , "goUrlWebView", [url]);  
};

AppManager.showNotification = function(message)
{
	cordova.exec( null , null, "AppPlugin" , "showNotification", [message]);
};

AppManager.openPdf = function(url)
{
	cordova.exec( null , null, "AppPlugin" , "openPdf", [url]);  
};

AppManager.sendSMS = function(phone, msg)
{
	cordova.exec( null , null, "AppPlugin" , "sendSMS", [phone, msg]);  
};

AppManager.exitApp = function()
{
	cordova.exec( null , null, "AppPlugin" , "exitApp", []);  
};

AppManager.enableApp = function(isEnable)
{
	if(window.cordova)
		cordova.exec( null , null, "AppPlugin" , "enableApp", [isEnable]);  
};

AppManager.touchDelay = function()
{
	AppManager.enableApp(false);
	setTimeout(function() { AppManager.enableApp(true); }, AppManager.TOUCH_DELAY_TIME);
};

AppManager.screenshoot = function(callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "screenshoot", []);  
};

AppManager.getModelName = function(callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "getModelName", []);  
};

AppManager.getAppId = function(callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "getAppId", []);
};

AppManager.playAudio = function(url)
{
	cordova.exec( null , null, "AppPlugin" , "playAudio", [url]);  
};

AppManager.getPhoneInfo = function(callback)
{
	cordova.exec( function(result){ 
		var resultArray = result.split("/");
		result = {};
		result.noCode = resultArray[0];
		result.noName = resultArray[1];
		result.phoneNm = resultArray[2];
		callback(result);
	} , null, "AppPlugin" , "getPhoneInfo", []);  
};

AppManager.phoneCall = function(phoneNumber)
{
	var phoneStr = 'tel:'+phoneNumber;
	if(afc.isAndroid) AppManager.goUrl(phoneStr);
	else if(afc.isIos) window.location = phoneStr;
};

AppManager.getUuid = function(callback)
{
	cordova.exec( function(result)
	{
		callback(result);
	}, null, "AppPlugin" , "getUuid", []);
};

AppManager.getIpAddress = function(callback)
{
	cordova.exec( function(result)
	{
		var pblc_ip = result[0];
		var prvt_ip = result[1];
		callback(pblc_ip, prvt_ip);
	}, null, "AppPlugin" , "getIpAddress", []);
};

//only ios
AppManager.consoleLog = function(msg)
{
	if(window.cordova)
		cordova.exec( null , null, "AppPlugin" , "consoleLog", [msg]);
};

AppManager.downloadFile = function(url)
{
	cordova.exec( null , null, "AppPlugin" , "download", [url]);
};

AppManager.getImageBase64 = function(url, callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "getImageBase64", [url]);
};

AppManager.getResponseText = function(url, callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "getResponseText", [url]);
};

AppManager.openChrome = function(url)
{
	cordova.exec( null , null, "AppPlugin" , "openChrome", [url]);
};

AppManager.openChromeCustom = function(url)
{
	cordova.exec( null , null, "AppPlugin" , "openChromeCustom", [url]);
};


AppManager.wowEncode = function(str, callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "wowEncode", [str]);
};

AppManager.wowExEncode = function(str, callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "wowExEncode", [str]);
};

AppManager.wowDecode = function(str, callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "wowDecode", [str]);
};

AppManager.wowExDecode = function(str, callback)
{
	cordova.exec( function(result){ callback(result); } , null, "AppPlugin" , "wowExDecode", [str]);
};
//----------------------------------------------------------------------------------
//	Progress 관련
//

AppManager.prgRefCount = 0;
AppManager.isOltp = false;
AppManager.prgTimer = null;

AppManager.showProgress = function(sec)
{
	if(!AppManager.isHidePatchView) return;
	if(AppManager.isOltp) return;
	if(++AppManager.prgRefCount>1) return;
	
	if(!sec) sec = 60;
	//if(!sec) sec = 0;//default disable
	
	AppManager.isShowProgress = true;
	//cordova.exec( null , null, "AppPlugin" , "progress", [AppManager.PROGRESS_SHOW]);
	AIndicator.show();
	
	if(AppManager.prgTimer) 
	{
		clearTimeout(AppManager.prgTimer);
		AppManager.prgTimer = null;
	}
	
	//현재 사용하지 않음...QueryManager 에서 처리함.
	if(sec>0)
	{
		//프로그레스 제한시간 셋팅
		AppManager.prgTimer = setTimeout(function()
		{
			AppManager.prgTimer = null;
			AppManager.endOltp();
			
			//theApp.autoLoginProcess('통신 상태가 원활하지 않습니다.(3)', true);

		}, 1000*sec);
	}
};

AppManager.hideProgress = function()
{
	if(AppManager.isOltp || AppManager.prgRefCount==0) return;
	if(--AppManager.prgRefCount>0) return;

	if(AppManager.prgTimer) 
	{
		clearTimeout(AppManager.prgTimer);
		AppManager.prgTimer = null;
	}
	
	//cordova.exec( null , null, "AppPlugin" , "progress", [AppManager.PROGRESS_HIDE]);
	AIndicator.hide();
	AppManager.isShowProgress = false;
};

AppManager.beginOltp = function(sec)
{
	if(AppManager.isOltp) return;
	//oltp가 아니고 프로그레스가 더 있으면 무조건 제거
	if(AppManager.prgRefCount>0) AppManager.endOltp();
	
	AppManager.prgRefCount = 0;
	AppManager.showProgress(sec);
	AppManager.isOltp = true;
};

AppManager.endOltp = function()
{
	AppManager.isOltp = false;
	AppManager.prgRefCount = 1;
	AppManager.hideProgress();
};









