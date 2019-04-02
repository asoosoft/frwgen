/**
 * @author asoocool
 */

function QueryManager(name)
{
	this.name = name;			//매니저를 구분 짓는 이름
	this.netIo = null;			//io 전송 방식에 따른 객체 저장
	
	this.sndBuf = null;			//전송용 ABuffer 객체
	this.rcvBuf = null;			//수신용 ABuffer 객체
	this.queryListeners = [];	//IO 이벤트를 수신할 객체들을 모아둔 배열
	this.realComps = {};		//리얼 데이터를 수신할 컴포넌트 모음

	//초기화	
	this.headerInfo = null;
	this.setHeaderInfo();
	
	this.errorData = 
	{
		trName: '',
		errCode: '',	//메시지코드/오류코드
		errMsg: ''		//에러 메시지
	};

	//수신 패킷 정보
	this.packetInfo = 
	{
		packetType: 0,
		packetId: 0, 
		menuNo: '', 
		groupName: '', 
		trName: ''
	};
	
	//전송 패킷 정보
	this.sendInfo = 
	{
		packetType: 0,
		packetId: 0, 
		menuNo: '', 
		groupName: '', 
		trName: ''
	};
	
	
	this.publicKey = null;
	this.sessionKey = null;
	
	this.packetId = 0;
	
	this.isShowProgress = true;
	this.timeoutSec = 15; //zero is unlimit
	
	this.errCodeMap = {};
	this.queryCallbacks = {};
	this.realProcMap = {};
	//this.realCallbacks = {};
}

QueryManager.prototype.startManager = function(address, port)
{
	if(this.netIo) this.netIo.startIO(address, port);
};

QueryManager.prototype.stopManager = function()
{
	if(this.netIo) this.netIo.stopIO();
};

QueryManager.prototype.setNetworkIo = function(netIo)
{
	this.netIo = netIo;
};

QueryManager.prototype.setQueryCallback = function(key, callback)
{
	this.queryCallbacks[key] = callback;
};

QueryManager.prototype.getQueryCallback = function(key)
{
	var callback = this.queryCallbacks[key];
	if(callback) 
	{
		if(callback.timeout) 
		{
			clearTimeout(callback.timeout);
			callback.timeout = null;
		}
	
		if(!callback.noDelete) delete this.queryCallbacks[key];
	}
	
	return callback;
};

QueryManager.prototype.clearAllQueryCallback = function()
{
	var callback, key;
	for(key in this.queryCallbacks)
	{
		callback = this.queryCallbacks[key];
		
		if(callback.timeout) 
		{
			clearTimeout(callback.timeout);
			callback.timeout = null;
		}
	}

	this.queryCallbacks = {};
};

QueryManager.prototype.setQueryBuffer = function(sendSize, recvSize, charSet, emptyChar, emptyNumChar)
{
	this.sndBuf = new ABuffer(sendSize);
	this.sndBuf.setCharset(charSet);
	
	this.rcvBuf = new ABuffer(recvSize);
	this.rcvBuf.setCharset(charSet);
	
	if(emptyChar!=undefined && emptyChar!=null)  
	{
		this.sndBuf.setEmptyChar(emptyChar);
		this.rcvBuf.setEmptyChar(emptyChar);
	}
	
	if(emptyNumChar!=undefined && emptyNumChar!=null) 
	{
		this.sndBuf.setEmptyNumChar(emptyNumChar);
		this.rcvBuf.setEmptyNumChar(emptyNumChar);
	}
};

QueryManager.prototype.showProgress = function(isShow)
{
	this.isShowProgress = isShow;
};


//second
QueryManager.prototype.setTimeout = function(timeoutSec)
{
	this.timeoutSec = timeoutSec;
};

QueryManager.prototype.getLastError = function(key)
{
	if(key) return this.errorData[key];
	else return this.errorData;
};

QueryManager.prototype.getLastPacketInfo = function(key)
{
	if(key) return this.packetInfo[key];
	else return this.packetInfo;
};

QueryManager.prototype.printLastError = function(key)
{
	if(key) return afc.log(key + ':' + this.errorData[key]);
	else return afc.log(JSON.stringify(this.errorData, undefined, 2));
};

