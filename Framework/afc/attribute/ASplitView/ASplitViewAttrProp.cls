

/**
Constructor
Do not call Function in Constructor.
*/
@class ASplitViewAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ASplitView/';

}
@extends BaseProp;


@function ASplitViewAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	//common
	this.insertCommonAttr();

};

