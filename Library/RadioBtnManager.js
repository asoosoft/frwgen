

function RadioBtnManager(view, isCheckStyle)
{
	this.selectBtn = null;
	this.view = view;
	this.isCheckStyle = isCheckStyle;
}

RadioBtnManager.prototype.selectButton = function(selBtn)
{
	if(typeof(selBtn)=="string") selBtn = this.view.findCompById(selBtn);
	
	if(!selBtn) return;
	
	if(this.isCheckStyle)
	{
		selBtn.setCheck(true);

		if(this.selectBtn) 
		{
			this.selectBtn.setCheck(false);
			
			//체크된 버튼을 한번더 누른 경우, 체크 해제
			if(this.selectBtn===selBtn) selBtn = null;
		}
	}
	else
	{
		selBtn.enable(false);
		
		if(this.selectBtn) this.selectBtn.enable(true);
	}
	
    this.selectBtn = selBtn;
	
	return selBtn;
};

RadioBtnManager.prototype.getSelectButton = function()
{
    return this.selectBtn;
};

RadioBtnManager.prototype.reset = function(view)
{
	if(this.selectBtn) this.selectBtn.enable(true);
	this.selectBtn = null;
	
	if(view!=undefined) this.view = view;
};
