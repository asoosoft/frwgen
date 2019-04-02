/**
 * @author asoocool
 */

function SocketIO(listener)
{
	NetworkIO.call(this, listener);
	
	this.workerId = 0;
}
afc.extendsClass(SocketIO, NetworkIO);


SocketIO.eventListeners = {};

SocketIO.prototype.isStart = function()
{
	return (this.workerId>0);
};


SocketIO.prototype.startIO = function(address, port)
{
	if(this.isStart()) return;
	
	this.selfClose = false;
	
	this.address = address;
	this.port = port;
	
	var thisObj = this;
	cordova.exec(
	function(workerId)
	{
		thisObj.workerId = workerId;
		
		/*if(thisObj.listener)
		{
			thisObj.listener._sock = thisObj;
			SocketIO.eventListeners['Socket'+workerId] = thisObj.listener;
		}*/
		SocketIO.eventListeners['Socket'+workerId] = thisObj;
	}, 
	null, "SocketPlugin", "startIO", [address, port]);
};

SocketIO.prototype.stopIO = function(isClosed)
{
	if(!this.isStart()) return;
	
	this.selfClose = !isClosed;
	
	var tmp = this.workerId;
	this.workerId = 0;
	
	cordova.exec(null, null, "SocketPlugin", "stopIO", [tmp]);
};

SocketIO.prototype.sendData = function(data, callBack)
{
	//alert(this.workerId + ', ' + data);
	//cordova.exec(null, null, "SocketPlugin", "requestSend", [this.workerId, data]);
	
	cordova.exec(callBack, null, "SocketPlugin", "sendData", [this.workerId, Base64.btoaArray(data)]);
	
};

//----------------------------------------------------------------------
//	static area
//----------------------------------------------------------------------
SocketIO.onConnected = function(workerId, success)
{
	var listener = SocketIO.eventListeners['Socket'+workerId];
	if(listener) listener.onConnected(success);
};

SocketIO.onClosed = function(workerId)
{
	var listener = SocketIO.eventListeners['Socket'+workerId];
	if(listener)
	{
		/*if(listener._sock)
		{
			listener._sock.stopIO(true);
			listener._sock = null;
		}
		SocketIO.eventListeners['Socket'+workerId] = null;
		listener.onClosed();*/
		
		listener.stopIO(true);
		SocketIO.eventListeners['Socket'+workerId] = null;
		listener.onClosed();
	}
};

SocketIO.onReceived = function(workerId, strData)
{
	var listener = SocketIO.eventListeners['Socket'+workerId];
	if(listener) listener.onReceived(strData);
};



