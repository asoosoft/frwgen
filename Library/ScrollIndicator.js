/**
 * @author asoocool
 */

function ScrollIndicator()
{
	this.isVisible = false;
	this.$indicator = null;		
	this.isScrollVert = true;
	this.scrollOffset = 0;
};

ScrollIndicator.scrlWidth = 5;

ScrollIndicator.prototype.init = function(type, scrlElement)
{
	//ios 는 기본 스크롤바가 숨겨지지 않고 인디케이터를 덮어서 작동하지 않는다.
	//if(afc.isIos) return;
	
	this.isScrollVert = (type=='vertical');
	
	this.scrlElement = scrlElement;
	this.$indicator = $('<span></span>');
	
	this.$indicator.css(
	{
		'position': 'absolute',
		'background-color': 'rgb(51,51,51,0.3)',
		'z-index': 10
	});
	
	var $scrlEle = $(scrlElement);
	
	//기본 스크롤바를 숨기고 ScrollIndicator 를 추가한다.
	$scrlEle.addClass('hide-scrlbar');
	$scrlEle.parent().append(this.$indicator);

	if(this.isScrollVert) 
	{
		this.$indicator.css({ width: ScrollIndicator.scrlWidth+'px', right: '0px', top: '0px' });
	}
	else 
	{
		this.$indicator.css({ height: ScrollIndicator.scrlWidth+'px', bottom: '0px', left: '0px' });
	}
	
	this.scrollProc();
};

ScrollIndicator.prototype.destroy = function()
{
	//if(afc.isIos) return;
	
	if(this.timer) 
	{
		clearInterval(this.timer);
		this.timer = null;
	}

	AEvent.unbindEvent(this.scrlElement, 'scroll', this.scrlFunc);
	
	this.scrlElement = null;
	this.scrlFunc = null;
	
	this.$indicator.remove();
	this.$indicator = null;
};

ScrollIndicator.prototype.hide = function()
{
	//if(afc.isIos) return;
	
	if(this.isVisible)
	{
		if(this.timer) 
		{
			clearInterval(this.timer);
			this.timer = null;
		}

		this.$indicator.hide();
		this.isVisible = false;
	}
};

ScrollIndicator.prototype.setStyle = function(styleObj)
{
	this.$indicator.css(styleObj);
};

ScrollIndicator.prototype.disableHide = function()
{
	this.isNoHide = true;
};


//delegator is function
ScrollIndicator.prototype.resetScrollPos = function(callback)
{
	this.resetCallback = callback;
};

ScrollIndicator.prototype.setScrollOffset = function(scrollOffset)
{
	this.scrollOffset = scrollOffset;
};

ScrollIndicator.prototype.scrollProc = function()
{
	var thisObj = this, ratio, indi = this.$indicator[0];
	
	
	this.scrlFunc = function(e)
	{
		thisObj.checkTime = Date.now();
	
		if(!thisObj.isVisible) thisObj.show();
		
		if(thisObj.isScrollVert)
		{
			ratio = this.scrollTop/thisObj.scrollArea;					//비율 = 스크롤위치 / 스크롤 가능 전체영역
			indi.style.top = (thisObj.posArea*ratio+thisObj.scrollOffset)+'px';
		}
		else
		{
			ratio = this.scrollLeft/thisObj.scrollArea;
			indi.style.left = (thisObj.posArea*ratio+thisObj.scrollOffset)+'px';
		}
	};
	
	AEvent.bindEvent(this.scrlElement, 'scroll', this.scrlFunc);
	
	//최초 초기화 시점에 잠시 보여준다.
	setTimeout(function()
	{
		if(!thisObj.isVisible) thisObj.show();
		
	}, 500);
};

ScrollIndicator.prototype.show = function()
{
	if(!this.$indicator) return;
	
	var scrlEle = this.scrlElement, indiSize;
	
	if(this.isScrollVert)
	{
		//스크롤 가능한 영역
		this.scrollArea = scrlEle.scrollHeight - scrlEle.clientHeight;
		
		//스크롤 영역이 없는 경우는 안보여준다.
		if(this.scrollArea < 1) return;
	
		//차지하는 비율을 구한 뒤 스크롤-인디케이터의 높이를 지정한다.
		indiSize = scrlEle.clientHeight * (scrlEle.clientHeight / scrlEle.scrollHeight);
		this.$indicator.css('height', indiSize+'px');

		//인디케이터 높이를 제외한 영역
		this.posArea = scrlEle.clientHeight - indiSize;
	}
	else
	{
		//스크롤 가능한 영역
		this.scrollArea = scrlEle.scrollWidth - scrlEle.clientWidth;
		
		//스크롤 영역이 없는 경우는 안보여준다.
		if(this.scrollArea < 1) return;
	
		//차지하는 비율을 구한 뒤 스크롤-인디케이터의 높이를 지정한다.
		indiSize = scrlEle.clientWidth * (scrlEle.clientWidth / scrlEle.scrollWidth);
		this.$indicator.css('width', indiSize+'px');

		//인디케이터 높이를 제외한 영역
		this.posArea = scrlEle.clientWidth - indiSize;
	}
	
	if(this.resetCallback) 
	{
		this.resetCallback.call(this);
	}
	
	this.$indicator.show();
	
	this.isVisible = true;
	
	if(!this.isNoHide) this.checkScrollStop();
};

ScrollIndicator.prototype.checkScrollStop = function()
{
	var thisObj = this;
	
	if(!this.timer)
	{
		thisObj.checkTime = Date.now();
		
		this.timer = setInterval(function()
		{
			if(Date.now()-thisObj.checkTime > 500)
			{
				clearInterval(thisObj.timer);
				thisObj.timer = null;
				
				if(!thisObj.isNoHide)
				{
					thisObj.$indicator.fadeOut(300, function()
					{
						thisObj.isVisible = false;
					});
				}
			}
		
		}, 200);
	}
	
};