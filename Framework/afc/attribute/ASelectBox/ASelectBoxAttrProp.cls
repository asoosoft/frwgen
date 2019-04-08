
/**
Constructor
Do not call Function in Constructor.
*/
@class ASelectBoxAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ASelectBox/';

}
@extends BaseProp;


@function ASelectBoxAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Data', this.attrPath+'Data.lay');
	
	//common
	this.insertCommonAttr();
};

