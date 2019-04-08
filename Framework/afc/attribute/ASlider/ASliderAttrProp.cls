
/**
Constructor
Do not call Function in Constructor.
*/
@class ASliderAttrProp()
{
	@super();

	//TODO:edit here
	this.attrPath = BaseProp.ATTR_PATH + 'ASlider/';

}
@extends BaseProp;


@function ASliderAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);

	this.acc.insertItem('Data', this.attrPath+'Data.lay');

	//common
	this.insertCommonAttr();
};