//---------------------------------------------------------
//	listener functions
//	function afterRecvBufferData(QueryManager);				* 수신버퍼에 데이터를 수신한 후 바로 호출된다.
//	function afterOutBlockData(queryData, QueryManager);	* 수신된 데이터를 AQueryData 에 채운 후 호출된다.
//	function beforeInBlockBuffer(queryData, groupName);		* 전송버퍼에 데이터를 채우기 전에 호출된다.
//	function beforeSendBufferData(QueryManager);			* 전송버퍼의 데이터를 전송하기 바로 전에 호출된다.

//화면 아이디  기준
QueryManager.prototype.addQueryListener = function(listener)//function(name, listener)
{
	for(var i=0; i<this.queryListeners.length; i++)
		if(this.queryListeners[i]===listener) return;
	
	this.queryListeners.push(listener);
};

QueryManager.prototype.removeQueryListener = function(listener)//function(name)
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

//리얼 수신용 컴포넌트 등록
QueryManager.prototype.addRealComp = function(dataKey, comp)
{
	var array = this.realComps[dataKey];
	if(!array) array = this.realComps[dataKey] = [];
	
	for(var i=0; i<array.length; i++)
	{
		if(array[i]===comp) return -1;
	}
	
	//if(!comp.realDataKeyArr) comp.realDataKeyArr = [];
	
	//자신이 속한 리얼에 대한 dataKey 값들을 저장해 둔다.
	//comp.realDataKeyArr.push(dataKey);
	
	array.push(comp);
	return array.length;
};

QueryManager.prototype.removeRealComp = function(dataKey, comp)
{
	var array = this.realComps[dataKey];
	if(!array) return -1;
	
	for(var i=0; i<array.length; i++)
	{
		if(array[i]===comp)
		{
			/*
			//리얼에 대한 dataKey remove
			for(var j=0; j<comp.realDataKeyArr.length; j++)
			{
				if(comp.realDataKeyArr[j]==dataKey)
				{
					comp.realDataKeyArr.splice(j, 1);
					break;
				}
			}
			*/
			
			array.splice(i, 1);
			if(array.length==0) delete this.realComps[dataKey];
			
			return array.length;
		}
	}
	
	return -1;
};

//return : array
QueryManager.prototype.getRealComps = function(dataKey)
{
	return this.realComps[dataKey];
};

//keyArr = [ KR004LTC__USD__, KR004LTC__USD__,  ... ]
//compArr = [acomp, acomp, ...]
//updateType : -1/prepend, 0/update, 1/append
QueryManager.prototype.registerReal = function(aquery, realField, keyArr, compArr, updateType, callback)
{
	var i, j, regArr = [], comp, dataKey;
		
	if(typeof(aquery)=='string') aquery = AQuery.getSafeQuery(aquery);
	
	//문자열이면 컨테이너 아이디가 들어오고 매핑되어져 있는 컴포넌트를 얻어서 등록한다.
	if(typeof(compArr)=='string') compArr = aquery.getQueryComps(compArr, 'output');

	for(i=0; i<keyArr.length; i++)
	{
		dataKey = aquery.getName() + keyArr[i];
		
		if(compArr)
		{
			for(j=0; j<compArr.length; j++)
			{
				//특정 키에 대해 등록되어져 있는 컴포넌트 개수를 리턴. 즉, 최초로 등록하는 경우만 전송 정보로 셋팅한다.
				if(this.addRealComp(dataKey, compArr[j]) == 1)
				{
					regArr.push(keyArr[i]);
				}
			}
			
			if(callback)
			{
				//같은 키로 여러 컴포넌트에 realCallback 함수를 셋팅하면 리얼 수신시 
				//같은 callback 함수가 여러번 호출되므로 첫번째 컴포넌트에만 함수를 셋팅한다.
				
				if(compArr.length>0)
				{
					comp = compArr[0];
					
					if(!comp.realCallbacks) comp.realCallbacks = {};
					
					comp.realCallbacks[dataKey] = callback;
				}
			}
			
		}
		
		//컴포넌트에 쿼리 매핑 없이 리얼 데이터만 받을경우
		//else regArr.push(keyArr[i]);
	}
	
	//var comp, block = aquery.getQueryBlock('input', 'InBlock1'),
	//	realKey = block.format[0][AQuery.IKEY];
	
	if(compArr)
	{
		//set updateType to component
		for(j=0; j<compArr.length; j++)
		{
			comp = compArr[j];
			if(!updateType) 
			{
				comp.updateType = 0;
				
				// setRealMap을 직접 호출하고 나중에 리얼을 등록하고 싶은 경우를 위해 수정
				// 1. setRealMap(realField)
				// 2. 조회1 수신후 조회2 호출 .... 조회N-1 수신후 조회N 호출
				// 3. 조회N 수신 후 리얼등록(realField값 null로 세팅)
				if(comp.setRealMap && realField) comp.setRealMap(realField);	//그리드 같은 컴포넌트는 realMap 이 존재한다.
			}
			else comp.updateType = updateType;
		}
	}
	
	//새롭게 등록할 정보가 있으면
	if(regArr.length>0)
		this.sendRealSet(aquery, true, regArr);
};

