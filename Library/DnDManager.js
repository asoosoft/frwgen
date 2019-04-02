/**
 * @author asoocool
 */


function DnDManager(dndId)
{
	this.dndId = dndId;
	
	this.dragOption =
	{
		dragImage: null,
		imageOffset: {x:0, y:0},
	};
	
	this.dropOption =
	{
		applyChild: true,	//자식 element 까지 drop 이벤트가 적용되도록
		hoverClass: null,
	};
	
	var tm = new Date().getTime().toString();
	
	this.dndGroup = '_' + tm + dndId;
	
	//this.dragImg = new Image();
	//this.dragImg.src = 'Source/img/Actions-go-next-icon.png';
	//this.dragImg = null;
	
}

//jquery draggable option
DnDManager.prototype.setDragOption = function(option)
{
	for(var p in option)
	{
		if(option.hasOwnProperty(p))
			this.dragOption[p] = option[p];
	}
};

DnDManager.prototype.setDropOption = function(option)
{
	for(var p in option)
	{
		if(option.hasOwnProperty(p))
			this.dropOption[p] = option[p];
	}
};

DnDManager.prototype.getApplyDragOption = function(option, key)
{
	if(option && option[key]!=undefined) return option[key];
	else return this.dragOption[key];
};

//기본 옵션을 가져와 적용을 하지만
//추가적인 옵션이 파라미터로 있다면 그 옵션값을 우선으로 한다.
DnDManager.prototype.getApplyDropOption = function(option, key)
{
	if(option && option[key]!=undefined) return option[key];
	else return this.dropOption[key];
};

DnDManager.prototype.unregDrag = function(element)
{
	if(element.length)
	{
		for(var i=0; i<element.length; i++)
			_unreg_drag(element[i]);
	}
	else $(element).each(function() { _unreg_drag(this); });
	
	function _unreg_drag(ele)
	{
		var $ele = $(ele);
		
		$ele.removeAttr('draggable');
		$ele.off('dragstart');
		$ele.off('dragend');
	}

};

DnDManager.prototype.unregDrop = function(element)
{
	if(element.length)
	{
		for(var i=0; i<element.length; i++)
			_unreg_drop(element[i]);
	}
	else $(element).each(function() { _unreg_drop(this); });
	
	function _unreg_drop(ele)
	{
		var $ele = $(ele);
	
		$ele.off('dragenter');
		$ele.off('dragleave');
		$ele.off('dragover');
		$ele.off('drop');
	}
};


//-------------------------------------------
//	* listener event functions *
//	function onDragStart(DnDManager, event);
//	function onDragEnd(DnDManager, event);
//---------------------------------------------------------
//	* param
//	element : 드래그 하려는 컴포넌트의 element
//	listener : 드래그 관련 이벤트 수신 리스너
//	option : 드래그 옵션
//	this.ddm.regDragManage(this.dragComp.element, this, 
//	{
//		dragImage: img, 			// image object --> img = new Image(), img.src = 'assets/icon.gif';
//		imageOffset: {x:20, y:20}	// image offset
//	});

DnDManager.prototype.regDrag = function(element, listener, option)
{
	var thisObj = this;

	if(element.length)
	{
		for(var i=0; i<element.length; i++)
			_drag_helper(element[i]);
	}
	else $(element).each(function() { _drag_helper(this); });
	
	function _drag_helper(ele)
	{
		if(ele.getAttribute('draggable')) return;
		
		ele.setAttribute('draggable', 'true');
		
		
		var dragImage = thisObj.getApplyDragOption(option, 'dragImage'), imgObj = null;
		
		if(dragImage) 
		{
			if(typeof dragImage == 'string')
			{
				imgObj = new Image();
				imgObj.src = dragImage;
			}
			else
			{
				imgObj = dragImage;
			}
			
			//$('body').append(imgObj);
		}
		
		
		ele.addEventListener('dragstart', function(e)
		{
			//console.log('drag start');
			
			$(e.target).addClass(thisObj.dndGroup);
			
			//e.dataTransfer.setData('text/html', '_drag_start_');
			//e.dataTransfer.effectAllowed = 'all';
			//e.dataTransfer.dropEffect = 'none';
			//e.dataTransfer.effectAllowed = thisObj.dragEffect;
			
			if(imgObj) 
			{
				var offset = thisObj.getApplyDragOption(option, 'imageOffset');
				
				if(!afc.isIE) e.dataTransfer.setDragImage(imgObj, offset.x, offset.y);
			}
			
			if(listener && listener.onDragStart) listener.onDragStart(thisObj, e);
			
		}, false);
		
		ele.addEventListener('dragend', function(e)
		{
			//console.log('drag end');
			
			$(e.target).removeClass(thisObj.dndGroup);
			
			if(listener && listener.onDragEnd) listener.onDragEnd(thisObj, e);
		
		}, false);
	}
};

