/**
 * @author asoocool
 */



function _ComponentMover(obj)
{
	this.obj = obj;
	
	this.isDraggable = false;
	this.isDroppable = false;
	
	this.touchStart = null;
	this.touchMove = null;
	this.touchEnd = null;
	this.touchCancel = null;
	
	this.option = 
	{
		startDistance: 10,
		isDropPropagation: false,
		direction: _ComponentMover.DIR_BOTH 
	};
	
	this.dragBound = null; //{left:0, top:0, right:0, bottom:0};
	this.offsetX = 0;
	this.offsetY = 0;
}

_ComponentMover.DROP_CLASS = '_afc_droppable_';
_ComponentMover.DIR_BOTH = 0;
_ComponentMover.DIR_VERTICAL = 1;
_ComponentMover.DIR_HORIZENTAL = 2;

_ComponentMover.prototype.setOption = function(option)
{
	for(var p in option)
	{
		if(option.hasOwnProperty(p)) 
			this.option[p] = option[p];
	}
};

_ComponentMover.prototype.setDragBound = function(bound)
{
	this.dragBound = bound;
};

_ComponentMover.prototype.setOffset = function(offsetX, offsetY)
{
	this.offsetX = offsetX;
	this.offsetY = offsetY;
};

_ComponentMover.prototype.setMoveComp = function(obj)
{
	this.obj = obj;
};