QueryManager.prototype.unregisterReal = function(aquery, keyArr, compArr)
{
	var i, j, regArr = [], comp, dataKey;
	
	if(typeof(aquery)=='string') aquery = AQuery.getSafeQuery(aquery);
	
	//문자열이면 컨테이너 아이디가 들어오고 매핑되어져 있는 컴포넌트를 얻어서 등록한다.
	if(typeof(compArr)=='string') compArr = aquery.getQueryComps(compArr, 'output');
	
	for(i=0; i<keyArr.length; i++)
	{
		dataKey = aquery.getName() + keyArr[i];
	
		if(compArr)
		{
			for(j=0; j<compArr.length; j++)
			{
				comp = compArr[j];
				
				//특정 키에 대해 모든 컴포넌트의 등록이 해제되면 전송 정보로 셋팅한다.
				if(this.removeRealComp(dataKey, comp) == 0)
				{
					regArr.push(keyArr[i]);
				}
				
				//파람으로 넘어온 compArr 의 순서가 reg 시점과 똑같다고 보장할 수 없으므로, 모든 컴포넌트의 realCallback 변수를 삭제한다.
				if(comp.realCallbacks) 
				{
					delete comp.realCallbacks[dataKey];
					
					if(Object.keys(comp.realCallbacks).length==0) comp.realCallbacks = undefined;
				}
			}
		}
		//else regArr.push(keyArr[i]);
	}
	
	if(compArr)
	{
		//set updateType to component
		for(j=0; j<compArr.length; j++)
		{
			comp = compArr[j];
			comp.updateType = undefined;

			if(comp.setRealMap) comp.setRealMap(null);
		}
	}
	
	//새롭게 해제할 정보가 있으면
	if(regArr.length>0)
		this.sendRealSet(aquery, false, regArr);
};

QueryManager.prototype.getHeaderInfo = function(headerKey)
{
	if(headerKey) return this.headerInfo[headerKey];
	else return this.headerInfo;
};

QueryManager.prototype.setHeaderInfo = function(headerInfo)
{
	if(headerInfo)
	{
		for(var p in headerInfo)
		{
			if(!headerInfo.hasOwnProperty(p)) continue;
			this.headerInfo[p] = headerInfo[p];
		}
	}
	//파라미터가 null 인 경우 초기화
	else
	{
		this.headerInfo = 
		{
			PBLC_IP_ADDR		: '',	// 공인 IP		//10.110.51.182
			PRVT_IP_ADDR		: '',	// 사설 IP		//10.110.51.182
			MAC_ADR				: '',	// Mac 주소		//6C626D3A60C9
			TMNL_OS_TCD			: 'PC',	// 단말 OS 구분 코드 MS Win:"PC" MAC:"MC" AND:"AP" IPHONE:"IP" IPAD:"ID" AND PAD:"AD" 기타:"ZZ"
			TMNL_OS_VER			: '',	// 단말 OS 버전
			TMNL_BROW_TCD		: '',	// 단말 브라우저 구분 코드 익스플로러:"IE" 사파리:"SF" 파이어폭스:"FX" 크롬:"CR" 오페라:"OP" WEBKIT:"WK" 기타:"ZZ"
			TMNL_BROW_VER		: ''	// 단말 브라우저 버전
		};
	}
};

QueryManager.prototype.onConnected = function(success)
{
	//afc.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ QueryManager.prototype.onConnected');
};

QueryManager.prototype.onClosed = function()
{
	//afc.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ QueryManager.prototype.onClosed');
	this.clearAllQueryCallback();
	
	// TODO: 재접속 처리 로직 
// 	if(!this.selfClose && !theApp.isPause)
// 		theApp.autoLoginProcess('재접속중입니다...');
};

