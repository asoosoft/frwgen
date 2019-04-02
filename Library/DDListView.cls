
/**
Constructor
Do not call Function in Constructor.
*/
class DDListView()
{
	super();
	
	this.dragInx = -1;
	this.direction = DDManager.DIR_VERTICAL;
}
extends AListView;


function DDListView:init(context, evtListener)
{
	super.init(context, evtListener);
	
	this.option.longTabClass = 'sys_box_shadow';
	this.option.removeClassDelay = 700;
	this.option.isLongTabDrag = true;
	this.option.offsetX = 0;
	this.option.offsetY = 0;
	

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
			item.view.addEventListener('longtab', this, 'onViewLongTab');
	}
	
	return newItems;
};

function DDListView:getDragInx()
{
	return this.dragInx;
};

function DDListView:setDirection(direction)
{
	this.direction = direction;
};

function DDListView:changeDragState(dragComp)
{
	this.dragInx = this.indexOfItem(dragComp.item);
	
	if(this.option.longTabClass)
		dragComp.$ele.addClass(this.option.longTabClass);
		
	$(dragComp.item).css('position', 'relative');
	
	dragComp.enableDrag(true, this.option.offsetX, this.option.offsetY, this);
	dragComp.ddManager.setDDOption({direction:this.direction});
	dragComp.ddManager.setDragBound(this.getBoundRect());
};

function DDListView:onViewLongTab(comp, info, e)
{
	//this.aevent.isTouchLeave = true;

	this.changeDragState(comp);
};


function DDListView:onDragStart(dragComp, e)
{
	
};

function DDListView:onDragEnd(dragComp, e)
{
	
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
	
	$(dragComp.item).css('position', 'static');
	
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
		//this.itemInsertManage(dragComp.item);
		
		this.itemInsertManage(dragComp.item, dragComp.item, true);
		
		dropComp = null;
	}
	else
	{
		if(dropComp.item && e.clientY > 0)
		{
			this.itemInsertManage(dragComp.item, dropComp.item, false);
		}
		else this.itemInsertManage(dragComp.item, dropComp.item, true);
	}
	
	if(this.delegator && this.delegator.onItemMoved) this.delegator.onItemMoved(dragComp, dropComp, this);
};