//-------------------------------------------
//	* listener event functions *
//	function onDragEnter(DnDManager, event);
//	function onDragLeave(DnDManager, event);
//	function onElementDrop(DnDManager, event, dragElement);
//---------------------------------------------------------
//	param
//	element : 드랍 하려는 컴포넌트의 element
//	listener : 드랍 관련 이벤트 수신 리스너
//	option : 드랍 옵션
//	this.ddm.regDrop(this.dropTrg1.element, this, 
//	{ 
//		hoverClass: 'drag_over',	//드래그 element 가 자신의 위로 올라왔을 때 활성화될 클래스
//		applyChild: true			//자식 element 까지 drop 이벤트가 적용되도록, false 이면 over target 이 등록 element 와 같은 경우만 발생.
//	});
	
DnDManager.prototype.regDrop = function(element, listener, option)
{
	var thisObj = this,
		applyChild = this.getApplyDropOption(option, 'applyChild');

	if(element.length)
	{
		for(var i=0; i<element.length; i++)
			_drop_helper(element[i]);
	}
	else $(element).each(function() { _drop_helper(this); });
	
	
	function _apply_hoverClass(evt, isAdd)
	{
		var hoverClass = thisObj.getApplyDropOption(option, 'hoverClass');
		
		if(hoverClass) 
		{
			var targetEle = evt.currentTarget;
			if(applyChild) targetEle = evt.target;

			if(isAdd) $(targetEle).addClass(hoverClass);
			else $(targetEle).removeClass(hoverClass);
		}
	}
	
	function _drop_helper(ele)
	{
		ele.addEventListener('dragenter', function(e)
		{
			e.stopPropagation();
			
			//자식까지 적용하는 옵션이 아니면 target 과 등록 element 가 같은 경우만 
			
			if(applyChild || ele===e.target)
			{
				var hoverClass = thisObj.getApplyDropOption(option, 'hoverClass');
				if(hoverClass) $(e.target).addClass(hoverClass);
				
				if(listener && listener.onDragEnter) listener.onDragEnter(thisObj, e);
			}
			
			//_apply_hoverClass(e, true);
			
			//if(listener && listener.onDragEnter) listener.onDragEnter(thisObj, e);

		}, false);
		
		ele.addEventListener('dragleave', function(e)
		{
			e.stopPropagation();
			
			
			if(applyChild || ele===e.target)
			{
				var hoverClass = thisObj.getApplyDropOption(option, 'hoverClass');
				if(hoverClass) $(e.target).removeClass(hoverClass);
				
				if(listener && listener.onDragLeave) listener.onDragLeave(thisObj, e);
			}
			
			
			//_apply_hoverClass(e, false);
			
			//if(listener && listener.onDragLeave) listener.onDragLeave(thisObj, e);
			
		
		}, false);
		
		ele.addEventListener('dragover', function(e)
		{
			e.preventDefault();
			e.stopPropagation();
			
			//if(listener) listener.onDragOver(thisObj, e);
			
		}, false);
		
		ele.addEventListener('drop', function(e)
		{
			e.stopPropagation();
			
			
			if(applyChild || ele===e.target)
			{
				var hoverClass = thisObj.getApplyDropOption(option, 'hoverClass');
				if(hoverClass) $(e.target).removeClass(hoverClass);
			
				if(listener && listener.onElementDrop)
				{
					var $drag = $('.'+thisObj.dndGroup);
					if($drag.length>0) 
						listener.onElementDrop(thisObj, e, $drag[0]);
				}
			}
			
			/*
			_apply_hoverClass(e, false);
			
			if(listener && listener.onElementDrop)
			{
				var $drag = $('.'+thisObj.dndGroup);
				if($drag.length>0) 
					listener.onElementDrop(thisObj, e, $drag[0]);
			}
			*/
			
			
		}, false);
	}
	
};

