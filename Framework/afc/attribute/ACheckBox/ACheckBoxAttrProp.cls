
/**
Constructor
Do not call Function in Constructor.
*/
@class ACheckBoxAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ACheckBox/';

}
@extends BaseProp;


@function ACheckBoxAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Data', this.attrPath+'Data.lay');
	this.acc.insertItem('Style', this.attrPath+'Style.lay');

	//common
	this.insertCommonAttr();
};

@function ACheckBoxAttrProp:applyValueToSelComp(selComp, dataKey, valGroup, value)
{
	if(valGroup=='ATTR_VALUE')
	{
		if(dataKey=='data-check-class')
		{
			selComp.setCheckStyle(value);
		}
	}
	
	return @super.applyValueToSelComp(selComp, dataKey, valGroup, value);
};

@function ACheckBoxAttrProp:onTextValueChange(comp, info)
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
