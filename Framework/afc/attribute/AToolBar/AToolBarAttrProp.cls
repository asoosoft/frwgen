
/**
Constructor
Do not call Function in Constructor.
*/
@class AToolBarAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'AToolBar/';

}
@extends BaseProp;


@function AToolBarAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	
	//common
	this.insertCommonAttr();
};

