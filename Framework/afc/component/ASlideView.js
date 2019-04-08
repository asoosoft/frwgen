
/**
 * @author extrmk
 */

function ASlideView()
{
	AComponent.call(this);
	
	this.inx = 0;
	this.delegator = null;
}
afc.extendsClass(ASlideView, AComponent);

ASlideView.CONTEXT = 
{
    tag: '<div data-base="ASlideView" data-class="ASlideView" class="ASlideView-Style"></div>',

    defStyle: 
    {
        width:'400px', height:'200px'
    },

    //events: ['swipe', 'longtab', 'scroll', 'scrollleft', 'scrollright', 'scrolltop', 'scrollbottom', 'drop', 'dragStart', 'dragEnd' ]
    events: ['change']
};

ASlideView.prototype.init = function(context, evtListener)
{
	AComponent.prototype.init.call(this, context, evtListener);

/*
	this.setOption(
	{
		direction: this.getAttr('data-direction', 'horizontal'),	//슬라이드 뷰 스크롤 방향
		moveSpeed: this.getAttr('data-move-speed', 100),			//이동 속도
		moveUnit: this.getAttr('data-move-unit', 0),				//이동 단위
		easing: this.getAttr('data-easing'),						//감속 옵션, easeInQuad, easeOutQuad, easeInOutQuad, ... http://gsgd.co.uk/sandbox/jquery/easing/
		
	}, true);
*/

	this.setOption(
	{
		direction: this.getAttr('data-direction'),	//슬라이드 뷰 스크롤 방향
		moveSpeed: 100,			//이동 속도
		moveUnit: 0,			//이동 단위
		easing: 'linear',		//감속 옵션, easeInQuad, easeOutQuad, easeInOutQuad, ... http://gsgd.co.uk/sandbox/jquery/easing/
		
	}, true);


	this.enableScrlManager();
	this.selectBtn = null;
};

//---------------------------------------
//	deprecated, use setOption();
ASlideView.prototype.setSpeed = function(speed)
{
	this.option.moveSpeed = speed;
};

//---------------------------------------
//	deprecated, use setOption();
ASlideView.prototype.setEasing = function(easing)
{
	/*
	if(!jQuery.easing[easing])
	{
		alert('To use this value ' + easing + ', Add System Library : jquery-easing.js');
	}
	else this.easing = easing;
	*/
	
	this.option.easing = easing;
};

//---------------------------------------
//	deprecated, use setOption();
ASlideView.prototype.setMoveUnit = function(moveUnit)
{
	this.option.moveUnit = moveUnit;
};

ASlideView.prototype.enableScrlManager = function()
{
	if(this.scrlManager) return;
	
	this.scrlManager = new ScrollManager();
	this.scrlManager.setOption(
	{
		startDelay: 10,
		endDelay: 20,
		scrollAmount: 10,
		speedRatio: 0.03
	});
	
	this.$ele.css({'overflow':'auto', '-webkit-overflow-scrolling': '', 'z-index':0});	//가속을 위한 z-index 설정
	
	if(this.option.direction=='vertical') this.scrollYImplement();
	else this.scrollXImplement();
	
//	this.aevent._scroll();
};

//function bindData(view, dataArray[i], this);
ASlideView.prototype.setDelegator = function(delegator)
{
	this.delegator = delegator;	
};

ASlideView.prototype.setButtonView = function(buttonView)
{
	this.btnView = buttonView;
	
	var children = this.btnView.getChildren();
	
	for(var i=0; i<children.length; i++)
	{
		children[i].addEventListener('click', this, 'onBtnClick');
	}
	this.selectButton(children[0]);
};

ASlideView.prototype.onBtnClick = function(comp, info)
{
	var children = this.btnView.getChildren();
	
	for(var i=0; i<this.$ele.children().length; i++)
	{
		if(children[i] == comp)
		{
			this.slideTo(i, true);
			return;
		}
	}
};

ASlideView.prototype.selectButton = function(selBtn)
{
	if(this.selectBtn) this.selectBtn.enable(true);
	if(selBtn)
	{
		selBtn.enable(false);
		this.selectBtn = selBtn;
	}
};

