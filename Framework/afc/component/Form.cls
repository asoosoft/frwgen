
/**
Constructor
Do not call Function in Constructor.
*/
class Form(containerId)
{
	super(containerId);

	this.message = '';
	this.type = 0;

}
extends ADialog;

Form.OK = 0;
Form.OKCANCEL = 1;
Form.ABORTRETRYIGNORE = 2;
Form.YESNOCANCEL= 3;
Form.YESNO = 4;
Form.RETRYCANCEL = 5;

Form.STOP = 1;
Form.QUESTION = 2;
Form.EXCLAMATION = 3;
Form.INFOMATION = 4;

//옵션을 변경한다던가 타이틀을 만드는 등의 태그 생성 작업
function Form:init(context)
{
	super.init(context);

	this.setWindowOption(
	{
		isResizable: false
	});
};

function Form:onCreate()
{
	super.onCreate();
	
	var lbl = this.view.findCompById('MSG_LABEL');
	lbl.setHtml(this.message);
	
	this.setTitleText(this.strCaption);
	
	this.addTypeButton();
};


/*nType : 버튼타입
0 : Form.OK;
1 : Form.OKCANCEL;
2 : Form.ABORTRETRYIGNORE;
3 : Form.YESNOCANCEL;
4 : Form.YESNO;
5 : Form.RETRYCANCEL;
nIconType : 아이콘타입
1 : STOP;
2 : QUESTION;
3 : EXCLAMATION;
4 : INFOMATION;
*/

function Form:FormMsgBox2(message, strCaption, type, icon, callback)
{
	this.message = message;
	
	if(strCaption) this.strCaption = strCaption;
	else this.strCaption = 'Message';
	
	if(type) this.type = type;
	
	this.setResultCallback(callback);
	
	super.open('Framework/afc/layout/messagebox-view.html', null);
	
	//BKS/20170926/임의적용
	this.view.setHeight(this.getHeight()-40);
};

@function Form:setWidth(w)
{
	@super.setWidth(w);
	
	this.view.setWidth(w-20);
};

function Form:addTypeButton()
{
	var btnView = this.view.findCompById('BTN_VIEW');
	
	switch(this.type)
	{
		case Form.OK:
			btnView.addComponent(this.makeButton('OK', 0));
		break;
		
		case Form.OKCANCEL:
			btnView.addComponent(this.makeButton('OK', 0));
			btnView.addComponent(this.makeButton('Cancel', 1));
		break;
		
		case Form.YESNO:
			btnView.addComponent(this.makeButton('Yes', 0));
			btnView.addComponent(this.makeButton('No', 1));
		break;
		
		case Form.YESNOCANCEL:
			btnView.addComponent(this.makeButton('Yes', 0));
			btnView.addComponent(this.makeButton('No', 1));
			btnView.addComponent(this.makeButton('Cancel', 2));
		break;
		
		case Form.ABORTRETRYIGNORE:
			btnView.addComponent(this.makeButton('Abort', 0));
			btnView.addComponent(this.makeButton('Retry', 1));
			btnView.addComponent(this.makeButton('Ignore', 2));
		break;
		
		case Form.RETRYCANCEL:
			btnView.addComponent(this.makeButton('Retry', 0));
			btnView.addComponent(this.makeButton('Cancel', 1));
		break;
	}
	
	this.view.updatePosition();
};

function Form:addCustomButton(text, value)
{
	var btnView = this.view.findCompById('BTN_VIEW');
	
	btnView.addComponent(this.makeButton(text, value));
	
	this.view.updatePosition();
};

function Form:makeButton(text, value)
{
	var btn = new AButton();
	btn.init();
	btn.setText(text);
	btn._value_ = value;
	btn.addEventListener('click', this, 'onBtnClick');
	//btn.setBtnStyle(['popup_comm_btn_normal','popup_comm_btn_touch','popup_comm_btn_normal']);
	btn.$ele.css({width:'auto', height:'100%', position:'static', 'margin-right':'5px', 'min-width':'50px', 'padding-left':'5px', 'padding-right':'5px', 'border-radius':'2px;'});
	btn.clearBtnState();
	return btn;
};


function Form:onBtnClick(comp, info)
{
	this.close(comp._value_);
};

function Form:onCancel()
{
	switch(this.type)
	{
		case Form.OK:
			this.close(0);
		break;
		case Form.OK_CANCEL:
		case Form.YES_NO:
			this.close(1);
		break;
		case Form.YES_NO_CANCEL:
			this.close(2);
		break;
		default:
			this.close(1);
		break;
	}
	
	return true;
};