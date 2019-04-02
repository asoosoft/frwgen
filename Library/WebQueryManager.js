/**
 * @author asoocool
 */

function WebQueryManager(name)
{
	this.name = name;			//매니저를 구분 짓는 이름
	
	this.queryListeners = [];	//IO 이벤트를 수신할 객체들을 모아둔 배열
	
	this.errorData = 
	{
		trName: '',
		errCode: '',	//메시지코드/오류코드
		errMsg: ''		//에러 메시지
	};
	
	this.isShowProgress = true;
	this.timeoutSec = 30; //zero is unlimit
	
	//this.baseUrl = 'http://localhost:8182/';
	//this.baseUrl = 'http://www.iljimae.net/test.php?';
	//this.baseUrl = 'http://175.197.118.64:5879/';
	
	//this.baseUrl = 'https://www.miraeassetdaewoo.com/test/ap.jsp';//?apGubn=
	//this.baseUrl = 'http://tour.privateguide.co.kr/json/asset';
	//this.baseUrl = 'http://rev.privateguide.co.kr/json/asset';
	
	this.baseUrl = '';
	this.reqType = 'POST';
	
}

WebQueryManager.prototype.setBaseUrl = function(baseUrl)
{
	this.baseUrl = baseUrl;
};


WebQueryManager.prototype.setRequestType = function(reqType)
{
	this.reqType = reqType;
};


WebQueryManager.prototype.showProgress = function(isShow)
{
	this.isShowProgress = isShow;
};

//second
WebQueryManager.prototype.setTimeout = function(timeoutSec)
{
	this.timeoutSec = timeoutSec;
};

WebQueryManager.prototype.getLastError = function(key)
{
	if(key) return this.errorData[key];
	else return this.errorData;
};

WebQueryManager.prototype.printLastError = function(key)
{
	if(key) return _afc.log(key + ':' + this.errorData[key]);
	else return _afc.log(JSON.stringify(this.errorData, undefined, 2));
};

//---------------------------------------------------------
//	listener functions
//	function afterRecvBufferData(abuffer, packetSize, trName);	* 수신버퍼에 데이터를 수신한 후 바로 호출된다.
//	function afterOutBlockData(queryData, groupName, trName);	* 수신된 데이터를 AQueryData 에 채운 후 호출된다.
//	function beforeInBlockBuffer(queryData, groupName);			* 전송버퍼에 데이터를 채우기 전에 호출된다.
//	function beforeSendBufferData(abuffer, packetSize, trName);	* 전송버퍼의 데이터를 전송하기 바로 전에 호출된다.

//화면 아이디  기준
WebQueryManager.prototype.addQueryListener = function(listener)//function(name, listener)
{
	//this.queryListeners[name] = listener;
	
	for(var i=0; i<this.queryListeners.length; i++)
		if(this.queryListeners[i]===listener) return;
	
	this.queryListeners.push(listener);
};

WebQueryManager.prototype.removeQueryListener = function(listener)//function(name)
{
	for(var i=0; i<this.queryListeners.length; i++)
	{
		if(this.queryListeners[i]===listener)
		{
			this.queryListeners.splice(i, 1);
			return;
		}
	}
};

//
WebQueryManager.prototype.queryProcess = function(retData, aquery, menuNo, groupName, afterOutBlockData)
{
	var	trName = aquery.getName(),
		listener, i, qLen = this.queryListeners.length,
		queryData = null, errArr;

	//-------------------------------------	
	//	for debug
	//console.log('in queryProcess Body Buffer ----------------------------- ');
	//this.rcvBuf.printBySize([dataSize-SZ_HEADER], SZ_HEADER);

	queryData = new AQueryData(aquery);
	
	this.errorData.trName = trName;
	errArr = queryData.outBlockData_AJAX(retData);
	this.errorData.errCode = errArr[0];
	this.errorData.errMsg = errArr[1];
	
	//수신된 데이터를 AQueryData 에 채운 후 호출된다.
	
	if(afterOutBlockData) afterOutBlockData.call(this, queryData);
	
	//######## afterOutBlockData
	for(i=0; i<qLen; i++)
	{
		listener = this.queryListeners[i];
		if(!listener) continue;
		
		if(listener.afterOutBlockData) listener.afterOutBlockData(queryData, groupName, trName, this);
	}
	//########

	//afterOutBlockData 함수에서 enableLazyUpdate 함수를 호출하면 화면 업데이트를 비동기 함수 호출후에 할 수 있다.
	//차후 비동기 함수 콜백에서 queryData.lazyUpdate(); 함수를 호출해 준다.
		
	if(queryData.isLazyUpdate) queryData.lazyUpdate = _updateFunc;
	else _updateFunc();
	
	//-----
	
	function _updateFunc()
	{
		var compArray = aquery.getQueryComps(menuNo, 'output');
		if(compArray)
		{
			var qryComp;
			for(var i=0; i<compArray.length; i++)
			{
				qryComp = compArray[i];

				//if(qryComp.isShow() && qryComp.$ele.is(':hidden')) continue;

				//비활성화된 탭은 적용되지 않도록
				var tab = qryComp.getRootView().tab;
				if(tab && $(tab.content).is(':hidden')) continue;

				//groupName 을 지정해 줬으면 같은 그룹네임인지 비교
				if( groupName!='' && groupName!=qryComp.getGroupName() ) continue;

				qryComp.updateComponent(queryData);
			}
		}
	}	
	
	
//##########################################	
	if(this.isShowProgress) AppManager.hideProgress();
//##########################################
	
};