//여러개의 url 을 동시에 추가한다. 단, urlArr 과 dataArr 은 1:1 로 매칭된다.
ASlideView.prototype.addItems = function(urlArr, dataArr, isPrepend, asyncCallback)
{
	var urlLen = urlArr.length, newItems = [];
	
	for(var i=0; i<urlArr.length; i++)
	{
		if(asyncCallback)
		{
			this.addItem(urlArr[i], [ dataArr[i] ], isPrepend, function(items)
			{
				newItems.push(items[0]);

				if(--urlLen==0 && typeof(asyncCallback)=='function') 
				{
					asyncCallback(newItems);
				}
			});
		}
		else
		{
			var items = this.addItem(urlArr[i], [ dataArr[i] ], isPrepend);
			newItems.push(items[0]);
		}
	}
	
	return newItems;
};

ASlideView.prototype.addItem = function(url, dataArray, isPrepend, asyncCallback)
{
    var thisObj = this, $item, item, aview, size,
		newItems = [], cssKey;
		
	var cssObj = 
	{
		"position": "absolute",
		"width": "100%",
		"height": "100%"
	};
		
	if(this.option.direction=='vertical') 
	{
		size = this.getHeight();
		cssKey = 'top';
	}
	else 
	{
		size = this.getWidth();
		cssKey = 'left';
	}
	
	var dataLen = dataArray.length;
	
	for(var i=0; i<dataArray.length; i++)
	{
        $item = $('<div></div>');
        item = $item[0];
		
		cssObj[cssKey] = (this.$ele.children().length*size)+'px';
		
		$item.css(cssObj);
        
		if(isPrepend) this.$ele.prepend(item);
		else this.$ele.append(item);
		
        item.itemData = dataArray[i];
        
        newItems.push(item);
		
		if(typeof(url) == 'string') 
		{
			if(asyncCallback) 
			{
				AView.createView(item, url, this, null, null, null, function(_aview)
				{
					thisObj._afterCreated(_aview);
					
					if(--dataLen==0 && typeof(asyncCallback)=='function') 
					{
						asyncCallback(newItems);
					}
				});
			}
			else 
			{
				aview = AView.createView(item, url, this);
				url = aview;
			}
		}
		else 
		{
			var compIdPrefix = afc.makeCompIdPrefix();

			aview = url.cloneComponent(compIdPrefix, function(cloneComp)
			{
				cloneComp.owner = thisObj;
			});

			AView.setViewInItem(aview, item, this);

			//속도에 이슈가 있어 timeout 을 주지 않고 바로 호출함.
			aview._initDoneManage(!thisObj.option.isUpdatePosition);
		}
		
		if(!asyncCallback) this._afterCreated(aview);
	}
	
	return newItems;
};

ASlideView.prototype._afterCreated = function(aview)
{
	if(this.delegator) this.delegator.bindData(aview.item, aview.item.itemData, this);

	//델리게이터를 셋팅하지 않으면 기본적으로 서브뷰의 setData 를 호출해 준다.
	else if(aview.setData) aview.setData(aview.item.itemData);
};

ASlideView.prototype.addDisableManager = function(disableManager)
{
	this.scrlManager.addDisableManager(disableManager);
	//같은 객체를 중복해서 추가해도 무시된다.
	disableManager.addDisableManager(this.scrlManager);
};

ASlideView.prototype.removeAllItems = function()
{
	this.getItems().each(function()
	{
		this.view.removeFromView();

		$(this).remove();
	});
	
	//슬라이드뷰 초기화(버튼뷰가 있다면 버튼 선택해제)
	this.inx = 0;
	if(this.btnView) this.selectButton();
};

ASlideView.prototype.getItem = function(index)
{
    return this.getItems()[index];
};

ASlideView.prototype.getItems = function()
{
    return this.$ele.children();
};

ASlideView.prototype.indexOfItem = function(item)
{
	return this.getItems().index(item);
};

