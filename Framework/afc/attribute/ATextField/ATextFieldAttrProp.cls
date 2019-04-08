
/**
Constructor
Do not call Function in Constructor.
*/
@class ATextFieldAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ATextField/';

}
@extends BaseProp;


@function ATextFieldAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Data', this.attrPath+'Data.lay');

	//common
	this.insertCommonAttr();
};

