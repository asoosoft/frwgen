/**
 * @author asoocool
 */

function HttpIO(listener)
{
	NetworkIO.call(this, listener);
	
	this.url = null; //"http://10.16.103.45:8088/webt/webtexecuter.jsp";
}
if(window.afc) afc.extendsClass(HttpIO, NetworkIO);
else _afc.extendsClass(HttpIO, NetworkIO);

HttpIO.prototype.isStart = function()
{
	return (this.url!=null);
};

HttpIO.prototype.startIO = function(url)
{
	this.url = url;
};

HttpIO.prototype.stopIO = function(isClosed)
{
	this.url = null;
};

HttpIO.prototype.sendData = function(data, callback)
{
	if(typeof(data)=='string') this.sendString(data, callback);
	else
	{
		// 전송할 사이즈가 버퍼 사이즈보다 큰 경우 알림창처리
		var buf = this.listener.sndBuf;
		if(data.length > buf.getBufSize())
		{
			var wnd = new AMessageBox();
			wnd.openBox(null, '[오류] 전송할 데이터가 버퍼 사이즈보다 큽니다. 버퍼 사이즈를 변경해 주세요.');
			wnd.setTitleText('전송오류');
			return;	// 사이즈가 큰 경우 전송을 하지 않으려면 주석 해제
		}

		this.sendBinary(data, callback);
	
	}
};

HttpIO.prototype.sendBinary = function(data, callback)
{
	var thisObj = this,
		xhr = new XMLHttpRequest();
		
	xhr.open('POST', this.url);
	xhr.setRequestHeader('Content-Type', 'application/octet-stream');
	xhr.responseType = "arraybuffer";
	
	xhr.onload = function(e)
	{
		if(this.readyState == 4)
		{
			if(this.status == 200)
			{
				thisObj.onReceived(this.response, this.response.byteLength);
			}
			else
			{
				console.log('An error occured: ' + xhr.status + ' ' + xhr.statusText);
				//if(thisObj.listener) thisObj.listener.onSendFail();
				if(callback) callback(false);
			}
		}
		
	};
	xhr.onerror = function(e)
	{
		console.log('An error occured: ' + xhr.status + ' ' + xhr.statusText);
		//if(thisObj.listener) thisObj.listener.onSendFail();
		if(callback) callback(false);
	};
	
	xhr.send(data);

};

HttpIO.prototype.sendString = function(data, callback)
{
	var thisObj = this;
	
	$.ajax(
	{
		type:'POST',
		dataType: "text",
	  	url: this.url,
		data: { 'data': data },
		success: function(result) 
		{
			thisObj.onReceived(result, result.length);
		},
		error: function (xhr, textStatus, errorThrown) 
		{
			console.log('An error occured: ' + xhr.status + ' ' + xhr.statusText);
			if(callback) callback(false);
		}
	});
};