ASlideView.prototype.slideTo = function(index, isReport)
{
	if(!this.option.moveUnit) 
	{
		if(this.option.direction=='vertical') this.option.moveUnit = this.getHeight();
		else this.option.moveUnit = this.getWidth();
	}
	
	var aniObj = {}, val = this.option.moveUnit*index;
	
	if(this.option.direction=='vertical') aniObj.scrollTop = val;
	else aniObj.scrollLeft = val;

	this.$ele.stop().animate(aniObj, this.option.moveSpeed, this.option.easing);
	
	if(this.inx!=index)
	{
		this.inx = index;
		
		if(this.btnView) this.selectButton(this.btnView.getChildren()[this.inx]);
		if(isReport) this.reportEvent('change', this.inx);
// 		if(this.delegator && this.delegator.onViewChanged) this.delegator.onViewChanged(this.inx, this);
	}
};

ASlideView.prototype.slidePrev = function()
{
	if(this.inx==0) this.inx = 1;
	
	this.slideTo(this.inx-1, true);
};

ASlideView.prototype.slideNext = function()
{
	if(this.inx+1==this.getItems().length) this.inx--;
	
	this.slideTo(this.inx+1, true);
};


ASlideView.prototype.scrollXImplement = function()
{
	//PC인 경우 자신의 영역 mousedown 과 상관없이 mousemove 가 무조건 발생한다.
	var thisObj = this, isDown = false, scrlArea = this.element;
	
	this.bindEvent(AEvent.ACTION_DOWN, function(e)
	{
		isDown = true;
		
		e.preventDefault();
		thisObj.scrlManager.initScroll(e.changedTouches[0].clientX);
	});
	
	this.bindEvent(AEvent.ACTION_MOVE, function(e)
	{
		if(!isDown) return;
		
		e.preventDefault();
		
		thisObj.scrlManager.updateScroll(e.changedTouches[0].clientX, function(move)
		{
			scrlArea.scrollLeft += move;
		});
	});
	
	this.bindEvent(AEvent.ACTION_UP, function(e)
	{
		if(!isDown) return;
		isDown = false;

		e.preventDefault();

		thisObj.scrlManager.scrollCheck(e.changedTouches[0].clientX, function(move)
		{
			var ratio = Math.abs(this.totDis)/thisObj.option.moveUnit;
			
//console.log(this.oldDis);
			
			if(ratio<0.2) thisObj.slideTo(thisObj.inx, true);//20%
			else if(this.totDis<0) thisObj.slidePrev();
			else if(this.totDis>0) thisObj.slideNext();
			else thisObj.slideTo(thisObj.inx, true);//20%
			
			return false;
		});
	});
};

ASlideView.prototype.scrollYImplement = function()
{
	//PC인 경우 자신의 영역 mousedown 과 상관없이 mousemove 가 무조건 발생한다.
	var thisObj = this, isDown = false, scrlArea = this.element;
	
	this.bindEvent(AEvent.ACTION_DOWN, function(e)
	{
		isDown = true;
		
		e.preventDefault();
		thisObj.scrlManager.initScroll(e.changedTouches[0].clientY);
	});
	
	this.bindEvent(AEvent.ACTION_MOVE, function(e)
	{
		if(!isDown) return;
		
		e.preventDefault();
		
		thisObj.scrlManager.updateScroll(e.changedTouches[0].clientY, function(move)
		{
			scrlArea.scrollTop += move;
		});
	});
	
	this.bindEvent(AEvent.ACTION_UP, function(e)
	{
		if(!isDown) return;
		isDown = false;

		e.preventDefault();

		thisObj.scrlManager.scrollCheck(e.changedTouches[0].clientY, function(move)
		{
			var ratio = Math.abs(this.totDis)/thisObj.option.moveUnit;
			
//console.log(this.oldDis);
			
			if(ratio<0.2) thisObj.slideTo(thisObj.inx, true);//20%
			else if(this.totDis<0) thisObj.slidePrev();
			else if(this.totDis>0) thisObj.slideNext();
			else thisObj.slideTo(thisObj.inx, true);//20%
			
			return false;
		});
	});
};


