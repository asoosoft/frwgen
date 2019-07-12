/**
 * @author asoocool
 */

function AApplication()
{
	//this.navigator = null;
	
	this.rootContainer = null;		//body 태그를 기반으로 하는 최상위 컨테이너, 화면을 표현하지는 않는다.
	this.mainContainer = null;		//루트 컨테이너 밑으로, 화면을 표현하는 시작 컨테이너 
	
	//this.indicator = null;
	this.orientation = 'portrait';
	
	//this.appContainer = null;
	this.curPath = null;
	
	this.resPool = null;
	this.mdiManager = null;
	
	this.keyDownListeners = null;
	this.keyUpListeners = null;
}



AApplication.prototype.unitTest = function(unitUrl)
{
//console.log('unitTest : ' + unitUrl);

	//if(this.mainContainer) this.mainContainer.close();

	//this.rootContainer.$ele.children().remove();
	
	//this.setMainContainer(new APage('unit'));
	//this.mainContainer.open(unitUrl);
	
	
	//this.rootContainer.$ele.children().hide();
	
	var cntr = new APage('unit');
	cntr.open(unitUrl);
};


AApplication.prototype.onReady = function()
{
	this.setCurrentPath();

	//라이브러리 추가시 동적으로 생성
	//
	if(window['ResPool']) this.resPool = new ResPool();
	if(window['MDIManager']) this.mdiManager = new MDIManager();
	
	this.rootContainer = new AContainer();
	this.rootContainer.init($('body')[0]);
	
	//edge 소수점 전화번호 인식 버그 수정
	this.rootContainer.$ele.attr('x-ms-format-detection','none');
	
	/*
	if(afc.isPC)
	{
		//pc 버전용 글로벌 스크롤 스타일 추가
		this.rootContainer.$ele.addClass('_global_scroll_style_');
	}
	*/

	//키보드 이벤트 초기화
	this.initKeyEvent();
	
	var windowHeight = $(window).height(),
		_originalSize = $(window).width() + windowHeight, isKeypadVisible = false;
		
	//console.log('--> ' + windowHeight + ',' + _originalSize);

    var thisObj = this;
    window.addEventListener('orientationchange', function()
    {
		//console.log("... orientationchange ...");
		
		var _cntr = KeyboardManager.container;
		
		if(_cntr && KeyboardManager.resizeWebview) KeyboardManager.restoreHeight(_cntr);
		
      	switch (window.orientation) 
      	{
        	case 0: //portrait
        	case 180:
        		thisObj.orientation = 'portrait';
				windowHeight = $(window).width();	//반대값을 저장해야 실제 회전된 후의 값이 된다.
          	break;
          	
        	case 90: 
        	case -90: //landscape
        		thisObj.orientation = 'landscape';
				windowHeight = $(window).height();	//반대값을 저장해야 실제 회전된 후의 값이 된다.
          	break;
          	
        	default:
	            //viewport.setAttribute('content', 'width=' + vpwidth + ', initial-scale=0.25, maximum-scale=1.0;')
          	break;
      	}
		
    }, false);
	
    window.addEventListener('resize', function(e)
    {
		//console.log("on resize ...");
	
		var isResize = true;
		
		//#########################################################
		//	아이폰의 경우 키패드가 올라올 때, resize 가 발생하지 않는다.
		
		//모든 모바일 브라우저, native 의 경우도 adjustResize 일 경우 발생한다.
		if(afc.isMobile)
		{
			var wh = $(window).height(), ww = $(window).width();
			
			//console.log('====> ' + ww + ',' + wh + ',' + _originalSize);
			
			//# 키패드가 올라 오는 경우
			//키패드 없이, 가로/세로 모드 전환 시 2픽셀 정도 차이가 날 수 있으므로 
			//if(ww+wh!=_originalSize) 이렇게 비교하면 안됨. 좀 더 차이가 날 경우 수치를 조정한다.
			if(Math.abs(ww+wh - _originalSize) > 2)
			{
				//console.log("keyboard show up");
				
				isResize = false;			//키패드에 의해 리사이즈 이벤트가 발생된 경우는 reportEvent 를 전송하지 않는다.
				isKeypadVisible = true;
				
				KeyboardManager.onKeyBoardShow(wh, windowHeight - wh);
			}
			
			//# 키패드가 사라지는 경우
			else if(isKeypadVisible)
			{
				//console.log("keyboard closed");
				
				isResize = false;			//키패드에 의해 리사이즈 이벤트가 발생된 경우는 reportEvent 를 전송하지 않는다.
				isKeypadVisible = false;

				KeyboardManager.onKeyBoardHide();
				
				AWindow.reportMoveCenter();
			}
			
			windowHeight = wh;
		}
		
		// resize를 해도 되는 경우에만 resize 처리한다.
		// 키패드에 의해 리사이즈 이벤트가 발생된 경우는 reportEvent 를 전송하지 않는다.
		if(isResize)
		{
			AWindow.reportResizeEvent();

			if(theApp.mainContainer)
				theApp.mainContainer.onResize();

			else ANavigator.reportResizeEvent();
		}

    });	

};

