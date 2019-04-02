/**
 * @author 
 */

var DeviceManager = {};

//--------------------------------------------------------------------------------
//	유니크한 디바이스값 가져오기
//	@function getDeviceUniqueId(Function, boolean isHex); 
//	callback(String data);
DeviceManager.getDeviceUniqueId = function(callback, isHex)
{
	cordova.exec(callback, null, "DevicePlugin", "getDeviceUniqueId", [isHex]);
};

//--------------------------------------------------------------------------------
//	시리얼넘버 가져오기
//	@function getSerialNo(Function, boolean isHex); 
//	callback(String data);
DeviceManager.getSerialNo = function(callback, isHex)
{
	cordova.exec(callback, null, "DevicePlugin", "getSerialNo", [isHex]);
};

//--------------------------------------------------------------------------------
//	안드로이드 아이디 가져오기
//	@function getDeviceId(Function, boolean isHex); 
//	callback(String data);
DeviceManager.getDeviceId = function(callback, isHex)
{
	cordova.exec(callback, null, "DevicePlugin", "getDeviceId", [isHex]);
};

//--------------------------------------------------------------------------------
//	IMEI 가져오기
//	@function getIMEI(Function, boolean isHex); 
//	callback(String data);
DeviceManager.getIMEI = function(callback, isHex)
{
	cordova.exec(callback, null, "DevicePlugin", "getIMEI", [isHex]);
};

//--------------------------------------------------------------------------------
//	IMSI 가져오기
//	@function getIMSI(Function, boolean isHex); 
//	callback(String data);
DeviceManager.getIMSI = function(callback, isHex)
{
	cordova.exec(callback, null, "DevicePlugin", "getIMSI", [isHex]);
};

//--------------------------------------------------------------------------------
//	유심시리얼넘버 가져오기
//	@function getSimSerialNo(Function, boolean isHex); 
//	callback(String data);
DeviceManager.getSimSerialNo = function(callback, isHex)
{
	cordova.exec(callback, null, "DevicePlugin", "getSimSerialNo", [isHex]);
};

//--------------------------------------------------------------------------------
//	폰넘버 가져오기
//	@function getSimSerialNo(Function, boolean isHex); 
//	callback(String data);
DeviceManager.getPhoneNo = function(callback, isHex)
{
	cordova.exec(callback, null, "DevicePlugin", "getPhoneNo", [isHex]);
};

//--------------------------------------------------------------------------------
//	와이파이맥번호 가져오기
//	@function getWifiMac(Function, boolean isHex); 
//	callback(String data);
DeviceManager.getWifiMac = function(callback, isHex)
{
	cordova.exec(callback, null, "DevicePlugin", "getWifiMac", [isHex]);
};