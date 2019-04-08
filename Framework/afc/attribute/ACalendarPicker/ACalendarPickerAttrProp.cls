
/**
Constructor
Do not call Function in Constructor.
*/
@class ACalendarPickerAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ACalendarPicker/';

}
@extends BaseProp;


@function ACalendarPickerAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Data', this.attrPath+'Data.lay');
	
	this.insertCommonAttr();
};

@function ACalendarPickerAttrProp:makeAttrView(attrInfo)
{
	var view, p, arr, i;
	
	for(p in attrInfo)
	{
		view = new _AView();
		view.init();
		view.setStyleObj({left:'0px', top:'0px', width:'100%', height:'auto', 'padding':'0px 10px 10px 10px'});
		
		arr = attrInfo[p];
		
		for(i=0; i<arr.length; i++)
		{
			this.addAttrComp(arr[i], view);
		}
		
		//view.$ele.children().css({'position':'relative', left:'0px', top:'0px', 'float':'left'});
		view.$ele.children().css({'position':'relative', 'float':'left'});
		
		this.acc.insertItem(p, view.$ele);
	}
	
};


@function ACalendarPickerAttrProp:addAttrComp(info, view)
{
	var label = new _ALabel();
	label.init();
	label.setText(info.label);
	label.$ele.css( {'margin-top':'10px', 'width':'30%', 'height':'25px'} );
	view.addComponent(label);
	
	
	var comp = null;
	
	if(info.control=='input-text')
	{
		comp = new _ATextField();
		comp.init();
		comp.setText('');
		comp.addEventListener('change', this, 'onTextValueChange');
	}
	else if(info.control=='input-number')
	{
		comp = new _ATextField();
		comp.init();
		comp.setText('');
	}
	
	else if(info.control=='color-picker')
	{
		comp = new _AImage();
		comp.init();
		comp.$ele.css({'border':'1px solid black'});
	}
	
	else if(info.control=='select')
	{
		comp = new _ASelectBox();
		comp.init();
	}
	
	else if(info.control=='check')
	{
		comp = new _ACheckBox();
		comp.init();
	}
	
	else if(info.control=='input-style')
	{
		comp = new _ATextField();
		comp.init();
		comp.setText('');
		
		comp.$ele.css( {'margin-top':'10px', width:'50%', height:'25px'} );
		view.addComponent(comp);
		
		
		comp = new _AButton();
		comp.init();
		comp.setText('...');
		
		comp.$ele.css( {'margin-top':'10px', 'margin-left':'10px', width:'25px', height:'25px'} );
		view.addComponent(comp);
		
		return;
	}
	
	if(comp) 
	{
		comp.$ele.css( {'margin-top':'10px', width:'70%', height:'25px'} );
		view.addComponent(comp);
		
		comp.setComponentId(info.property);
		comp.setGroupName(info.function);
		
	}
	
};

