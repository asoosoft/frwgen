
/**
Constructor
Do not call Function in Constructor.
*/
class ADialog(containerId)
{
	super(containerId);


}
extends AFrameWnd;


//옵션을 변경한다던가 타이틀을 만드는 등의 태그 생성 작업
function ADialog:init(context)
{
	//not overwrite 이 true 이기때문에 
	//부모의 옵션보다 우선 하려면 init 위에 두어야 한다.
	this.setWindowOption(
	{
		isModal: true,
		isCenter: true,
		isResizable: false
		
	}, true);
	//---------------------------------------------

	super.init(context);
};


function ADialog:onCreateDone()
{
	theApp.addKeyEventListener('keydown', this);
	
	var view = this.getView();
	if(view) 
	{
		var inputs = view.findCompByClass('ATextField');
		var areas = view.findCompByClass('ATextArea');
		if(inputs.length>0) inputs[0].setFocus();
		else if(areas.length>0) areas[0].setFocus();
		else
		{
			view.enableActiveFocus(true);
			AComponent.setFocusComp(view);
		}
		
		for(var i=0; i<inputs.length; i++)
			inputs[i].enableKeyPropagation(true);	
			
		for(var i=0; i<areas.length; i++)
			areas[i].enableKeyPropagation(true);	
	}
};

function ADialog:open(viewUrl, parent, width, height)
{
	return super.open(viewUrl, parent, 0, 0, width, height);
};

function ADialog:close(result, data)
{
	theApp.removeKeyEventListener('keydown', this);
	
	super.close(result, data);
};

function ADialog:onOK()
{
	var view = this.getView();
	
	if(view && view.onCloseFrame && !view.onCloseFrame()) return;
	if(view && view.onDialogOk && !view.onDialogOk()) return;
	
	this.close(0);
};

function ADialog:onCancel()
{
	var view = this.getView();
	
	if(view && view.onCloseFrame && !view.onCloseFrame()) return;
	if(view && view.onDialogCancel && !view.onDialogCancel()) return;
	
	this.close(1);
};

function ADialog:makeTitle()
{
	super.makeTitle();

	var comps = this.title.view.getChildren();
	comps = comps[0].getAllLayoutComps();
	
	comps[2].hide();
	comps[3].hide();
};

function ADialog:onKeyDown(e)
{
	var thisObj = this;
	
	if(e.which==afc.KEY_ENTER)
	{
		setTimeout(function()
		{
			thisObj.onOK();
			
		}, 0);
	}
	else if(e.which==afc.KEY_ESC)
	{
		setTimeout(function()
		{
			thisObj.onCancel();
		}, 0);
	}
	
	e.stopPropagation();
	return true;
	
};

