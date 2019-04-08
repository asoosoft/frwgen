
/**
Constructor
Do not call Function in Constructor.
*/
@class AProgressAttrProp()
{
	@super();

	//TODO:edit here
	this.attrPath = BaseProp.ATTR_PATH + 'AProgress/';

}
@extends BaseProp;


@function AProgressAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	//this.acc.insertItem('Bar', this.attrPath+'Bar.lay');

	//common
	this.insertCommonAttr();
};
