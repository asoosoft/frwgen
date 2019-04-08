
/**
Constructor
Do not call Function in Constructor.
*/
@class ALabelAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ALabel/';

}
@extends BaseProp;


@function ALabelAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Data', this.attrPath+'Data.lay');

	//common
	this.insertCommonAttr();
};

@function ALabelAttrProp:onTextValueChange(comp, info)
{
	var compId = comp.getComponentId();
	var view = theApp.getLayoutView();
	
	if(compId=='Text')
	{
		this.applyValue(comp, info);
		if(view)
		{
			for(var i=0; i<this.selCompArr.length; i++)
			{
				var selComp = this.selCompArr[i];
				var id = selComp.getComponentId();
				view.getDocument().treeRename(selComp, id!=''?id:(selComp.getAttr(_afc.ATTR_CLASS) + ' "' + selComp.getText() + '"'));
			}
		}

		return;
	}
	
	@super.onTextValueChange(comp, info);
};

//asoocool 20180419
@function ALabelAttrProp:onCheckBtnClick(comp, info)
{
	var checked = comp.getCheck(),
		compId = comp.getComponentId();
	
	if(compId=='data-pre')
	{
		var selComp;
		for(var i=0; i<this.selCompArr.length; i++)
		{
			selComp = this.selCompArr[i];
			selComp.isPre = checked;
			selComp.setText(selComp.getText());
		}
	}
	
	@super.onCheckBtnClick(comp, info);
};
