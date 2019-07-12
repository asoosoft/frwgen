
/**
Constructor
Do not call Function in Constructor.
*/
class DDListView()
{
	super();
	
	this.dragInx = -1;
	//this.direction = DDManager.DIR_VERTICAL;
}
extends AListView;


window.onDDLViewLongTab = function(comp, info, e)
{
	comp.owner.changeDragState(comp, e);
};


function DDListView:init(context, evtListener)
{
	super.init(context, evtListener);
	
	
	this.setOption(
	{
		'longTabClass': 'sys_box_shadow',
		'removeClassDelay': 700,
		'isLongTabDrag': true,
		'allowGlobal': false,					//다른 컴포넌트로 드래그&드랍 가능여부
		'moveDir': DDManager.DIR_VERTICAL,
		'dropPrepend': true,						//아이템 드랍시, 드랍한 아이템 앞에 추가
		
    }, true);
	
	this.enableDrop(true, this);	//드랍 가능 상태로 만듬
};

function DDListView:createItems(url, dataArray, posItem, isPrepend)
{
	var newItems = super.createItems(url, dataArray, posItem, isPrepend);
	
	var item;
	for(var i=0; i<newItems.length; i++)
	{
		item = newItems[i];
		
		item.view.enableDrop(true, this);
		
		if(this.option.isLongTabDrag)
		{
			//드래그한 아이템들은 여러 다른 리스트뷰를 옮겨 다닐 수 있으므로 글로벌 함수로 셋팅해 둔다.
			item.view.addEventListener('longtab', window, 'onDDLViewLongTab');
		}
	}
	
	return newItems;
};

function DDListView:getDragInx()
{
	return this.dragInx;
};

//deprecated, use setOption({moveDir: direction});
/*
function DDListView:setDirection(direction)
{
	//this.direction = direction;
	this.option.moveDir = direction;
};
*/

function DDListView:enableGlobalDrag()
{
	this.setOption(
	{
		'allowGlobal': true,
		'moveDir': DDManager.DIR_BOTH
    });
};

function DDListView:changeDragState(dragComp, evt)
{
	this.dragInx = this.indexOfItem(dragComp.item);
	
	if(this.option.longTabClass)
		dragComp.$ele.addClass(this.option.longTabClass);
		
	//이동을 위해 속성을 바꿔준다.
	var rt = dragComp.item.getBoundingClientRect();

	$(dragComp.item).css(
	{
		'z-index': 99999,
		'position': 'relative',
		'left': rt.x+'px',
		'top': rt.y+'px',
		'width': rt.width+'px',
		'height': rt.height+'px'
	});

	//append to body
	theApp.rootContainer.$ele.append(dragComp.item);
	
	var touchX = 0, touchY = 0;
	
	if(evt)
	{
		var touchs = evt.changedTouches[0];
		
		touchX = rt.x - touchs.clientX;
		touchY = rt.y - touchs.clientY;
	}

	dragComp.ddManager.setDDOption(
	{
		direction: this.option.moveDir,
	});

	dragComp.enableDrag(true, touchX, touchY, this);
	
	
	if(this.option.allowGlobal) dragComp.ddManager.setDragBound(null);
	else dragComp.ddManager.setDragBound(this.getBoundRect());
};

/*	필요시 주석 풀기
function DDListView:onDragStart(dragComp, e)
{
	
};
*/

function DDListView:onDragEnd(dragComp, e)
{
	$(dragComp.item).css(
	{
		'z-index': '',
		'position': '',
		'left': '',
		'top': '',
		'width': '',
		'height': ''
	});
};

function DDListView:onDropFail(dragComp, e)
{
	dragComp.enableDrag(false);	
	
	if(this.option.longTabClass)
	{
		var thisObj = this;
		setTimeout(function()
		{
			dragComp.$ele.removeClass(thisObj.option.longTabClass);
			
		}, this.option.removeClassDelay);
	}

	//자신의 원래 위치로 되돌리는 코드
	var posItem = this.getItem(this.dragInx);
	
	if(posItem) this.itemInsertManage(dragComp.item, posItem, true);
	else this.itemInsertManage(dragComp.item);
};

function DDListView:onDragScrollTop(dir)
{
	this.scrollArea[0].scrollTop += dir*10;
};


//----------------------------------------------------------
//  delegate functions
//  function onItemMoved(dragView, dropView, alistview);
//----------------------------------------------------------


//------------------------------------------------------------
//	e =>  { dragComp: comp, clientX:0, clientY:0 };

function DDListView:onCompDrop(dropComp, e)
{
	var dragComp = e.dragComp;

	dragComp.enableDrag(false);	
	
	if(this.option.longTabClass)
	{
		var thisObj = this;
		setTimeout(function()
		{
			dragComp.$ele.removeClass(thisObj.option.longTabClass);
			
		}, this.option.removeClassDelay);
	}
	
	//리스트뷰 자체에 드랍한 경우
	if(dropComp===this) 
	{
		//맨 뒤에 추가한다.
		this.itemInsertManage(dragComp.item);
		
		//자신의 원래 위치로 되돌리는 코드, 여기서 사용하지 말고, 필요시...delegator onItemMoved() 에서 처리한다.
		//var posItem = this.getItem(this.dragInx);
		//this.itemInsertManage(dragComp.item, posItem, true);		
		
		//받는 곳에서 null 인 경우 listview 자체임을 인지하기 위해
		dropComp = null;
	}
	
	else if(dropComp.item)
	{
		this.itemInsertManage(dragComp.item, dropComp.item, this.option.dropPrepend);
	}
	
	//새로운 리스트뷰로 드랍될 수 있으므로 dropListener 도 변경해 준다.
	dragComp.ddManager.setDropListener(this);
		
	
	//이런 경우는 발생하지 않는다. 
	//else 
	//{
	//}
	
	/*
	else
	{
		
		if(dropComp.item && e.clientY > 0)
		{
			this.itemInsertManage(dragComp.item, dropComp.item, false);
		}
		else this.itemInsertManage(dragComp.item, dropComp.item, true);
		
	}
	*/
	
	if(this.delegator && this.delegator.onItemMoved) this.delegator.onItemMoved(dragComp, dropComp, this);
};
