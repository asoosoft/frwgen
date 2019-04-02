

function ResPool()
{
	this.viewPool = {};
	this.areaPool = {};
}

//---------------------------------------------------------------------
//	_AView 자체를 캐시하여 여러 곳에서 재사용한다.

ResPool.prototype.pushView = function(aview)
{
	this.viewPool[aview.url].push(aview);
	this.areaPool[aview.url].append(aview.element);
};


ResPool.prototype.popView = function(url)
{
	var viewArr = this.viewPool[url];
	if(!viewArr)
	{ 
		this.viewPool[url] = viewArr = [];
		
		var area = $('<div style="display:none;"></div>');
    	this.areaPool[url] = area;
    	$('body').append(area);
	}

	if(viewArr.length==0) return null;
	else return viewArr.pop();
};


