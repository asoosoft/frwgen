
/**
Constructor
Do not call Function in Constructor.
*/
@class ASlideViewAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ASlideView/';

}
@extends BaseProp;


@function ASlideViewAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Option', this.attrPath+'Option.lay');
	
	//common
	this.insertCommonAttr();
};




