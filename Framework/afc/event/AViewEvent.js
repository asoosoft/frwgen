
/**
 * @author asoocool
 */

function AViewEvent(acomp)
{
	AEvent.call(this, acomp);
	
	this.bScrollBind = false;
}
afc.extendsClass(AViewEvent, AEvent);



//['click', 'dblclick', 'swipe', 'longtab', 'scroll', 'scrollleft', 'scrollright', 'scrolltop', 'scrollbottom' ]

//---------------------------------------------------------------------------------------------------
//	Component Event Functions

AViewEvent.prototype.click = function()
{
	this._click();
};

AViewEvent.prototype.dblclick = function()
{
	this._dblclick();
};

AViewEvent.prototype.swipe = function()
{
	this._swipe();
};

AViewEvent.prototype.longtab = function()
{
	this._longtab();
};

AViewEvent.prototype.scroll = function()
{
	this._scroll();
};

AViewEvent.prototype.scrollleft = function()
{
	this._scroll();
};

AViewEvent.prototype.scrollright = function()
{
	this._scroll();
};

AViewEvent.prototype.scrolltop = function()
{
	this._scroll();
};

AViewEvent.prototype.scrollbottom = function()
{
	this._scroll();
};

//---------------------------------------------------------------------------------------------------

AViewEvent.prototype._scroll = function()
{
	if(this.bScrollBind) return;
	this.bScrollBind = true;
	
	var aview = this.acomp, lastTop = aview.element.scrollTop, lastLeft = aview.element.scrollLeft;
	
	aview.element.addEventListener('scroll', function(e)
	{
		//---------------------------------
		//	가로 세로 이벤트를 구분하기 위해
				
		//horizontal
		if(lastLeft!=this.scrollLeft)
		{
			aview.reportEvent('scroll', 'h', e);
			
			var rightVal = this.scrollWidth - this.clientWidth - this.scrollLeft;
		
			if(rightVal < 1) 	//안드로이드인 경우 0.398472 와 같이 소수점이 나올 수 있다.
			{
				//ios 는 overscrolling 때문에 음수값이 여러번 발생한다.
				//이미 scroll bottom 이벤트가 발생했으므로 overscrolling 에 대해서는 무시한다.
				if(afc.isIos && (this.scrollWidth-this.clientWidth-lastLeft) < 1) return;
			
				if(aview.scrollRightManage())
					aview.reportEvent('scrollright', null, e);
			}
			else if(this.scrollLeft < 1)
			{
				if(afc.isIos && lastLeft < 1) return;
				
				if(aview.scrollLeftManage())
					aview.reportEvent('scrollleft', null, e);
			}
			
			lastLeft = this.scrollLeft;
		}
		
		//vertical
		if(lastTop!=this.scrollTop)
		{
			aview.reportEvent('scroll', 'v', e);
			
			var bottomVal = this.scrollHeight - this.clientHeight - this.scrollTop;
		
			if(bottomVal < 1)	
	        {
				if(afc.isIos && (this.scrollHeight-this.clientHeight-lastTop) < 1) return;
				
	        	if(aview.scrollBottomManage())
					aview.reportEvent('scrollbottom', null, e);
	        }
	        else if(this.scrollTop < 1)
	        {
				if(afc.isIos && lastTop < 1) return;
				
	        	if(aview.scrollTopManage())
					aview.reportEvent('scrolltop', null, e);
	        }
			
			lastTop = this.scrollTop;
		}
	});
};

