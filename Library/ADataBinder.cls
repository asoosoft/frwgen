

class ADataBinder()
{
	this.dataContainer = null;
	this.dataListeners = [];
}

ADataBinder.ITEM_SELECT = 1;
ADataBinder.ITEM_INSERT = 2;
ADataBinder.ITEM_DELETE = 3;
ADataBinder.ITEM_EDIT = 4;
ADataBinder.ITEM_REFRESH = 5;
ADataBinder.CUSTOM_ACTION = 6;

//function onBindData(dataContainer);
//function onDataChanged(dataContainer, param);

function ADataBinder:setDataContainer(dataContainer)
{
	this.dataContainer = dataContainer;
	this.dataContainer.dataBinder = this;
	
	for(var i=0; i<this.dataListeners.length; i++)
		this.dataListeners[i].onBindData(this.dataContainer);
};

function ADataBinder:addDataListener(listener)
{
	if(!listener) return;

	for(var i=0; i<this.dataListeners.length; i++)
		if(this.dataListeners[i]===listener) return;
	
	this.dataListeners.push(listener);
};

function ADataBinder:removeDataListener(listener)
{
	for(var i=0; i<this.dataListeners.length; i++)
	{
		if(this.dataListeners[i]===listener)
		{
			this.dataListeners.splice(i, 1);
			return;
		}
	}
};


//	BIND_TYPE	{ ITEM_SELECT = 1, ITEM_INSERT = 2, ITEM_DELETE = 3, ITEM_EDIT = 4, ITEM_REFRESH = 5 };
//	param =
//	{
//		type: 1,
//		index: 0,
//		data: obj,
//		update: true
//	};

function ADataBinder:_reportChange(listener, param, except)
{
	for(var i=0; i<listener.length; i++)
	{
		if(listener[i] === except) continue;
		
		listener[i].onDataChanged(this.dataContainer, param);
	}
};

function ADataBinder:reportChange(type, index, data, update, except)
{
	this._reportChange(this.dataListeners, {'type':type, 'index':index, 'data':data, 'update':update}, except);
};

function ADataBinder:reportChangeTo(type, index, data, update, listeners)
{
	if(!listeners) return;
	this._reportChange(listeners, {'type':type, 'index':index, 'data':data, 'update':update});
};

