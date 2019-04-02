/**
 * @author asoocool
 */

function SoriIo(listener)
{
	NetworkIO.call(this, listener);
	
	SoriIo.recentManager = this;
}
afc.extendsClass(SoriIo, NetworkIO);
	
SoriIo.recentManager = null;
SoriIo.nativeCallbacks = {};

// CS에서 Web으로 보내는 전문 정보 수신 함수
function putDataToWeb(head, body, rb, nPrevNext)
{
// 	alert('##'+rb+'##\n\n##'+nPrevNext+'##\n\n##'+head+'##\n\n##'+body+'##');
	
	if(rb)
	{
		try { rb = JSON.parse(rb); }
		catch(e) { alert(e); return; }
	}

	SoriIo.recentManager.onReceived(head+body, rb, nPrevNext);
};

// CS에서 Web으로 보내는 정보 수신 함수
function setDataToWeb(type, data)
{
	if(type == 'CLOSE_DLG')
	{
		var screenId = data.split(':')[0];
		var view = SoriIo.nativeCallbacks[screenId];
		delete SoriIo.nativeCallbacks[screenId];
		if(view)
		{
			if(view.onClosedMapsDlg) view.onClosedMapsDlg(screenId);
			else alert('DLG 호출한 화면에 onClosedMapsDlg 함수가 정의되어있지 않습니다.');
		}
		else
		{
			alert('DLG 호출한 화면이 없습니다. SetMapsData("OPEN_DLG", "dlg_name", view객체) 형태로 호출해주세요.');
		}
	}
	else if(type == 'MAPS:GETVAL=')
	{
		var arr = data.split(';'), val, obj = {};
		for(var i=0; i<arr.length; i++)
		{
			val = arr[i].split('^');
			obj[val[0]] = val[1];
		}
		
		SoriIo.nativeCallbacks[type](obj);
		delete SoriIo.nativeCallbacks[type];
	}
	else
	{
		if(theApp.setDataToWeb) theApp.setDataToWeb(type, data);
	}
};

// IE 소리마치에 데이터를 2KB 이상 보내지 못하기 떄문에 소리마치에서 직접 가져가는 함수
function getDataToWeb(packetId)
{
	if(packetId == undefined) return;

	var retStr = SoriIo.nativeCallbacks[packetId];
	delete SoriIo.nativeCallbacks[packetId];
	return retStr;
};

/*
*	RQ_CALL, RQ_INIT : 쿼리 전송시 사용합니다.
*	NOR_MSG : 일반 라인메시지 표현 SetMapsData('NOR_MSG', '일반 라인메시지입니다');
*	ERR_MSG : 에러 라인메시지 표현 SetMapsData('ERR_MSG', '에러 라인메시지입니다');
*	OPEN_MAP : 화면을 오픈하는 함수 SetMapsData('OPEN_MAP', '8902'); SetMapsData('OPEN_MAP', '89024');
*	OPEN_DLG : 팝업을 오픈하는 함수 SetMapsData('OPEN_DLG', 'cba9500p0:사원정보:2:사원정보를 조회합니다.', this)
*	 - 화면 번호:대화상자 타이틀:화면 표시 방법:설명기술
		화면표시방법
		0 : 호출시 마우스 위치 윈도우 하단
		1 : 호출시 마우스 위치 윈도우 하단 타이틀 바 없이 표시
		2 : 메인 화면 중앙
		3 : 호출 화면 중앙
		4 : 호출 컨트롤의 아래 타이틀 바 없이 모달리스
		5 : 원하는 위치에 타이틀 바 없이 모달리스
*	 - CS BeforeNavigate 함수에서 szFlag 가 OPEN_DLG 인 경우 szValue(화면명) 팝업을 오픈해줘야 합니다.
*	 - CS 팝업오픈 후 web.SetDataToWeb( 201, "CLOSED_DLG", szValue ) 를 호출해주거나,
       CS DialogClose 함수에서 web.SetDataToWeb( 201, "CLOSED_DLG", strScreenID ) 를 호출해줘야 합니다.
*	 - 웹 OPEN_DLG를 호출한 화면에 onClosedMapsDlg(screenId) 함수를 정의하여 수신 후 작업을 합니다.
*	SETVAL : CS의 공유메모리에 데이터를 세팅합니다. SetMapsData('SETVAL', 'USER_ID^s1212310;CODE^j123456');
*	GETVAL : CS의 공유메모리의 데이터를 가져옵니다. SetMapsData('GETVAL', 'USER_ID;CODE;USER_NAME');
*	CODE, ACCOUNT_NO, USER_ID, USER_NAME, CUSTUMER_ID,
*/
// 소리마치에 데이터를 전달하는 함수
function SetMapsData(name, value)	// view : name이 OPEN_DLG 인 경우 넣는 view객체
{
	// 소리마치 팝업 오픈인 경우 오픈할 팝업명으로 View 객체 저장
	if(name == 'OPEN_DLG') SoriIo.nativeCallbacks[value.split(':')[0]] = arguments[2];

	var str = 'MAPS:' + name + '=' + value;
	
	if(afc.isIE)
	{
		if(name == 'RQ_CALL' && str.length > 2047)
		{
			SoriIo.nativeCallbacks[packetId] = str;
			str = 'MAPS:POST_DATA='+packetId;
		}
		location.href = str;
	}
	else
	{
		window.exec(null, null, 'AppPlugin', 'SendMapsFromChrome', [str]);
	}
}

