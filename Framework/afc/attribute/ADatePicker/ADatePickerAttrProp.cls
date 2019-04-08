
/**
Constructor
Do not call Function in Constructor.
*/
@class ADatePickerAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ADatePicker/';

}
@extends BaseProp;


@function ADatePickerAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	

	//common
	this.insertCommonAttr();
};

