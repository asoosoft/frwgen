
//----------------------------------------------------------------------------------
//	Keyboard 관련
//

var KeyboardManager = 
{
	//keyboard show 시에 textfield 위치 계산용
	displayHeight: 0,
	topWnd: null,
	wndMove: 0,
	oriPos: null,
	resizeWebview: true
};

KeyboardManager.onKeyBoardShow = function(displayHeight, keyboardHeight)
{
	var $focus = $(':focus');
	//var $focus = $(document.activeElement);
	
	if($focus.length==0) return;
	
	//textfield option
	//키보드 매니저 사용여부에 대한 옵션
	//외부 웹 오픈되는 경우 포커스된 엘리먼트가 컴포넌트가 아닌 경우가 있어서 acomp 존재여부도 체크 
	if(!$focus[0].acomp || !$focus[0].acomp.option.isEnableKM) return;
	
	KeyboardManager.displayHeight = displayHeight;
	var topWnd = KeyboardManager.topWnd = AWindow.getTopWindow();
	
	if(topWnd)
	{
		// 윈도우의 높이가 100% 인 경우에는 scrlMaker를 생성하여 추가하여 처리한다.
		if(topWnd.element.style['height'] == '100%')
		{
			_add_scrlMaker(topWnd);
			
			// topWnd를 초기화하여 이후의 처리를(onKeyBoardHide, inputScrollToCenter)
			// scrlMaker 가 있을 때의 처리와 동일하게 한다. 그래서 null 로 셋팅한다.
			KeyboardManager.topWnd = null;
		}
		else if(!KeyboardManager.oriPos)
		{
			KeyboardManager.oriPos = KeyboardManager.topWnd.getPos();
			
			// % to px 처리 관련 함수 호출(모바일웹)
			if(KeyboardManager.resizeWebview)
				KeyboardManager.replaceHeight(KeyboardManager.topWnd, displayHeight + keyboardHeight);
		}
	}
	else
	{
		var cntr = theApp.getMainContainer();
		if(!cntr) cntr = ANavigator.getActiveNaviPage();
		
		// 함수 내부에서 scrlMaker 없으면 추가한다.
		_add_scrlMaker(cntr);
	}
	
	//textfield 위치 계산
	
	//adjustResize
	if(KeyboardManager.resizeWebview) $focus[0].scrollIntoView(false);
	
	//adjustPan
	else KeyboardManager.inputScrollToCenter($focus[0], true);
	
	//$focus.addClass('_INPUT_FOCUS');
	
	function _add_scrlMaker(_cntr)
	{
		if(KeyboardManager.resizeWebview)
		{
			KeyboardManager.container = _cntr;

			// % to px 처리 관련 함수 호출(모바일웹)
			KeyboardManager.replaceHeight(_cntr, displayHeight + keyboardHeight);
		}
		else
		{
			var _scrlMaker = document.getElementById('scroll-maker');
			
			if(_scrlMaker) _scrlMaker = $(_scrlMaker);
			else
			{
				_scrlMaker = $('<div id="scroll-maker"></div>');
				_cntr.$ele.append(_scrlMaker);

				KeyboardManager.container = _cntr;
				KeyboardManager.prevOverflow = _cntr.$ele.css('overflow');
				_cntr.$ele.css('overflow', 'auto');
			}

			_scrlMaker.css({position:'absolute', width:'100%', height:keyboardHeight+'px', bottom:(-1*keyboardHeight)+'px'});
		}
		
	}
};

KeyboardManager.onKeyBoardHide = function()
{
	var $focus = $(':focus');
	//var $focus = $(document.activeElement);
	
	//$focus.removeClass('_INPUT_FOCUS');
	
	KeyboardManager.displayHeight = 0;
	
	var topWnd = KeyboardManager.topWnd;
	
	if(topWnd)
	{
		if(topWnd.$ele)
		{
			topWnd.setPos(KeyboardManager.oriPos);
			
			if(KeyboardManager.resizeWebview) KeyboardManager.restoreHeight(topWnd);
		}
		KeyboardManager.wndMove = 0;
		KeyboardManager.topWnd = null;
		KeyboardManager.oriPos = null;
	}
	else
	{
		// container는 height가 100%인 윈도우와 그외 컨테이너이다.
		var _cntr = KeyboardManager.container;
		if(_cntr && _cntr.$ele)
		{
			// % to px 바꾸기 전 값으로 변경하는 함수 호출(모바일웹)
			if(KeyboardManager.resizeWebview) KeyboardManager.restoreHeight(_cntr);
				
			// container에 이전 overflow 값 세팅
			if(KeyboardManager.prevOverflow) _cntr.$ele.css('overflow', KeyboardManager.prevOverflow);
		}
		
		// container, prevOverflow, oriH 초기화
		KeyboardManager.container = KeyboardManager.prevOverflow = null;
		
		if(!KeyboardManager.resizeWebview) $('#scroll-maker').remove();
	}
	
	KeyboardManager.oriH = null;

	$focus.blur();
};

KeyboardManager.replaceHeight = function(cntr, fullH)
{
	//if(afc.isSystemWebView) return;
	
	var cntrH = cntr.element.style['height'];
	if(cntrH.indexOf('%') > -1)
	{
		KeyboardManager.oriH = cntrH;
		cntr.setHeight(parseFloat(cntrH)/100 * fullH);
	}
};

KeyboardManager.restoreHeight = function(cntr)
{
	//if(afc.isSystemWebView) return;
	
	if(KeyboardManager.oriH) cntr.setHeight(KeyboardManager.oriH);
	KeyboardManager.oriH = 0;
};

KeyboardManager.inputScrollToCenter = function(input, isAppear)
{
	//중복 처리 방지, onKeyBoardShow 와 input focus 이벤트시 -> onKeyBoardShow 만 처리
	if(input && KeyboardManager.displayHeight>0)
	{
		var topWnd = KeyboardManager.topWnd;
		var box = input.getBoundingClientRect();
		var move = box.top - (KeyboardManager.displayHeight/2);
		
		if(topWnd)
		{
			//윈도우가 밑으로 내려가는 경우는 없도록 한다.
			KeyboardManager.wndMove += move;
			if(KeyboardManager.wndMove>0)
			{
				// 계산한 윈도우의 하단 부분이 키보드와 떨어지지 않게 한다.
				var plusH = KeyboardManager.displayHeight - (KeyboardManager.oriPos.top-KeyboardManager.wndMove + topWnd.getHeight());
				if(plusH > 0)
				{
					KeyboardManager.wndMove -= plusH;
					plusH = 0;
				}
				
				if(isAppear) topWnd.moveY(KeyboardManager.oriPos.top-KeyboardManager.wndMove);
				else
				{
					setTimeout(function() { 
						if(KeyboardManager.oriPos)
							topWnd.moveY(KeyboardManager.oriPos.top-KeyboardManager.wndMove);
					}, 1);
				}
			}
		}
		else
		{
			var _cntr = KeyboardManager.container;
			if(isAppear) _cntr.element.scrollTop += move;
			else
			{
				//키보드가 보여지고 있을 때 
				//포커스 이벤트시 스크롤을 시키면 다른 곳에 포커스가 생기는 버그 때문에
				setTimeout(function() { _cntr.element.scrollTop += move; }, 1);
			}
		}
	}
};