
/**
Constructor
Do not call Function in Constructor.
*/
function PWTextField()
{
	_ATextField.call(this);
	
	this.oriValue = '';
	this.maskSymbol = '●';
	this.isTextMask = true;
}
_afc.extendsClass(PWTextField, _ATextField);


PWTextField.prototype.init = function(context, evtListener)
{
	_ATextField.prototype.init.call(this, context, evtListener);

	//별도로 셋팅한다.
	this.addEventListener('focus', this, 'onFocus');
	this.addEventListener('blur', this, 'onBlur');
};

PWTextField.prototype.enableTextMask = function(enable)
{
	this.isTextMask = enable;
};


PWTextField.prototype.setText = function(value)
{
	if(this.isTextMask)
	{
		this.oriValue = value;

		var mask = '';
		for(var i=0; i<value.length; i++)
			mask += this.maskSymbol;

		this.element.value = mask;
	}
	
	else this.element.value = value;
};

PWTextField.prototype.getText = function()
{
	if(this.isTextMask) return this.oriValue;
	else return this.element.value;
};

PWTextField.prototype.onFocus = function(acomp, info)
{
	if(this.isTextMask)
	{
		//this.element.value = this.oriValue;

		this.element.value = '';
		this.oriValue = '';
	}
};

PWTextField.prototype.onBlur = function(acomp, info)
{
	if(this.isTextMask)
	{
		var val = this.element.value;

		if(val.indexOf(this.maskSymbol)==-1) 
			this.setText(this.element.value);
	}
};