//현재 응용프로그램의 작업 디렉토리 셋팅
AApplication.prototype.setCurrentPath = function()
{
	var curPath = decodeURI(window.location.pathname);
	
    if(afc.isWindow) 
    {
    	curPath = AUtil.extractLoc(curPath.replace(/[/]/g, afc.DIV));
    	//this.curPath = curPath.slice(1, curPath.length);
		this.curPath = curPath.slice(1);
    }
    //mac, linux
    else 
    {
    	curPath = AUtil.extractLoc(curPath);
    	//this.curPath = curPath.slice(0, curPath.length);
		//this.curPath = curPath.slice(0);
		this.curPath = curPath;
    }
};

AApplication.prototype.getCurrentPath = function()
{
	if(afc.isNwjs) return process.cwd() + afc.DIV + 'bin' + afc.DIV;
	else return this.curPath;
};

//android 의 백키 터치시 기본적으로 처리해 줘야 할 것들. 
//true를 리턴하면 받는 곳에서 아무처리도 하지 않도록 한다.
AApplication.prototype.onBackKeyManage = function()
{
    if(AWindow.reportBackKeyEvent()) return true;
    
    /*
    if(this.navigator.canGoPrev())
    {
        this.navigator.goPrevPage(true);
        return true;
    }
    */
   
   /*
   //asoocool
   	var page = this.navigator.getActivePage();
   	if(page && page.onBackKey()) return true;
	*/
	
	return ANavigator.reportBackKeyEvent();
};

AApplication.prototype.getOrientation = function()
{
	return this.orientation;
};

/*
AApplication.prototype.getCurrentPage = function()
{
	//asoocool
	//return this.navigator.getActivePage();
	return null;
};
*/

AApplication.prototype.setMainContainer = function(container)
{
	this.mainContainer = container;
};

AApplication.prototype.getMainContainer = function()
{
	return this.mainContainer;
};

AApplication.prototype.getRootContainer = function()
{
	return this.rootContainer;
};


AApplication.prototype.getActiveContainer = function()
{
	if(this.mdiManager) return this.mdiManager.getActiveContainer();
	else return null;
};

AApplication.prototype.getActiveView = function()
{
    var childContainer = this.getActiveContainer();
    if(childContainer) return childContainer.getView();
    else return null;
};

AApplication.prototype.getActiveDocument = function()
{
    var childContainer = this.getActiveContainer();
    if(childContainer) return childContainer.getView().getDocument();
    else return null;
};


/* 
//------------------------------------------------------------------
var docTmpl = 
{
	containerClass: 'MDIPage',
	documentClass: 'MDIDocument',
	viewUrl: 'views/MainPageView.lay',
	extNames: ['txt','js','cls'],
};
//------------------------------------------------------------------
*/