//############################################################################################################################################
// 상속받아 오버라이드 해야하는 함수들


//상속 받아 다음과 같은 패턴으로 구현한다.
QueryManager.prototype.onReceived = function(data, size)
{
	//----------------------------------------------------
	
	//	1. this.rcvBuf 를 생성한다. 생성방법은 상황에 따라 다름.
	//	this.rcvBuf.setBuffer(data);
	//	this.rcvBuf.setDataSize(size);
	
	//	2. 패킷 타입과 패킷 아이디를 셋팅한다.
	//	this.packetInfo.packetType = this.rcvBuf.getByte(OS_COMM_CMD);
	//	this.packetInfo.packetId = this.rcvBuf.getByte(OS_COMM_ID);

	//	3. 패킷 타입에 따라 처리 함수를 분기한다.
	//	switch(this.packetInfo.packetType)
	//	{
	//		case 1: this.queryProcess();
	//	}
	
	//----------------------------------------------------
};

//전송헤더 이후의 데이터 셋팅 오프셋을 리턴한다.
QueryManager.prototype.getInDataOffset = function()
{
	return 0;
};

//수신헤더 이후의 데이터 셋팅 오프셋을 리턴한다.
QueryManager.prototype.getOutDataOffset = function()
{
	return 0;
};

//사용할 AQueryData(또는 상속받은 클래스) 객체를 생성하여 리턴한다.
QueryManager.prototype.makeQueryData = function(aquery, isSend)
{
	return new AQueryData(aquery);
};

//리얼 등록/해제 패킷 전송 함수... 재정의 하기, unregisterReal 함수 내에서 호출함
QueryManager.prototype.sendRealSet = function(aquery, isSet, regArr)
{

};

//onReceive 함수 내에서 패킷 타입에 따라 분기하여 호출되는 함수
QueryManager.prototype.realProcess = function()
{
	//----------------------------------------------------
	
	//	1. 쿼리 네임을 얻어 queryData 를 생성한다.
	//	var qryName = this.rcvBuf.nextOriString(4),
	//		aquery = AQuery.getSafeQuery(qryName),
	//		queryData = this.makeQueryData(aquery);
	
	//	2. queryData 객체에 값을 채우고 dataKey 값을 구한 후
	//	queryData.outBlockData(this.rcvBuf, offset);
		
	//	3. realDataToComp 함수를 호출한다.
	
	//----------------------------------------------------

};

//서버에 데이터를 송신하기 전에 호출되어 헤더 정보를 세팅한다.
QueryManager.prototype.makeHeader = function(queryData, abuf, menuNo)
{
	// abuf 객체의 메서드들을 이용하고 패킷아이디를 리턴한다.
	return this.makePacketId();
};

// 데이터 수신시 에러정보를 세팅하는 함수
QueryManager.prototype.setErrorData = function(cbObj)
{
	//----------------------------------------------------
	
	//	* rcvBuf에서 에러데이터에 해당하는 정보를 뽑아 저장한다.
	//	this.errorData.errCode = this.rcvBuf.getString(OS_ERR_CODE, SZ_ERR_CODE);
	//	this.errorData.errMsg = this.rcvBuf.getString(OS_ERR_MSG, SZ_ERR_MSG);
	//		...
	//		etc
	//----------------------------------------------------
};


// 여기까지 
//############################################################################################################################################



//asoocool dblTostr
QueryManager.prototype.enableDTS = function()
{
	this.dblTostr = true;
};


