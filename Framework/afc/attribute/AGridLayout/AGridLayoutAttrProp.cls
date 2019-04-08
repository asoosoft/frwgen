
/**
Constructor
Do not call Function in Constructor.
*/
@class AGridLayoutAttrProp()
{
	@super();

	//TODO:edit here
	this.attrPath = BaseProp.ATTR_PATH + 'AGridLayout/';

}
@extends BaseProp;


@function AGridLayoutAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);

	//common
	this.insertCommonAttr();
};
