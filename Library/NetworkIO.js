/**
 * @author asoocool
 */

function NetworkIO(listener)
{
	this.listener = listener;
	this.retryCount = 0;
	this.retryTime = 0;
	this.curCount = 0;
	this.selfClose = false;
}

//리스너 이벤트 함수
//void onConnected(success);
//void onClosed();
//void onReceived(strData);

NetworkIO.RETRY_CHECK_TIME = 3000;
NetworkIO.FULL_RETRY_TIME = 1000*15;

NetworkIO.prototype.isStart = function()
{
	return false;
};


NetworkIO.prototype.setIoListener = function(listener)
{
	this.listener = listener;
};

NetworkIO.prototype.enableRetry = function(retryCount)
{
	this.retryCount = retryCount;
};

NetworkIO.prototype.startIO = function(address, port)
{

};

NetworkIO.prototype.stopIO = function(isClosed)
{

};

NetworkIO.prototype.sendData = function(data, callback)
{

};

//	if data is ArrayBuffer, use this code
//	ex) var buf = new Uint8Array(data);
NetworkIO.prototype.onReceived = function(data, size)
{
	//무언가 추가 작업(압축해제, 복호화)이 필요할 경우 이곳에서 한 후
	//아래 함수가 호출되도록 한다.
	
	if(this.listener) this.listener.onReceived(data, size);
};

NetworkIO.prototype.onClosed = function()
{
	//console.log('onClosed');
	
	if(this.listener) this.listener.onClosed();
};

NetworkIO.prototype.onConnected = function(success)
{
	//console.log('onConnected : ' + success);
	
	if(this.listener) this.listener.onConnected(success);
};

NetworkIO.prototype._onConnected = function(success)
{
	if(success)
	{
		this.curCount = 0;
		this.onConnected(true);
	}
	else
	{
		//최초 재시도인 경우, 시작 시간 체크
		if(this.curCount==0) this.retryTime = new Date().getTime();
		
		if(++this.curCount >= this.retryCount)
		{
			this.curCount = 0;
			this.onConnected(false);
			this.stopIO(true);
		}	
		//재접속 시도
		else
		{
			//max wait time is 15 sec
			if( (new Date().getTime() - this.retryTime) > NetworkIO.FULL_RETRY_TIME )
			{
				this.curCount = 0;
				this.onConnected(false);
				this.stopIO(true);
				return;
			}
			
			
			var thisObj = this;
			setTimeout(function()
			{
				thisObj.stopIO(true);
				thisObj.startIO(thisObj.address, thisObj.port);
				
			}, NetworkIO.RETRY_CHECK_TIME);
		}
	}
};