//	전문 수신 후 프로세스
//	recvObj 는 json 형식 수신시 넘어온다.
QueryManager.prototype.queryProcess = function(recvObj)
{
//##########################################	
	if(this.isShowProgress) AIndicator.hide();
//##########################################

	//var dataSize = this.rcvBuf.getDataSize(),
	//	cbObj = this.getQueryCallback(this.packetInfo.packetId);
	
	var cbObj = null, dataSize = 0;
	
	if(this.rcvBuf) dataSize = this.rcvBuf.getDataSize();
		
	cbObj = this.getQueryCallback(this.packetInfo.packetId);
	
	// 타임아웃 발생시 콜백객체를 제거하므로 체크
	if(!cbObj) return;

	//패킷 정보 셋팅
	this.packetInfo.menuNo = cbObj.menuNo;
	this.packetInfo.groupName = cbObj.groupName;
	this.packetInfo.trName = cbObj.trName;

	//에러 메시지 셋팅
	this.errorData.trName = cbObj.trName;
	this.errorData.errCode = '';
	this.errorData.errMsg = '';
	this.setErrorData(recvObj);
	

	//수신된 전문 로그 남기는 함수, 개발시에만 호출
	//this.recv_log_helper();
	
	var listener, i, qLen = this.queryListeners.length;

	//버퍼에 데이터를 수신한 후 바로 호출된다.
	//######## afterRecvBufferData
	for(i=0; i<qLen; i++)
	{
		listener = this.queryListeners[i];
		if(listener.afterRecvBufferData) listener.afterRecvBufferData(this);
	}
	//########

	var queryData = null,
		aquery = AQuery.getSafeQuery(cbObj.trName);

	if(!aquery)
	{
 		if(this.isShowProgress) AIndicator.hide();

		alert('onReceive : ' + cbObj.trName + ' query is not found.');
		return;
	}
	
	if(this.rcvBuf)
	{
		var dataOffset = this.getOutDataOffset(aquery);

		//body data 가 있는 경우만
		if(dataSize>dataOffset)
		{
			queryData = this.makeQueryData(aquery);

			//asoocool dblTostr
			queryData.dblTostr = cbObj.dblTostr;

			//queryData 객체에 전문데이터를 세팅
			queryData.outBlockData(this.rcvBuf, dataOffset);
		}
	}
	else
	{
		queryData = this.makeQueryData(aquery);
		queryData.outBlockData(recvObj);
	}
	

	//타임 아웃 이후에 패킷이 도착하거나 
	//계정계 지연 패킷이 올수 있으므로 콜백 객체가 없어도 계속 진행한다.
	//계정계 지연 패킷은 listener 의 afterOutBlockData 함수에서만 구현 가능한다.
	if(cbObj && cbObj.func) cbObj.func.call(this, queryData);

	//수신된 데이터를 AQueryData 에 채운 후 호출된다.
	//######## afterOutBlockData
	for(i=0; i<qLen; i++)
	{
		listener = this.queryListeners[i];
		if(listener.afterOutBlockData) listener.afterOutBlockData(queryData, this);
	}
	//########

	if(queryData)
	{
		//afterOutBlockData 함수에서 enableLazyUpdate 함수를 호출하면 화면 업데이트를 비동기 함수 호출후에 할 수 있다.
		//차후 비동기 함수 콜백에서 queryData.lazyUpdate(); 함수를 호출해 준다.
		
		if(queryData.isLazyUpdate) queryData.lazyUpdate = _updateFunc;
		else _updateFunc();
	}
	
	//-----
	
	function _updateFunc()
	{
		var compArray = aquery.getQueryComps(cbObj.menuNo, 'output');
		
		if(compArray)
		{
			var qryComp, item;
			for(var i=0; i<compArray.length; i++)
			{
				qryComp = compArray[i];
				
				//asoocool, 컴포넌트 유효성 검사
				if(!qryComp.isValid()) continue;

				//비활성화된 탭은 적용되지 않도록
				//var tab = qryComp.getRootView().tab;
				//if(tab && $(tab.content).is(':hidden')) continue;
				
				//비활성화된 view 는 적용되지 않도록
				item = qryComp.getRootView().item;
				if(item && $(item).is(':hidden')) continue;
				

				//groupName 을 지정해 줬으면 같은 그룹네임인지 비교
				if( cbObj.groupName && cbObj.groupName!=qryComp.getGroupName() ) continue;

				qryComp.updateComponent(queryData);
			}
			
			if(cbObj && cbObj.ucfunc) cbObj.ucfunc.call(cbObj.qm, queryData);
		}
	}
	
//##########################################	
	//if(this.isShowProgress) AIndicator.hide();
//##########################################
	
};