AApplication.prototype.openDocTmplFile = function(filePath)
{
	if(!this.mdiManager) return false;
	
	return this.mdiManager.openDocContainer(filePath);
};

AApplication.prototype.saveActiveDocTmplFile = function()
{
	if(!this.mdiManager) return false;
	
	var doc = this.getActiveDocument();
	if(doc) this.mdiManager.saveDocContainer(doc.uri);
};

AApplication.prototype.closeActiveDocTmplFile = function(callback, isForce, isSave)
{
	if(!this.mdiManager) return false;
	
	var doc = this.getActiveDocument();
	if(doc) this.mdiManager.closeDocContainer(doc.uri, callback, isForce, isSave);
	else if(callback) callback(-1);
};

AApplication.prototype.initKeyEvent = function()
{
	var keyDownListeners = this.keyDownListeners = [],
		keyUpListeners = this.keyUpListeners = [];

	$(document).keydown(function(e)
	{
		if(afc.isMac) e.ctrlKey = e.metaKey;

		var listener = null;
		for(var i=keyDownListeners.length-1; i>-1; i--)
		{
			//이전 onKeyDown 에서 리스너가 삭제될 수도 있으므로 null 비교를 해야함.
			listener = keyDownListeners[i];
			
			//onKeyDown 함수에서 true 를 리턴하면 다른 리스너에게 더 이상 전달되지 않는다.
			//마지막에 추가된 리스너가 우선적으로 호출된다.
			if(listener && listener.onKeyDown(e)) break;
		}
	});

	$(document).keyup(function(e)
	{
		if(afc.isMac) e.ctrlKey = e.metaKey;

		var listener = null;
		for(var i=keyUpListeners.length-1; i>-1; i--)
		{
			//이전 onKeyUp 에서 리스너가 삭제될 수도 있으므로 null 비교를 해야함.
			listener = keyUpListeners[i];
			
			//onKeyUp 함수에서 true 를 리턴하면 다른 리스너에게 더 이상 전달되지 않는다.
			//마지막에 추가된 리스너가 우선적으로 호출된다.
			if(listener && listener.onKeyUp(e)) break;
		}
	});
	
};

AApplication.prototype.addKeyEventListener = function(type, listener)
{
	//기존에 추가된 것이 있으면 제거
	this.removeKeyEventListener(type, listener);

	//마지막에 추가된 리스너가 우선적으로 호출 되도록 
	if(type=='keydown') this.keyDownListeners.push(listener);
	//keyup
	else this.keyUpListeners.push(listener);
};

AApplication.prototype.removeKeyEventListener = function(type, listener)
{
	var keyListeners = this.keyUpListeners;
	
	if(type=='keydown') keyListeners = this.keyDownListeners;
	
   	for(var i=0; i<keyListeners.length; i++)
	{
		if(keyListeners[i]===listener)
		{
			keyListeners.splice(i,1);
			break;
		}
	}
};



AApplication.prototype.onClose = function()
{
	return false;
};



AApplication.prototype.onError = function(message, url, lineNumber)
{
	AIndicator.hide();
	
	var totMsg = message + ', Line - ' + lineNumber + ', ' + url;
	
	AfcMessageBox('error', totMsg);
	
	return totMsg;
};


//---------------------------------------------------------------------------------
//	called from native


function onCloseApp()
{
	setTimeout(function()
	{
		if(!theApp.onClose()) 
		{
			if(afc.isExec) window.exec(null, null, 'AppPlugin', 'CloseApp', []);
			else if(afc.isNwjs) theApp.nwWin.close(true);
			else window.close();
		}
		
	}, 0);
}

//native open event
function onOpenDocument(filePath)
{
	
}


function AfcMessageBox(title, message, type, callback, modaless)
{
	if(!window['AMessageBox']) return null;
	
	var wnd = new AMessageBox();
	wnd.setWindowOption({isModal: !modaless});
	wnd.openBox(null, message, type, callback);
	wnd.setTitleText(title);
	
	return wnd;
}



