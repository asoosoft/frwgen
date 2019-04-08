
/**
Constructor
Do not call Function in Constructor.
*/
@class CommonAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'Common/';

}
@extends BaseProp;


@function CommonAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.insertCommonAttr();
};
