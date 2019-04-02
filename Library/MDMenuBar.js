
/**
Constructor
Do not call Function in Constructor.
*/
function MDMenuBar()
{
	AMenuBar.call(this);

	//TODO:edit here
	this.$cloneMenuBar = null;
	this.menuInfo = null;
	
	this.isCloneActive = false;
	this.activeMenu = null;
	this.$activeMenuBtn = null;
	

}
afc.extendsClass(MDMenuBar, AMenuBar);

MDMenuBar.prototype.beforeLoadEvent = function()
{
	var thisObj = this;
	
	this.aevent._select = function(btnEle, menuItem, iconMapUrl, isCloneBtn)
	{
		var $btn = $(btnEle)
		
		if(!isCloneBtn)
		{			
			AEvent.bindEvent(btnEle, AEvent.ACTION_DOWN, function(e)
			{
				thisObj.isCloneActive = true;
				thisObj.doMakeMainMenu($btn, menuItem, iconMapUrl);
				thisObj.makeCloneMenuBar();
			});
			
			$btn.hover(
				function() 
				{ 
					$btn.css({'color':'#d9d9d9', 'background-color':'#202020'}); 
				},
				function() 
				{ 				
					$btn.css({'color':'#d9d9d9', 'background-color':'#3A3A3A'}); 
				}
			);
		}
		else
		{
			AEvent.bindEvent(btnEle, AEvent.ACTION_DOWN, function(e)
			{
				if(!thisObj.isCloneActive)
				{
					thisObj.isCloneActive = true;
					thisObj.doMakeMainMenu($btn, menuItem, iconMapUrl);
				}
				else
				{
					thisObj.removeCloneMenuBar();
				}
			});
			
			$btn.hover(
				function() 
				{
					if(!thisObj.$activeMenuBtn || $btn !== thisObj.$activeMenuBtn)
					{
						$btn.css({'color':'#d9d9d9', 'background-color':'#202020'}); 
						
						if(thisObj.activeMenu) thisObj.activeMenu.close();
						if(thisObj.$activeMenuBtn) thisObj.$activeMenuBtn.css({'color':'#d9d9d9', 'background-color':'#3A3A3A'});
						
						thisObj.doMakeMainMenu($btn, menuItem, iconMapUrl);
					}
					else
					{
						$btn.css({'color':'#d9d9d9', 'background-color':'#202020'}); 
					}
				},
				function() 
				{ 
					if(!thisObj.activeMenu)
					{
						$btn.css({'color':'#d9d9d9', 'background-color':'#3A3A3A'}); 
					} 
				}
			);
		}
	};
};


MDMenuBar.prototype.init = function(context, evtListener)
{
	AMenuBar.prototype.init.call(this, context, evtListener);
	
};


MDMenuBar.prototype.initWithMenuInfo = function(menuInfo)
{
	this.init('AMenuBar');
	
	this.menuInfo = menuInfo;
	
	for(var i=0; i<menuInfo.length; i++)
	{		
		this.addMenuButton(menuInfo[i].text, menuInfo[i].sub, menuInfo[i].iconMapUrl);
	}
};

MDMenuBar.prototype.addMenuButton = function(text, menuItem, iconMapUrl)
{
	var $btn = 	$('<button></button>')
				.html(text)
				.css({
					'color': '#d9d9d9',
					'background-color': '#3A3A3A',
					'border': 'none',
					'padding': '0px 15px 0px 15px'
				});
	
	this.aevent._select($btn[0], menuItem, iconMapUrl);

	this.$ele.append($btn);
};

MDMenuBar.prototype.makeCloneMenuBar = function()
{	
	this.$cloneMenuBar = this.$ele.clone();
	this.$cloneMenuBar.empty();
	
	for(var i=0; i<this.menuInfo.length; i++)
	{			
		this.addCloneMenuButton(this.menuInfo[i].text, this.menuInfo[i].sub, this.menuInfo[i].iconMapUrl);
	}
	
	var $oriMenuBar = $("div[data-base='AMenuBar']"),
		oriMenuBarEle = $oriMenuBar[0],
		oriMenuBarPos = oriMenuBarEle.getBoundingClientRect();
	
	this.$cloneMenuBar.css({
		position : 'absolute',
		top : oriMenuBarPos.top,
		left : oriMenuBarPos.left,
		height : oriMenuBarPos.height + 'px',
		width : oriMenuBarPos.width + 'px',
		backgroundImage : 'transparent',
		zIndex : 9999
	});
	
	$('body').append(this.$cloneMenuBar);
	
};

MDMenuBar.prototype.addCloneMenuButton = function(text, menuItem, iconMapUrl)
{	
	var $btn = 	$('<button></button>')
				.html(text)
				.css({
					'color': '#d9d9d9',
					'background-color': '#3A3A3A',
					'border': 'none',
					'padding': '0px 15px 0px 15px'
				});
	
	this.aevent._select($btn[0], menuItem, iconMapUrl, true);

	this.$cloneMenuBar.append($btn);
};

MDMenuBar.prototype.doMakeMainMenu = function($btn, menuItem, iconMapUrl)
{	
	var pos = $btn[0].getBoundingClientRect();
	
	var menu = new AMenu();
	
	this.activeMenu = menu;
	
	this.$activeMenuBtn = $btn;
	
	menu.setItemInfoArr(menuItem);

	//add ukmani100
	if(iconMapUrl) menu.setIconMapUrl(iconMapUrl);

	menu.setSelectListener(this, 'onMenuSelect');

	menu.popup(pos.left, pos.top+$btn.height());
};

MDMenuBar.prototype.removeCloneMenuBar = function()
{	
	if(this.activeMenu)
	{
		this.activeMenu.close();
		this.activeMenu = null;
	}	

	if(this.$activeMenuBtn) this.$activeMenuBtn = null;

	this.$cloneMenuBar.remove();
	
	this.$cloneMenuBar = null;
	
	this.isCloneActive = false;
	
};


MDMenuBar.prototype.onMenuSelect = function(menu, info)
{	
	this.removeCloneMenuBar();

	if(info.id) this.reportEvent('select', info);
	
};














