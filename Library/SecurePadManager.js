/**
 * @author kyo
 */

//----------------------------------------------------------------------------------------------------
//보안키패드
//----------------------------------------------------------------------------------------------------

var SecurePadManager = {};

SecurePadManager.callbackFunc = null;
SecurePadManager.padWorkDone = function(code, data, len)
{
	SecurePadManager.callbackFunc(code, data, len);
	SecurePadManager.callbackFunc = null;
};

SecurePadManager.functionCheck = function(callback)
{
	if(SecurePadManager.callbackFunc) 
		SecurePadManager.callbackFunc(0);
		
	SecurePadManager.callbackFunc = callback;
	return true;
};

//--------------------------------------------------------------------------------
//	패드 띄우기
//	@function getDeviceId(Object option, Function);
/*  option = 
	{
		title: '비밀번호 입력', 	//키패드 타이틀
		padType: 'alpha_l', 	//키패드 타입('alpha_u'/'alpha_l'/'number') 
		inputType: 'pwd',		//텍스트 표시형태
		maxLength: 20,			//max 길이
		minLength: 4			//min 길이
	}
*/ 
//	callback(int code, String data);
SecurePadManager.openPad = function( option, callback)
{
	if(!_afc.isIos) theApp.offLifeCycle = true;
	if(SecurePadManager.functionCheck(callback))
		cordova.exec(null, null, "SecurePadPlugin", "openPad", [option]);
};

//--------------------------------------------------------------------------------
//	보안키 셋팅
//	@function setSecureKey(String secureKey); 
SecurePadManager.setSecureKey = function(secureKey)
{
	cordova.exec(null, null, "SecurePadPlugin", "setSecureKey", [secureKey]);
};

//--------------------------------------------------------------------------------
//	이전에 평문값을 리턴했으나 E2E적용후 암호화된 값을 그대로 리턴하는 것으로 변경
//	평문값을 얻으려면 SecurePadManager.cipherToPlain 함수 사용

//SecurePadManager.cipherToText = function(cipherData, callback)
SecurePadManager.cipherToText = function(cipherData, checkObj, callback)
{
	//checkObj : svcId, accNo
	
	if(_afc.isSimulator) cipherData = '0423';
	
	//rms test
	
	//회원사가 LIG 이고 RMS 관련 서비스인지 
/*
	else if(theApp.systemInfo.fno=='072' && AccNetManager.RMSACC[checkObj.svcId])
	{
		var accObj = theApp.accInfo.getAccData(checkObj.accNo);

		//약정 코드값이 셋팅된 계좌만....
		if(accObj['D1약정구분']!='0')
		{
			SecurePadManager.cipherToPlain(cipherData, callback);

			return;
		}
	}
*/		
	
	//입력된 값을 그대로 리턴
	callback(cipherData);
};

//--------------------------------------------------------------------------------
//	평문값 가져오기
//	@function setSecureKey(String secureKey); 
SecurePadManager.cipherToPlain = function(cipherData, callback)
{
	if(!cipherData) cipherData = '';
	cordova.exec(callback, null, "SecurePadPlugin", "cipherToText", [cipherData]);
};