_ComponentMover.prototype.enableDrag = function(isEnable, dragEle)
{
	if(this.isDraggable==isEnable) return;
	
    this.isDraggable = isEnable;
    
    var thisObj = this, $moveEle, $dragEle;
    
    //listview item
    if(this.obj.item) $moveEle = $dragEle = $(this.obj.item);
	else if(this.obj.title) 
	{
		$moveEle = this.obj.$ele;
		$dragEle = $(this.obj.title);
	}
    else $moveEle = $dragEle = this.obj.$ele;
	
	if(dragEle) $dragEle = $(dragEle);
    
    if(this.isDraggable)
    {
		var dragSX, dragSY, isStart, isDown = false;
		
		function _dragSet(e)
		{
			var touchs = e.changedTouches[0],
				//touchX = touchs.clientX, touchY = touchs.clientY;
				touchX = touchs.pageX, touchY = touchs.pageY; 
				
			dragSX = touchX;
			dragSY = touchY;
			
			isStart = false;
			
			//미리 동작시켜두면 속도가 향상된다. 0.001 타임을 조금이라도 줘야 함. for mobile
			//drag test
			$moveEle.anima({translateX:0, translateY:0}, 0.001, 'linear');
		}

		this.touchStart = function(e) 
		{
			isDown = true;
		
			//e.preventDefault();
			//e.stopPropagation();
			
			_dragSet(e);
		};

		this.touchMove = function(e) 
		{
			if(!isDown) return;
			
			e.preventDefault();
			e.stopPropagation();
			
			var touchs = e.changedTouches[0];
			
			//drag test
			//var touchX = touchs.clientX, touchY = touchs.clientY; 
			var touchX = touchs.pageX, touchY = touchs.pageY,
				distX = touchX - dragSX, distY = touchY - dragSY;
			
			//if(Math.abs(distX)<thisObj.option.startDistance && Math.abs(distY)<thisObj.option.startDistance) return;
			
			if(thisObj.dragBound)
			{
				if(touchX<thisObj.dragBound.left) touchX = thisObj.dragBound.left;
				else if(touchX>thisObj.dragBound.right) touchX = thisObj.dragBound.right;
				
				if(touchY<thisObj.dragBound.top) touchY = thisObj.dragBound.top;
				else if(touchY>thisObj.dragBound.bottom) touchY = thisObj.dragBound.bottom;
			}
			
			switch(thisObj.option.direction)
			{
				case 0: $moveEle.anima({translateX:distX, translateY:distY}, 0, 'linear'); break;
				case 1: $moveEle.anima({translateY:distY}, 0, 'linear'); break;
				case 2: $moveEle.anima({translateX:distX}, 0, 'linear'); break;
			}
			
			if(!isStart)
			{
				isStart = true;
				
				//이벤트로 처리하지 말고 함수 오버라이딩으로 처리
				//dragComp.reportEvent('dragStart', touchs, 1);
				
				//temp code
				//if(thisObj.obj.onDragStart)
				//	thisObj.obj.onDragStart();
			}
		};

		this.touchEnd = function(e) 
		{
			if(!isDown) return;
			isDown = false;
		
			e.preventDefault();
			e.stopPropagation();
			
			var touchs = e.changedTouches[0];
			//var touchX = touchs.clientX, touchY = touchs.clientY;
			var touchX = touchs.pageX, touchY = touchs.pageY; 
			
			if(thisObj.dragBound)
			{
				if(touchX<thisObj.dragBound.left) touchX = thisObj.dragBound.left+1;
				else if(touchX>thisObj.dragBound.right) touchX = thisObj.dragBound.right-1;
				
				if(touchY<thisObj.dragBound.top) touchY = thisObj.dragBound.top+1;
				else if(touchY>thisObj.dragBound.bottom) touchY = thisObj.dragBound.bottom-1;
			}
			
			//drag reset
			$moveEle.css(
			{
				'-webkit-transform': '',
				'-webkit-transition-property': '',
				'-webkit-transition-duration': '',
				'-webkit-transition-timing-function': '',
				'-webkit-transition-delay': ''
			});
			
			var pos = $moveEle.position();
			
			//drag test
			$moveEle.css(
			{
				left: (pos.left + touchX - dragSX)+'px', 
				top: (pos.top + touchY - dragSY)+'px',
			});
			
			//dragComp.reportEvent('dragEnd', touchs, 1);
		};
		
		this.touchCancel = function(e) 
		{
			thisObj.touchEnd(e);
			
			//e.preventDefault();
			//e.stopPropagation();
			//dragComp.reportEvent('dragFail', touchs);
		};

		_AEvent.bindEvent($dragEle[0], _AEvent.ACTION_DOWN, this.touchStart);
		_AEvent.bindEvent($dragEle[0], _AEvent.ACTION_MOVE, this.touchMove);
		_AEvent.bindEvent($dragEle[0], _AEvent.ACTION_UP, this.touchEnd);
		_AEvent.bindEvent($dragEle[0], _AEvent.ACTION_CANCEL, this.touchCancel);
	}
	else
	{
		_AEvent.unbindEvent($dragEle[0], _AEvent.ACTION_DOWN, this.touchStart);
		_AEvent.unbindEvent($dragEle[0], _AEvent.ACTION_MOVE, this.touchMove);
		_AEvent.unbindEvent($dragEle[0], _AEvent.ACTION_UP, this.touchEnd);
		_AEvent.unbindEvent($dragEle[0], _AEvent.ACTION_CANCEL, this.touchCancel);
		
		this.touchStart = null;
		this.touchMove = null;
		this.touchEnd = null;
		this.touchCancel = null;
		
		$moveEle.css(
		{
			'-webkit-transform': '',
			'-webkit-transition-property': '',
			'-webkit-transition-duration': '',
			'-webkit-transition-timing-function': '',
			'-webkit-transition-delay': ''
		});
	}
};

_ComponentMover.prototype.enableDrop = function(isEnable)
{
	if(this.isDroppable==isEnable) return;
	
    this.isDroppable = isEnable;
    
    var dropEle = null;
    
    //listview item
    if(this.obj.item) dropEle = $(this.obj.item);
    else dropEle = this.obj.$ele;
    
    if(this.isDroppable) dropEle.addClass(_ComponentMover.DROP_CLASS);
	else dropEle.removeClass(_ComponentMover.DROP_CLASS);
};

