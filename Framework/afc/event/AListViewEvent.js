/**
 * @author asoocool
 * 
 */

function AListViewEvent(acomp)
{
	AEvent.call(this, acomp);
	
	this.bScrollBind = false;
	this.isTouchLeave = true;
}
afc.extendsClass(AListViewEvent, AEvent);


//---------------------------------------------------------------------------------------------------
//	Component Event Functions

AListViewEvent.prototype.scroll = function()
{
	this._scroll();
};

AListViewEvent.prototype.scrolltop = function()
{
	this._scroll();
};

AListViewEvent.prototype.scrollbottom = function()
{
	this._scroll();
};


//select 이벤트는 아이템 추가시 동적으로 생성되므로 함수를 구현하지 않는다.
//AListViewEvent.prototype.select = function() {};

//---------------------------------------------------------------------------------------------------



AListViewEvent.prototype._scroll = function()
{
	if(this.bScrollBind) return;
	this.bScrollBind = true;
	
	var alistview = this.acomp, oldScrollTop = alistview.scrollArea[0].scrollTop;
	
	alistview.scrollArea[0].addEventListener('scroll', function(e)
	{
		alistview.reportEvent('scroll', this, e);
		
		var bottomVal = this.scrollHeight - this.clientHeight - this.scrollTop;
	
		if(bottomVal < 1)	//안드로이드인 경우 0.398472 와 같이 소수점이 나올 수 있다.
		{
			//ios 는 overscrolling 때문에 음수값이 여러번 발생한다.
			//아래와 같이 비교할 경우 바운스 되는 상황에 따라 0 이 되는 경우가 여러번 발생할 수 있다.
			//if(afc.isIos && bottomVal!=0) return;
			
			//이미 scroll bottom 이벤트가 발생했으므로 overscrolling 에 대해서는 무시한다.
			if(afc.isIos && (this.scrollHeight-this.clientHeight-oldScrollTop) < 1) return;
			
			if(alistview.scrollBottomManage())
				alistview.reportEvent('scrollbottom', this, e);
		}
		
		else if(this.scrollTop < 1)	//0.398472 와 같이 소수점이 나올 수 있다.
		{
			if(afc.isIos && oldScrollTop < 1) return;
			
			if(alistview.scrollTopManage())
				alistview.reportEvent('scrolltop', this, e);
		}
				
		oldScrollTop = this.scrollTop;
	});
};

//itemList is jQuery Object
//복수개의 item 이 존재한다.
AListViewEvent.prototype._select = function(itemList)
{
	if(!itemList) return;
	
	var alistview = this.acomp;
	var thisObj = this;
	
    itemList.each(function(inx)
    {
		var startX = 0, startY = 0, timeout = null;
		
		AEvent.bindEvent(this, AEvent.ACTION_DOWN, function(e)
		{
			if(!alistview.option.isSelectable) return;
			
			thisObj.isTouchLeave = false;
			
			var oe = e.changedTouches[0];
	        startX = oe.clientX;
	        startY = oe.clientY;
	
			var item = this;
			timeout = setTimeout(function() 
			{
				timeout = null;
				if(!thisObj.isTouchLeave) alistview.setSelectItem(item);
				
			}, 300);
	
		});
		
		AEvent.bindEvent(this, AEvent.ACTION_MOVE, function(e)
		{
			if(!alistview.option.isSelectable) return;
			if(thisObj.isTouchLeave) return;
			
			var oe = e.changedTouches[0];
			if(Math.abs(oe.clientX - startX) > AEvent.TOUCHLEAVE || Math.abs(oe.clientY - startY) > AEvent.TOUCHLEAVE)
			{
				thisObj.isTouchLeave = true;
	
				if(timeout) 
				{
					clearTimeout(timeout);
					timeout = null;
				}
				
				if(alistview.selectItem===this) alistview.setSelectItem(null);
			}
		});
	
		AEvent.bindEvent(this, AEvent.ACTION_UP, function(e)
		{
			if(!alistview.option.isSelectable) return;
			if(thisObj.isTouchLeave) return;
			
			thisObj.isTouchLeave = true;
			
			if(timeout) 
			{
				clearTimeout(timeout);
				timeout = null;
			}
			
			alistview.setSelectItem(this);
			alistview.reportEventDelay('select', this, 100);
		});
		
		AEvent.bindEvent(this, AEvent.ACTION_CANCEL, function(e)
		{
			thisObj.isTouchLeave = true;
	
			if(timeout) 
			{
				clearTimeout(timeout);
				timeout = null;
			}
			
			if(alistview.selectItem===this) alistview.setSelectItem(null);
		});		
    	
    });
};

