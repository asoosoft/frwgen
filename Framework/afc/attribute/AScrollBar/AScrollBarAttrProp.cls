
/**
Constructor
Do not call Function in Constructor.
*/
@class AScrollBarAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'AScrollBar/';

}
@extends BaseProp;


@function AScrollBarAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.insertCommonAttr();
};