// 소리마치 시스템정보를 얻어오는 함수
// keyArr : 얻어오고 싶은 공유메모리의 정보배열
//  Array  - ['USER_ID', 'BLNG_ORZ_CD', 'BLNG_ORZ_NM']
function GetMapsData(keyArr, callback)
{
	var key = keyArr.join(';');
	if(afc.isIE)
	{
		SoriIo.sorimachiListener['MAPS:GETVAL='] = callback;
		SetMapsData('GETVAL', key);
	}
	else
	{
		window.exec(function(data)
		{
			var arr = data.split(';'), val, obj = {};
			for(var i=0; i<arr.length; i++)
			{
				val = arr[i].split('^');
				obj[val[0]] = val[1];
			}
			callback(obj);
		}, null, 'AppPlugin', 'getMapsData', [key]);
	}
}

SoriIo.sorimachiListener = {};
SoriIo.setSorimachiListener = function(key, listener)
{
	if(!SoriIo.sorimachiListener[key]) SoriIo.sorimachiListener[key] = [];
	SoriIo.sorimachiListener[key].push(listener);
};

//############################################################################################################################################

SoriIo.prototype.isStart = function()
{
	return true;
};

SoriIo.prototype.sorimachiSend = function(obj)
{
	//--------------------------------------------
	//	데이터를 전송한다.
	var rbObj = {
		packetId: obj.packetId,
		menuNo: obj.menuNo,
		trName: obj.trName,
		groupName: obj.groupName
	};
	var queryData = obj.queryData;
	
	var sndObj = {
		body: obj.sndBuf.getString(SZ_SND_TMAX_HEADER, obj.sendLen, true),
		biz_sys_tcd: queryData.headerInfo.biz_sys_tcd,
		biz_sys_seq: queryData.headerInfo.biz_sys_seq,
		svc_id: obj.trName,
		scrn_oprt_tcd: queryData.headerInfo.scrn_oprt_tcd,
		ac_pwd_skip_yn: queryData.headerInfo.ac_pwd_skip_yn,
		media: queryData.headerInfo.media,
		rb: JSON.stringify(rbObj)
	};
	
	var sndStr = '';			//var sndStr = 'MAPS:RQ_CALL=';
	for(var key in sndObj)
		sndStr += key + '^' + sndObj[key] + '[$]';
	
	SetMapsData('RQ_CALL', sndStr);
	//window.exec(null, null, 'AppPlugin', 'SendMapsFromChrome', [sndStr]);
};

SoriIo.prototype.sendData = function(data, callback)
{
};

SoriIo.prototype.onReceived = function(data, rb, nPrevNext)
{
	if(this.listener) this.listener.onReceived(data, rb, nPrevNext);
};

