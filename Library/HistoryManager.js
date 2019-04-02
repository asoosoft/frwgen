
function HistoryManager()
{
	this.offset = -1;			//히스토리 현재 포지션
	this.actData = [];				//
}

// info : { targets: targets, undoData:{}, redoData:{} }
//isMerge 가 false일 경우 offset을 증가하여 새 히스토리 등록, true일 경우 현재 히스토리 배열에 추가
HistoryManager.prototype.reg = function(info, undoFunc, redoFunc)
{
	if(info && info.isMerge)
	{
		if(this.offset < 0) this.offset = 0; 
		if(!this.actData[this.offset]) this.actData[this.offset] = []; 
		this.actData[this.offset].push({ info: info, undo:undoFunc, redo:redoFunc });
	} 
	else
	{
		this.actData.length = this.offset+1;
		this.offset++;
		this.actData[this.offset] = [];
		this.actData[this.offset].push({ info: info, undo:undoFunc, redo:redoFunc });
	}
};
/*
// info : { target: target, undoData:{}, redoData:{} }
//isMerge 가 false일 경우 offset을 증가하여 새 히스토리 등록, true일 경우 현재 히스토리 배열에 추가
HistoryManager.prototype.reg = function(info, undoFunc, redoFunc)
{
	if(info && info.isMerge)
	{
		if(this.offset < 0) this.offset = 0; 
		if(!this.actData[this.offset]) this.actData[this.offset] = []; 
		
		this.actData[this.offset].push({
			u: function(){ undoFunc(info); },
			r: function(){ redoFunc(info); },
		});
	} 
	else
	{
		this.offset++;
		this.actData[this.offset] = [];
		this.actData[this.offset].push({
			u: function(){ undoFunc(info); },
			r: function(){ redoFunc(info); },
		});
	}
};
*/
//히스토리를 클리어 시킴
HistoryManager.prototype.clear = function()
{
	this.offset = -1;
	this.actData = [];
};

//이전 히스토리 호출
HistoryManager.prototype.undo = function()
{
	if(this.offset < 0)
	{
		this.offset = -1;
		return false;
	} 
	else
	{
		this.offset--;
		return true;	
	}
};

//다음 히스토리 호출
HistoryManager.prototype.redo = function()
{
	var maxOffset = this.actData.length-1;
	if(this.offset == maxOffset)
	{
		this.offset = maxOffset;
		return false;
	} 
	else
	{
		this.offset++;
		return true;	
	}
};

//현재 히스토리의 offset을 가져옴
HistoryManager.prototype.getCurrentOffset = function()
{
	return this.offset; 
};

//현재 히스토리를 가져옴
HistoryManager.prototype.getCurrentHistory = function()
{
	return this.actData[this.offset]; 
};

//특정 포지션의 히스토리 정보를 가져옴
HistoryManager.prototype.getPosHistory = function(pos)
{
	return this.actData[pos]; 
};
/*
//특정 포지션부터 undo히스토리를 실행함
HistoryManager.prototype.triggerUndo = function(pos)
{
	this.offset = pos;
	this.undo();
};

//특정 포지션부터 redo히스토리를 실행함
HistoryManager.prototype.triggerRedo= function(pos)
{
	this.offset = pos;
	this.redo(); 
};
*/