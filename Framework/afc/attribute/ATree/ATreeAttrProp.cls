
/**
Constructor
Do not call Function in Constructor.
*/
@class ATreeAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ATree/';

}
@extends BaseProp;


@function ATreeAttrProp:init(context, evtListener)
{
	
	@super.init(context, evtListener);
	
	//this.acc.insertItem('Style', this.attrPath+'Style.lay');

	//common
	this.insertCommonAttr();
	
};
