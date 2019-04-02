/**
 * @author kyo
 */
var SNSManager = {};

/*

 - SNS 인증 플로우
1. SNSManager.js - RESTAPI 방식으로 각 SNS별 인증 API 호출
2. 호출된 SNS서버에서 지정된 redirect_url호출 
    => a. 각 SNS별 설정 페이지에서 설정 
       b. 인증 API호출 시 param
       c. AccessToken 요청 HTTP 통신 시 param
3. 피호출된 redirect_url은 App Native단을 scheme호출
    => CordovaApp.java의 onNewIntent(Intent intent)가 피호출후 
	받은 데이터를 javascript단(SNSManager.loginResult)으로 넘김
4. AccessToken을 요청하는 HTTP 통신후 결과값(AccessToken) 수신 (SNSManager.loginResult)
5. javascript단에서 해당 결과 값 확인 후 SNS 로그인 처리

- redirect_url 변경 시 업데이트 해야 할 부분
1. 각 SNS별 설정 페이지에서 설정 
   (https://apps.twitter.com, https://developers.facebook.com/apps/, https://developers.kakao.com/apps/)
2. 인증 API호출 시 param
   (SNSManager.js)
3. AccessToken 요청 HTTP 통신 시 param (카톡, 페이스북)
   (SNSManager.js > SNSManager.loginResult)
4. 페이스북 공유 API호출 시
   (MS0701_W06.cls onFShareBtnClick())
   
- SNS 개발자 계정
  (gmail, 카카오톡, 페이스북, 트위터 동일)
  id : koscom.sns@gmail.com (트위터는 최대 3개라서 koscom.sns2@gmail.com 계정추가)
  pw : 1q3e5t&U

*/

SNSManager.callback = null;
SNSManager.facebook_access_token = null;
SNSManager.kakao_access_token = null;
SNSManager.twitter_oauth_token = null;
SNSManager.twitter_oauth_token_secret = null;

SNSManager.kakaotalkLogin = function(ele, callback)
{

	if(SNSManager.callback) SNSManager.callback = null;
	SNSManager.callback = callback;
	
	//아이폰은 애플 정책상 내부 웹뷰로 띄움	
	if(_afc.isIos)
	{
	
		AppManager.loadWebView(ele, 'https://kauth.kakao.com/oauth/authorize?'
			+ 'client_id=' + theApp.systemInfo.get('FirmSNSInfo').kakao_client_id
			+ '&redirect_uri=' + Define.SNS_SERVER_URL + Define.SNS_REDIRECT_PATH_KT
			+ '&response_type=code');
	}
	else
	{
		theApp.offLifeCycle = true;
		AppManager.goUrlWebView(
			'https://kauth.kakao.com/oauth/authorize?'
			+ 'client_id=' + theApp.systemInfo.get('FirmSNSInfo').kakao_client_id
			+ '&redirect_uri=' + Define.SNS_SERVER_URL + Define.SNS_REDIRECT_PATH_KT
			+ '&response_type=code');
	
	}
};

SNSManager.facebookLogin = function(ele, callback)
{

	if(SNSManager.callback) SNSManager.callback = null;
	SNSManager.callback = callback;
	
	//아이폰은 애플 정책상 내부 웹뷰로 띄움
	if(_afc.isIos)
	{
		AppManager.loadWebView(ele, 'https://www.facebook.com/dialog/oauth?'
			+ 'client_id=' + theApp.systemInfo.get('FirmSNSInfo').facebook_client_id
			+ '&response_type=code'
			+ '&redirect_uri=' + Define.SNS_SERVER_URL + Define.SNS_REDIRECT_PATH_FB);
	}
	else
	{
		theApp.offLifeCycle = true;
		AppManager.goUrlWebView('https://www.facebook.com/dialog/oauth?'
			+ 'client_id=' + theApp.systemInfo.get('FirmSNSInfo').facebook_client_id
			+ '&response_type=code'
			+ '&redirect_uri=' + Define.SNS_SERVER_URL + Define.SNS_REDIRECT_PATH_FB);
	}
	
};

