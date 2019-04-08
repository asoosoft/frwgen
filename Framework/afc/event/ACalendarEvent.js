/**
 * @author asoocool
 */

function ACalendarEvent(acomp)
{
	AEvent.call(this, acomp);

	this.bScrollBind = false;
	this.isTouchLeave = true;
	
	//this.longtabBind = false;
	//this.dblclickBind = false;
}
afc.extendsClass(ACalendarEvent, AEvent);


/*
ACalendarEvent.prototype.defaultAction = function()
{
	this._scroll();
};
*/

//---------------------------------------------------------------------------------------------------
//	Component Event Functions

ACalendarEvent.prototype.scrolltop = function()
{
	this._scroll();
};

ACalendarEvent.prototype.scrollbottom = function()
{
	this._scroll();
};

ACalendarEvent.prototype.longtab = function()
{
	this.longtabBind = true;
};

ACalendarEvent.prototype.dblclick = function()
{
	this.dblclickBind = true;
};



//---------------------------------------------------------------------------------------------------

ACalendarEvent.prototype._scroll = function()
{
	if(this.bScrollBind) return;
	this.bScrollBind = true;
	
	var agrid = this.acomp;

	agrid.scrollArea[0].addEventListener('scroll', function(e)
	{
		//console.log(this.scrollHeight-this.clientHeight-this.scrollTop);
		//console.log(this.scrollTop);
		
		//scroll bottom
		if(this.scrollHeight-this.clientHeight-this.scrollTop <= 1)
		{
//console.log('scroll bottom');	
			if(agrid.scrollBottomManage())
				agrid.reportEvent('scrollbottom', e);	
		}
		
		//scroll top
		else if(this.scrollTop == 0)
		{
//console.log('scroll top');				
			if(agrid.scrollTopManage())
				agrid.reportEvent('scrolltop', e);
		}
	});
};

//cell, row 이벤트 처리
ACalendarEvent.prototype._select = function(clkEle)
{
	if(!clkEle) return;
	
	var thisObj = this;
	var agrid = this.acomp, timeout = null;
	var startX = 0, startY = 0;

	for(var i = 0; i < clkEle.length; i++)
	{
		AEvent.bindEvent(clkEle[i], AEvent.ACTION_DOWN, function(e)
		{
			thisObj.isTouchLeave = false;

			//자체적으로 스크롤을 구현하고 현재 스크롤이 진행중일 경우는 셀렉트 이벤트를 발생시키지 않는다. 
			if(agrid.scrlManager &&  agrid.scrlManager.scrlTimer)
			{
				thisObj.isTouchLeave = true;
				return;
			}

			var oe = e.changedTouches[0];
			startX = oe.clientX;
			startY = oe.clientY;

			timeout = setTimeout(function() 
			{
				timeout = null;
				if(!thisObj.isTouchLeave)
				{
					agrid.selectCell(clkEle);
				}

			}, 300);
		});

		AEvent.bindEvent(clkEle[i], AEvent.ACTION_MOVE, function(e)
		{
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
				agrid.deselectCell(clkEle);
			}
		});

		AEvent.bindEvent(clkEle[i], AEvent.ACTION_UP, function(e)
		{
			if(thisObj.isTouchLeave) return;

			thisObj.isTouchLeave = true;

			if(timeout)
			{
				clearTimeout(timeout);
				timeout = null;
			}
			
			if(agrid.timeout) 
	        {
	        	clearTimeout(agrid.timeout);
	        	agrid.timeout = null;
	        }

			agrid.selectCell(clkEle);
			
            // agrid.date.day = clkEle.text();
			// agrid.selectEvent();
			
			// var date = agrid.date;
			agrid.date.day = clkEle.text();
			// agrid.dataField.value = date.year + '-' + date.month + '-' + date.day;
			agrid.reportEventDelay('select', clkEle, 100);
		});
		
		AEvent.bindEvent(clkEle[i], AEvent.ACTION_CANCEL, function(e)
		{
			thisObj.isTouchLeave = true;
			if(timeout) 
			{
				clearTimeout(timeout);
				timeout = null;
			}
			agrid.deselectCell(clkEle);
		});
	}
};

//cell, row 이벤트 처리
ACalendarEvent.prototype._longtab = function(clkEle)
{
	if(!clkEle || !this.longtabBind) return;
	//if(!this.longtabBind) return;
	
	//var thisObj = this;
	var thisObj = this, agrid = this.acomp, timeout = null, startX = 0, startY = 0;
	
	clkEle.each(function(i, ele)
	{
		AEvent.bindEvent(ele, AEvent.ACTION_DOWN, function(e)
		{
			if(!agrid.option.isSelectable || e.touches.length > 1) return;
			
			if((new Date().getTime() - AEvent.TOUCHTIME) < afc.DISABLE_TIME) return; 

			thisObj.actionDownState();
			
			var oe = e.changedTouches[0];
			startX = oe.clientX;
			startY = oe.clientY;
	        
	        agrid.timeout = setTimeout(function()
	        {
				thisObj.isTouchLeave = true;
	        	agrid.timeout = null;
				//ele.e = e;
				//ele.rowset = clkEle;
	            agrid.reportEvent('longtab', ele);
	            
	        }, 700);
	        
		});
		
		AEvent.bindEvent(ele, AEvent.ACTION_MOVE, function(e)
		{
			var oe = e.changedTouches[0];
			if(Math.abs(oe.clientX - startX) > AEvent.TOUCHLEAVE || Math.abs(oe.clientY - startY) > AEvent.TOUCHLEAVE)
			{
				if(agrid.timeout) 
				{
					clearTimeout(agrid.timeout);
					agrid.timeout = null;
				}

				thisObj.actionMoveState();
				if(!afc.isSimulator) AEvent.TOUCHTIME = new Date().getTime();
			}
		
		});
		
		AEvent.bindEvent(ele, AEvent.ACTION_UP, function(e)
		{
			if(!agrid.option.isSelectable) return;
			
			if(agrid.timeout) 
	        {
	        	clearTimeout(agrid.timeout);
	        	agrid.timeout = null;
	        }
			
			thisObj.actionUpState();
			
			if((new Date().getTime() - AEvent.TOUCHTIME) > afc.DISABLE_TIME) AEvent.TOUCHTIME = new Date().getTime();
			
		});
		
		AEvent.bindEvent(ele, AEvent.ACTION_CANCEL, function(e)
		{
			if(agrid.timeout) 
			{
				clearTimeout(agrid.timeout);
				agrid.timeout = null;
			}
		});
	});
};


ACalendarEvent.prototype._dblclick = function(clkEle)
{
	if(!this.dblclickBind) return;

	var thisObj = this;
	
	clkEle.each(function()
	{
		this.addEventListener('dblclick', function(e)
		{
			thisObj.acomp.reportEvent('dblclick', clkEle);
		});
	});
	
};