//realProcess 함수에서 호출한다.
QueryManager.prototype.realDataToComp = function(key, queryData)
{
	key = queryData.getQueryName() + key;
	
	queryData.isReal = true;
	

	//dataKey 가 동일한 컴포넌트 들은 일단 모두 updateComponent 를 호출해 줘야 한다.(updateComponent 내부 주석 참조)
	var compArray = this.getRealComps(key);
	if(compArray)
	{
		var qryComp, callback, item;
		for(var i=0; i<compArray.length; i++)
		{
			qryComp = compArray[i];
			
			//asoocool, 컴포넌트 유효성 검사
			if(!qryComp.isValid()) continue;
			
			//비활성화된 view 는 적용되지 않도록
			// qryComp가 container인 경우에는 getRootView 함수가 없으므로 체크한다.
			if(qryComp.getRootView)
			{
				item = qryComp.getRootView().item;
				if(item && $(item).is(':hidden')) continue;
			}
			
			if(qryComp.realCallbacks) 
			{
				callback = qryComp.realCallbacks[key];
				
				if(callback) callback.call(this, queryData);
			}
			
			qryComp.updateComponent(queryData);
		}
	}
};

QueryManager.prototype.sendProcessByComp = function(acomp, groupName, beforeInBlockBuffer, afterOutBlockData, afterUpdateComponent)
{
	var menuNo = acomp.getContainerId(),ret = [];

	for(var queryName in acomp.dataKeyMap)
		ret.push(this.sendProcess(AQuery.getQuery(queryName), menuNo, groupName, beforeInBlockBuffer, afterOutBlockData, afterUpdateComponent));
	
	return ret;
};

QueryManager.prototype.sendProcessByComps = function(acomps, groupName, beforeInBlockBuffer, afterOutBlockData, afterUpdateComponent)
{
	var acomp, menuNo, queryName, ret = [];
	for(var i=0; i<acomps.length; i++)
	{
		acomp = acomps[i];
		menuNo = acomp.getContainerId();
		
		for(queryName in acomp.dataKeyMap)
			ret.push(this.sendProcess(AQuery.getQuery(queryName), menuNo, groupName, beforeInBlockBuffer, afterOutBlockData, afterUpdateComponent));
	}
	
	return ret;
};

QueryManager.prototype.sendProcessByName = function(queryName, menuNo, groupName, beforeInBlockBuffer, afterOutBlockData, afterUpdateComponent)
{
	return [this.sendProcess(AQuery.getSafeQuery(queryName), menuNo, groupName, beforeInBlockBuffer, afterOutBlockData, afterUpdateComponent)];
};

QueryManager.prototype.sendProcessByNames = function(queryNames, menuNo, groupName, beforeInBlockBuffer, afterOutBlockData, afterUpdateComponent)
{
	var ret = [];
	
	for(var i=0; i<queryNames.length; i++)
		ret.push(this.sendProcess(AQuery.getSafeQuery(queryNames[i]), menuNo, groupName, beforeInBlockBuffer, afterOutBlockData, afterUpdateComponent));

	return ret;
};