SNSManager.twitterLogin = function(ele, callback)
{
	if(SNSManager.callback) SNSManager.callback = null;
	SNSManager.callback = callback;
	
	AppManager.showProgress();
	
	var cb = new Codebird();
	
	cb.setConsumerKey(theApp.systemInfo.get('FirmSNSInfo').twitter_consumer_key, theApp.systemInfo.get('FirmSNSInfo').twitter_consumer_secret);

		// gets a request token
    cb.__call(
        "oauth_requestToken",
        {oauth_callback: Define.SNS_SERVER_URL + Define.SNS_REDIRECT_PATH_TW},
        function (reply) {
//			console.log("##### " + JSON.stringify(reply) );

			if(reply.httpstatus == '200')
			{
				// stores it
				cb.setToken(reply.oauth_token, reply.oauth_token_secret);
				// gets the authorize screen URL
				cb.__call(
					"oauth_authorize",
					{},
					function (auth_url) {
					
						//아이폰은 애플 정책상 내부 웹뷰로 띄움
						if(_afc.isIos)
						{
							AppManager.loadWebView(ele, auth_url);
						}
						else
						{
							theApp.offLifeCycle = true;
							AppManager.goUrlWebView(auth_url);
						}
						AppManager.hideProgress();
					}
				);
			}
			else
			{
				_AToast.show('트위터 로그인에 실패하였습니다');
				AppManager.hideProgress();
			}
        }
    );
};

SNSManager.loginResult = function(div, resultData)
{
	_AIndicator.show();
	if(SNSManager.callback) 
	{

		var auth_url = null;
		var type = null;
		var params = null;

		switch(div)
		{
			case 'k':
				auth_url = "https://kauth.kakao.com/oauth/token";
				type = "POST";
				var client_id = theApp.systemInfo.get('FirmSNSInfo').kakao_client_id;
				var redirect_uri = Define.SNS_SERVER_URL + Define.SNS_REDIRECT_PATH_KT;
				params = "grant_type=authorization_code" + "&client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&code=" + resultData;
				break;
			case 't':
				auth_url = "https://api.twitter.com/oauth/access_token";
				type = "POST";
				var oauth_token = SNSManager.getParameter(resultData, 'oauth_token');
				var oauth_verifier = SNSManager.getParameter(resultData, 'oauth_verifier');
				params = "oauth_token=" + oauth_token + "&oauth_verifier=" + oauth_verifier;
				break;
			case 'f':
				auth_url = "https://graph.facebook.com/oauth/access_token";
				type = "GET";
				var client_id = theApp.systemInfo.get('FirmSNSInfo').facebook_client_id;
				var redirect_uri = Define.SNS_SERVER_URL + Define.SNS_REDIRECT_PATH_FB;
				var client_secret = theApp.systemInfo.get('FirmSNSInfo').facebook_client_secret;
				params = "client_id=" + client_id
						+ "&redirect_uri=" + redirect_uri
						+ "&client_secret=" + client_secret
						+ "&code=" + resultData;
				break;
		}

		if(auth_url != null && type != null && params != null){
			$.ajax({
				url: auth_url,
				type:type,
				dataType:"text",
				data:params,
				async: true,
			}).done(function(data){
				_AIndicator.hide();
				SNSManager.callback(div, data);
				SNSManager.callback = null;
			}).fail(function(data){
				_AIndicator.hide();
				SNSManager.callback(div, null);
				SNSManager.callback = null;
			});
		}else{
			_AIndicator.hide();
			SNSManager.callback(div, null);
			SNSManager.callback = null;
		}

	}
};

SNSManager.getParameter = function(query, param)
{
	var returnValue;
	var parameters = query.split('&');
	for (var i = 0; i < parameters.length; i++) {
		var varName = parameters[i].split('=')[0];
		if (varName.toUpperCase() == param.toUpperCase()) {
			returnValue = parameters[i].split('=')[1];

			return decodeURIComponent(returnValue);
		}
	}

}