
/**
Constructor
Do not call Function in Constructor.
*/
@class ASwitchButtonAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ASwitchButton/';

}
@extends BaseProp;


@function ASwitchButtonAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);

	//TODO:edit here
	this.acc.insertItem('Style', this.attrPath+'Style.lay');

	//common
	this.insertCommonAttr();
};

@function ASwitchButtonAttrProp:onStyleFocus(comp, info)
{

};

@function ASwitchButtonAttrProp:onStyleBlur(comp, info)
{

};

@function ASwitchButtonAttrProp:applyStyleValue(attrKey, styleValue, $attrTarget, $cssTarget, comp)
{
	if(attrKey == "data-style-on") comp.setSwitchOnStyle(styleValue);
	else if(attrKey == "data-style-off") comp.setSwitchOffStyle(styleValue);
	
	@super.applyStyleValue(attrKey, styleValue, $attrTarget, $cssTarget);

};