QueryManager.prototype.sendProcess = function(aquery, menuNo, groupName, beforeInBlockBuffer, afterOutBlockData, afterUpdateComponent)
{
//############################################
	if(this.isShowProgress) AIndicator.show();
//############################################

	var trName = aquery.getName();

	this.errorData.trName = trName;
	
	this.sendInfo.trName = trName;
	this.sendInfo.menuNo = menuNo;
	this.sendInfo.groupName = groupName; 
	

	var queryData = this.makeQueryData(aquery, true);
	queryData.inBlockPrepare();

	var qryComp, compArray = aquery.getQueryComps(menuNo, 'input'), i, item;
	
	if(compArray)
	{
		for(i=0; i<compArray.length; i++)
		{
			qryComp = compArray[i];
			
			//비활성화된 탭은 적용되지 않도록
			//비활성화된 view 는 적용되지 않도록
			item = qryComp.getRootView().item;
			if(item && $(item).is(':hidden')) continue;

			//groupName 을 지정해 줬으면 같은 그룹네임인지 비교
			if( groupName && groupName!=qryComp.getGroupName() ) continue;			
			
			qryComp.updateQueryData(queryData);
		}
	}
	
	var listener, qLen = this.queryListeners.length;

	//전송버퍼에 데이터를 채우기 전에 호출된다.
	//######## beforeInBlockBuffer
	
	if(beforeInBlockBuffer) beforeInBlockBuffer.call(this, queryData);
	
	for(i=0; i<qLen; i++)
	{
		listener = this.queryListeners[i];
		if(listener.beforeInBlockBuffer) listener.beforeInBlockBuffer(queryData, this);
	}
	
	//########
	
	var packetId = 0, dataOffset = 0, sendObj = null;//json 방식의 문자열 전송 시 사용
	
	if(this.sndBuf)
	{
		dataOffset = this.getInDataOffset(aquery);
		
		queryData.inBlockBuffer(this.sndBuf, dataOffset);

		this.sndBuf.setDataSize(this.sndBuf.getOffset());

		packetId = this.makeHeader(queryData, this.sndBuf, menuNo);
	}
	else
	{
		sendObj = {};
		
		queryData.inBlockBuffer(sendObj);
		
		packetId = this.makeHeader(queryData, sendObj, menuNo);
	}

	
	this.sendInfo.packetId = packetId;
	
	
	//---------------------------------------------------------
	
	//데이터를 전송하기 바로 전에 호출된다.
	//######## beforeSendBufferData
	for(i=0; i<qLen; i++)
	{
		listener = this.queryListeners[i];
		
		if(listener.beforeSendBufferData) 
		{
			listener.beforeSendBufferData(this);
		}
	}
	//########
	
	//asoocool dblTostr
	var cbObj = 
	{
		'menuNo': menuNo, 'groupName': groupName, 'func': afterOutBlockData, 'timeout': null,
		'trName': trName, 'dblTostr': this.dblTostr,
		'ucfunc': afterUpdateComponent, 'qm': this
	};
	
	//asoocool dblTostr
	//cbObj 에 셋팅하고 바로 지운다.
	this.dblTostr = undefined;
	
	this.setQueryCallback(packetId, cbObj);
	
	//------------------------------------------------------------
	//	네트웍 타임아웃 셋팅
	if(this.timeoutSec>0)
	{
		var thisObj = this;

		cbObj.timeout = setTimeout(function()
		{
			if(thisObj.isShowProgress) AIndicator.hide();
			
			thisObj.errorData.trName = trName;
			thisObj.errorData.errCode = 10001;
			//thisObj.errorData.errMsg = '서버와의 접속이 지연되고 있습니다.';
			thisObj.errorData.errMsg = '통신 상태가 원활하지 않습니다.(1) : ' + thisObj.errorData.trName + ',' + menuNo + ',' + groupName;
			
			//콜백 객체 제거
			thisObj.getQueryCallback(packetId);
			
			//타임아웃
			if(afterOutBlockData) afterOutBlockData.call(thisObj, null);
			//if(listener && listener.afterOutBlockData) listener.afterOutBlockData(null, groupName, thisObj.errorData.trName, thisObj);
			
			qLen = thisObj.queryListeners.length;
			for(i=0; i<qLen; i++)
			{
				listener = thisObj.queryListeners[i];
				
				if(listener.afterRecvBufferData) listener.afterRecvBufferData(thisObj);
				if(listener.afterOutBlockData) listener.afterOutBlockData(null, thisObj);
			}
			

		}, this.timeoutSec*1000);
	}
	
	//---------------------------------------------------------
	// 송신할 전문 로그 남기는 함수
	this.send_log_helper();
	//---------------------------------------------------------
	
	if(this.netIo.sorimachiSend)
	{
		this.netIo.sorimachiSend({
			packetId: packetId,
			menuNo: menuNo,
			trName: trName,
			groupName: groupName,
			queryData: queryData,
			sndBuf: this.sndBuf,
			sendLen: this.sndBuf.getDataSize()
		});
	}
	
	else if(this.sndBuf) this.sendBufferData( this.sndBuf.subDataArray() );
	else this.sendBufferData(JSON.stringify(sendObj));
	
	return packetId;
};


//if buf is array, type of array is Uint8Array
//or buf is string
QueryManager.prototype.sendBufferData = function(buf)
{
	var thisObj = this;
	if(!this.netIo.isStart())
	{
		//console.log('----------------------- sendBufferData fail! : socket is closed.');
		
		if(this.isShowProgress) AIndicator.hide();
		return;
	}
	
	if(buf instanceof ABuffer) buf = buf.subDataArray();
	
	this.netIo.sendData(buf, function(result)
	{
		if(!result) 
		{
			thisObj.onSendFail();
		}
	});
};


/*
QueryManager.prototype.sendBufferData = function(abuf)
{
	var thisObj = this;
	if(!this.netIo.isStart())
	{
		//console.log('----------------------- sendBufferData fail! : socket is closed.');
		
		if(this.isShowProgress) AIndicator.hide();
		return;
	}
	
	var sendLen = abuf.getDataSize();
	
	this.netIo.sendData(abuf.subArray(0, sendLen), function(result)
	{
		if(!result) 
		{
			thisObj.onSendFail();
		}
	});
};
*/

