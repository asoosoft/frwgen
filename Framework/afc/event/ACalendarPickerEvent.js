
/**
 * @author asoocool
 */

function ACalendarPickerEvent(acomp)
{
	AEvent.call(this, acomp);
	
}
afc.extendsClass(ACalendarPickerEvent, AEvent);


ACalendarPickerEvent.prototype.actionUpState = function()
{
	var $input = this.acomp.$ele.children('input');
    //if($input.attr('readonly') && this.acomp.isEnable)
    //if(this.acomp.isEnable)
	//{
		// this.acomp.openCalendar(true);
	//}
};

ACalendarPickerEvent.prototype.defaultAction = function()
{
	this._click();
};

//---------------------------------------------------------------------------------------------------
//	Component Event Functions
//	events: ['click', 'select', 'change']
