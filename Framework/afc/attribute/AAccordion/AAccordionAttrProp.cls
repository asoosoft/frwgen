
/**
Constructor
Do not call Function in Constructor.
*/
@class AAccordionAttrProp()
{
	@super();

	//TODO:edit here
	this.attrPath = BaseProp.ATTR_PATH + 'AAccordion/';

}
@extends BaseProp;


@function AAccordionAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	//this.acc.insertItem('Data', this.attrPath+'Data.lay');

	//common
	this.insertCommonAttr();
	
};
