
/**
 * @author asoocool
 */

function AWindowEvent(acomp)
{
	AViewEvent.call(this, acomp);
	
}
afc.extendsClass(AWindowEvent, AViewEvent);




//---------------------------------------------------------------------------------------------------
//	Component Event Functions


/* ex)
AWindowEvent.prototype.click = function()
{
	this._click();
};
*/

//---------------------------------------------------------------------------------------------------