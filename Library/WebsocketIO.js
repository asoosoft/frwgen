/**
 * @author asoocool
 */

function WebsocketIO(listener, isSSL)
{
	NetworkIO.call(this, listener);
	
	this.socket = null;
	this.protocols = undefined;
	this.isSSL = isSSL;
}
afc.extendsClass(WebsocketIO, NetworkIO);


WebsocketIO.prototype.isStart = function()
{
	return (this.socket!=null);
};

WebsocketIO.prototype.setProtocols = function(protocols)
{
	this.protocols = protocols;
};

WebsocketIO.prototype.startIO = function(address, port)
{
	if(this.isStart()) return;
	
	var thisObj = this;
	
	this.selfClose = false;
	this.address = address;
	this.port = port;
	
	var scheme = 'ws://';
	
	if(this.isSSL) scheme = 'wss://';
	
	var socket = new WebSocket(scheme + address + ':' + port, this.protocols);
	
	socket.binaryType = 'arraybuffer';
	
	var thisObj = this;//, listener = this.listener;//, abuf = new ABuffer(), buf = null;
	
	socket.onopen = function(event) 
	{
		thisObj.socket = socket;
		
		thisObj._onConnected(true);
	};	
	
	socket.onmessage = function(event) 
	{
		thisObj.onReceived(event.data);
	};

	socket.onclose = function(event) 
	{
		if(afc.isIos && afc.iosVer < 11 && event.code == 1006)
		{
			if(!thisObj.isStart())
			{
				socket.isConnectFail = true;
				thisObj._onConnected(false);
			}
		}
		if(!socket.isConnectFail) thisObj.onClosed();
	};
	
	socket.onerror = function(event) 
	{
		//console.log('onError');
	
		if(!thisObj.isStart())
		{
			socket.isConnectFail = true;
			thisObj._onConnected(false);
		}

	};
	
};

WebsocketIO.prototype.stopIO = function(isClosed)
{
	if(!this.isStart()) return;

	this.selfClose = !isClosed;
	
	this.socket.close();
	this.socket = null;
};

//data is String, Blob, ArrayBuffer(Uint8Array)
WebsocketIO.prototype.sendData = function(data, callback)
{
	if(!this.isStart()) return;
	
	this.socket.send(data, callback);
};