QueryManager.prototype.onSendFail = function()
{
	if(this.netIo.isStart())
	{
		AIndicator.endOltp();
		
		AToast.show('통신 상태가 원활하지 않습니다.');
		//theApp.autoLoginProcess('통신 상태가 원활하지 않습니다.(2) : '+this.errorData.trName, true);
	}

};

QueryManager.prototype.makePacketId = function()
{
	return ++this.packetId;
};

QueryManager.prototype.addSkipErrorCode = function(qryName, errorCode)
{
	var array = this.errCodeMap[qryName];
	if(!array) array = this.errCodeMap[qryName] = [];
	
	for(var i=0; i<array.length; i++)
		if(array[i]==errorCode) return;
	
	array.push(errorCode);
};

QueryManager.prototype.removeSkipErrorCode = function(qryName, errorCode)
{
	var array = this.errCodeMap[qryName];
	if(!array) return;
	
	for(var i=0; i<array.length; i++)
	{
		if(array[i]==errorCode)
		{
			array.splice(i, 1);
			if(array.length==0) delete this.errCodeMap[qryName];
			
			return;
		}
	}
};

QueryManager.prototype.isSkipErrorCode = function(qryName, errorCode)
{
	var array = this.errCodeMap[qryName];
	if(!array) return false;
	
	for(var i=0; i<array.length; i++)
	{
		if(array[i]==errorCode)
			return true;
	}
	
	return false;
};

// 송신할 전문 로그 남기는 함수
QueryManager.prototype.send_log_helper = function()
{
};


// 수신된 전문 로그 남기는 함수
QueryManager.prototype.recv_log_helper = function()
{
};

// option = { realQuery:'', keyBlock:'InBlock1', realField:'', updateType: 0 }
QueryManager.prototype.sendProcessWithReal = function(queryName, menuNo, groupName, beforeInBlockBuffer, afterOutBlockData, afterUpdateComponent, option, realCallback)
{
	var dataKeyArr = [];
	
	if(!option.keyBlock) option.keyBlock = 'InBlock1';

	return this.sendProcessByName(queryName, menuNo, groupName, 
	
	function(queryData)
	{
		beforeInBlockBuffer.call(this, queryData);
		
		//if(option.keyBlock.charCodeAt(0)==0x49)	//I
		if(option.keyBlock.indexOf('InBlock')>-1)
		{
			var blockData = queryData.getBlockData(option.keyBlock);
			
			for(var i=0; i<blockData.length; i++)
				dataKeyArr.push(blockData[i][option.realField]);
		}
	},
	
	function(queryData)
	{
		if(queryData)
		{
			//if(option.keyBlock.charCodeAt(0)==0x4F)	//O
			if(option.keyBlock.indexOf('OutBlock')>-1)
			{
				var blockData = queryData.getBlockData(option.keyBlock);

				for(var i=0; i<blockData.length; i++)
					dataKeyArr.push(blockData[i][option.realField]);
			}

			if(typeof option.realQuery == 'string') option.realQuery = [option.realQuery];
			for(var i=0; i<option.realQuery.length; i++)
			{
				this.realProcMap[menuNo + queryName + option.realQuery[i]] = dataKeyArr;
				this.registerReal(option.realQuery[i], option.realField, dataKeyArr, menuNo, option.updateType, realCallback);
			}
		}
		
		afterOutBlockData.call(this, queryData);
	},
	afterUpdateComponent);

};

QueryManager.prototype.clearRealProcess = function(queryName, menuNo, realQuery)
{
	if(typeof realQuery == 'string') realQuery = [realQuery];

	var key, dataKeyArr;
	for(var i=0; i<realQuery.length; i++)
	{
		key = menuNo + queryName + realQuery[i];
		dataKeyArr = this.realProcMap[key];
		
		if(dataKeyArr) delete this.realProcMap[key];
		else dataKeyArr = [];
		
		this.unregisterReal(realQuery[i], dataKeyArr, menuNo);
	}
	/*
	var key = menuNo + queryName + realQuery, 
		dataKeyArr = this.realProcMap[key];
	
	if(dataKeyArr) delete this.realProcMap[key];
	else dataKeyArr = [];
	
	this.unregisterReal(realQuery, dataKeyArr, menuNo);*/
};