WebQueryManager.prototype.sendProcessByComp = function(acomp, groupName, beforeInBlockBuffer, afterOutBlockData)
{
	var menuNo = acomp.getContainerId(),ret = [];

	for(var queryName in acomp.dataKeyMap)
		ret.push(this.sendProcess(AQuery.getQuery(queryName), menuNo, groupName, beforeInBlockBuffer, afterOutBlockData));
	
	return ret;
};

WebQueryManager.prototype.sendProcessByComps = function(acomps, groupName, beforeInBlockBuffer, afterOutBlockData)
{
	var acomp, menuNo, queryName, ret = [];
	for(var i=0; i<acomps.length; i++)
	{
		acomp = acomps[i];
		menuNo = acomp.getContainerId();
		
		for(queryName in acomp.dataKeyMap)
			ret.push(this.sendProcess(AQuery.getQuery(queryName), menuNo, groupName, beforeInBlockBuffer, afterOutBlockData));
	}
	
	return ret;
};

WebQueryManager.prototype.sendProcessByName = function(queryName, menuNo, groupName, beforeInBlockBuffer, afterOutBlockData)
{
	return [this.sendProcess(AQuery.getSafeQuery(queryName), menuNo, groupName, beforeInBlockBuffer, afterOutBlockData)];
};

WebQueryManager.prototype.sendProcessByNames = function(queryNames, menuNo, groupName, beforeInBlockBuffer, afterOutBlockData)
{
	var ret = [];
	
	for(var i=0; i<queryNames.length; i++)
		ret.push(this.sendProcess(AQuery.getSafeQuery(queryNames[i]), menuNo, groupName, beforeInBlockBuffer, afterOutBlockData));

	return ret;
};

WebQueryManager.prototype.sendProcess = function(aquery, menuNo, groupName, beforeInBlockBuffer, afterOutBlockData)
{
//############################################
	if(this.isShowProgress) AppManager.showProgress();
//############################################

	var qryName = aquery.getName(),
		queryData = new AQueryData(aquery);
		
	queryData.inBlockPrepare();

	var qryComp, compArray = aquery.getQueryComps(menuNo, 'input');
	
	if(compArray)
	{
		for(var i=0; i<compArray.length; i++)
		{
			qryComp = compArray[i];
			
			//비활성화된 탭은 적용되지 않도록
			var tab = qryComp.getRootView().tab;
			if(tab && $(tab.content).is(':hidden')) continue;
			
			qryComp.updateQueryData(queryData);
		}
	}
	

	var listener, i, qLen = this.queryListeners.length;

	//전송버퍼에 데이터를 채우기 전에 호출된다.
	//######## beforeInBlockBuffer
	
	if(beforeInBlockBuffer) beforeInBlockBuffer.call(this, queryData);
	
	for(i=0; i<qLen; i++)
	{
		listener = this.queryListeners[i];
		if(listener.beforeInBlockBuffer) listener.beforeInBlockBuffer(queryData, groupName, this);
	}
	
	//########
	
	var thisObj = this, url = this.baseUrl + qryName;	//rainbow
	var param = queryData.inBlockBuffer_AJAX(this.reqType);
		
	if(this.reqType=='GET') url = url + '?' + param;
		
		//url = encodeURIComponent(url);
	
	
	//--------------------------------------------
	//	데이터를 전송한다.
	
	//_afc.log(param);
	
	jQuery.ajax(
	{
		type:this.reqType, url: url, dataType:'text', 
		data: param,	timeout: this.timeoutSec*5000,
		
		success: function(retData) 
		{
			thisObj.queryProcess(retData, aquery, menuNo, groupName, afterOutBlockData);
		},
		
		error:function(xhr,status,error)
		{
			//timeout
    		alert( _afc.log("code:"+xhr.status+"\n"+"message:"+xhr.responseText+"\n"+"error:"+error) );
			
			//xhr.status --> "timeout", "error", "abort", "parsererror"
			//or xhr.statusText 확인해 보기
			
			thisObj.onTimeout(qryName, menuNo, groupName, afterOutBlockData);
   		}
	});
};

WebQueryManager.prototype.onSendFail = function()
{
	if(this.isStart())
	{
		AppManager.endOltp();
		
		//theApp.autoLoginProcess('통신 상태가 원활하지 않습니다.(2) : '+this.errorData.trName, true);
	}
};


WebQueryManager.prototype.onTimeout = function(qryName, menuNo, groupName, afterOutBlockData)
{
	if(this.isShowProgress) AppManager.hideProgress();

	this.errorData.trName = qryName;
	this.errorData.errCode = 10001;
	//this.errorData.errMsg = '서버와의 접속이 지연되고 있습니다.';
	this.errorData.errMsg = '통신 상태가 원활하지 않습니다.(1) : ' + qryName + ',' + menuNo;

	//타임아웃
	if(afterOutBlockData) afterOutBlockData.call(this, null);

	var qLen = this.queryListeners.length, i, listener;
	for(i=0; i<qLen; i++)
	{
		listener = this.queryListeners[i];
		if(listener.afterOutBlockData) listener.afterOutBlockData(null, groupName, qryName, this);
	}
};









