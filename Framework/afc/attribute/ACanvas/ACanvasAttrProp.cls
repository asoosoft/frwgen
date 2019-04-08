
/**
Constructor
Do not call Function in Constructor.
*/
@class ACanvasAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ACanvas/';

}
@extends BaseProp;


@function ACanvasAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.insertCommonAttr();
};

