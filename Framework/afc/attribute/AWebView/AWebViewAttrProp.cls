
/**
Constructor
Do not call Function in Constructor.
*/
@class AWebViewAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'AWebView/';
}
@extends BaseProp;


@function AWebViewAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Info', this.attrPath+'Info.lay');

	//common
	this.insertCommonAttr();
};

