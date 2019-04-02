
/**
Constructor
Do not call Function in Constructor.
*/
class DnDListView()
{
	super();
	
	this.dragInx = -1;
	
	this.option.longTabClass = 'sys_border_cyan';
	
}
extends AListView;


DnDListView.dndManager = new DnDManager('_dnd_listview_');

DnDListView.regDrag = function(item, listener)
{
	DnDListView.dndManager.regDrag(item, listener);
};

DnDListView.regDrop = function(item, listener)
{
	DnDListView.dndManager.regDrop(item, listener);
};

function DnDListView:init(context, evtListener)
{
	super.init(context, evtListener);
	
	//리스트뷰 자체에도 드랍이 가능하도록
	DnDListView.regDrop(this.element, this);
};

function DnDListView:createItems(url, dataArray, posItem, isPrepend)
{
	var newItems = super.createItems(url, dataArray, posItem, isPrepend);
	
	var item;
	for(var i=0; i<newItems.length; i++)
	{
		item = newItems[i];
		
		item.view.addEventListener('longtab', this, 'onViewLongTab');
		
		//리스트뷰 아이템에 드랍이 가능하도록
		DnDListView.regDrop(item, this);
	}
	
	return newItems;
};

function DnDListView:getDragInx()
{
	return this.dragInx;
};


function DnDListView:onViewLongTab(comp, info)
{
	this.dragInx = this.indexOfItem(comp.item);
	
	if(this.option.longTabClass)
		$(comp.item).addClass(this.option.longTabClass);
	
	DnDListView.regDrag(comp.item, this);
};

@function DnDListView:onDragStart(dnd, e)
{
};

@function DnDListView:onDragEnd(dnd, e)
{
	console.log('on drag end');
	
	
	if(this.option.longTabClass)
		$(e.target).removeClass(this.option.longTabClass);
};

//---------------------------------------------------------------------------------------

@function DnDListView:onDragEnter(dnd, e)
{
	console.log('on drag enter');
	
	
	if(this.option.longTabClass)
		$(e.target).addClass(this.option.longTabClass);
	
	
	/*
	var dropEle = e.target;
	if(dnd.isQuery)
	{
		//drag enter 후에 drag leave 가 발생하는 순서를 바꾸기 위해
		setTimeout(function()
		{
			$(dropEle).addClass('tree-over');
		}, 0);
	}
	*/
};

@function DnDListView:onDragLeave(dnd, e)
{
	console.log('on drag leave');

	if(this.option.longTabClass)
		$(e.target).removeClass(this.option.longTabClass);

	/*
	var dropEle = e.target;
	if(dnd.isQuery)
	{
		$(dropEle).removeClass('tree-over');
	}
	*/
};

//----------------------------------------------------------
//  delegate functions
//  function onItemMoved(dragItem, dropItem, alistview);
//----------------------------------------------------------

@function DnDListView:onElementDrop(dnd, e, dragEle)
{
	var dropEle = e.currentTarget;
	
	//리스트뷰 자체에 드랍한 경우
	if(dropEle===this.element) this.itemInsertManage(dragEle);
	else this.itemInsertManage(dragEle, dropEle, true);
	
	if(this.delegator && this.delegator.onItemMoved) this.delegator.onItemMoved(dragEle, dropEle, this);
};



