
/**
Constructor
Do not call Function in Constructor.
*/
@class ATextAreaAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ATextArea/';

}
@extends BaseProp;


@function ATextAreaAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Data', this.attrPath+'Data.lay');

	//common
	this.insertCommonAttr();
};
