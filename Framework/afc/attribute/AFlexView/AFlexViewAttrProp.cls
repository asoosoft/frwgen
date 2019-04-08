
/**
Constructor
Do not call Function in Constructor.
*/
@class AFlexViewAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'AFlexView/';

}
@extends BaseProp;


@function AFlexViewAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	//common
	this.insertCommonAttr();

};

