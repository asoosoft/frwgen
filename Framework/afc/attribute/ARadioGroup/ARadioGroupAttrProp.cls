
/**
Constructor
Do not call Function in Constructor.
*/
@class ARadioGroupAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ARadioGroup/';

}
@extends BaseProp;


@function ARadioGroupAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Data', this.attrPath+'Data.lay');

	//common
	this.insertCommonAttr();
};

