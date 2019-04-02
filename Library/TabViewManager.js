

function TabViewManager()
{
	this.tabView = null;
	this.delegator = null;
	this.viewData = null;
	this.rbManager = null;
	this.loadDoneCallback = null;
}

TabViewManager.prototype.initManager = function(tabView, rbManager)
{
	this.tabView = tabView;
	if(this.tabView)
	{
		this.tabView.setDelegator(this);
		this.tabView.setTabOption( { sameTabCheck : false } );
	}
	
	this.rbManager = rbManager;
};

TabViewManager.prototype.setDelegator = function(delegator)
{
	this.delegator = delegator;
};

TabViewManager.prototype.getActiveView = function()
{
    var tab = this.tabView.getSelectedTab();
    if(tab) return tab.view;
    else return null;
};

TabViewManager.prototype.getActiveTab = function()
{
    return this.tabView.getSelectedTab();
};

TabViewManager.prototype.addTab = function(tabInfo)//name, url, tabId, data
{
    return this.tabView.addTab(tabInfo);
};

TabViewManager.prototype.changeTab = function(tabId, data, callback)
{
	if(callback) this.loadDoneCallback = callback;
	if(!tabId)
	{
		if(data && data.tabId) tabId = data.tabId;
		else tabId = this.tabView.getLastSelectedTabId();
	}
	
	if(this.rbManager) this.rbManager.selectButton(tabId);	
	this.viewData = data;
	
	if(typeof(tabId) == "number") return this.tabView.selectTabByIndex(tabId);
	else if(typeof(tabId)!="string") tabId = tabId.getComponentId();
		
	return this.tabView.selectTabById(tabId);
};


//------------------------------------------------
//	_ATabView delegate functions
//------------------------------------------------

//onWillActive, onActive, onActiveDone
//onWillDeactive, onDeactive, onDeactiveDone
TabViewManager.prototype.beforeTabChanging = function(oldTab, newTab, reload)
{
	//goPage 호출시 넘어온 data 를 셋팅한다.
	if(newTab) newTab.view.viewData = this.viewData;
	
	if(oldTab) oldTab.view.onWillDeactive();
	
	if(this.delegator) this.delegator.beforeTabChanging(oldTab, newTab, reload);
	
	if(this.tabView.getContainer().state > 0)
	{
		if(newTab) newTab.view.onWillActive(reload);
	}
	
};

TabViewManager.prototype.tabChanging = function(oldTab, newTab, reload) 
{ 
	if(oldTab) oldTab.view.onDeactive();
	
	if(this.tabView.getContainer().state > 1)
	{
		if(newTab) newTab.view.onActive(reload);
	}
	
};

TabViewManager.prototype.afterTabChanged = function(oldTab, newTab, reload)
{
	if(oldTab) oldTab.view.onDeactiveDone();
	
	if(this.tabView.getContainer().state > 2)
	{
		if(newTab) newTab.view.onActiveDone(reload);
		if(this.loadDoneCallback)
		{
			this.loadDoneCallback(reload);
			this.loadDoneCallback = null;
		}
	}
};

/*
TabViewManager.prototype.beforeTabChanging = function(oldTab, newTab, reload)
{
	if(oldTab && oldTab.view.onWillDeactive)
		oldTab.view.onWillDeactive();

	if(newTab) 
	{
		//goPage 호출시 넘어온 data 를 셋팅한다.
		newTab.view.viewData = this.viewData;
		if(newTab.view.onWillActive) newTab.view.onWillActive(reload);
	}
};

TabViewManager.prototype.tabChanging = function(oldTab, newTab, reload) 
{ 
	if(oldTab && oldTab.view.onDeactive) oldTab.view.onDeactive();
	if(newTab && newTab.view.onActive) newTab.view.onActive(reload);
};

TabViewManager.prototype.afterTabChanged = function(oldTab, newTab, reload)
{
    if(oldTab && oldTab.view.onDeactiveDone) oldTab.view.onDeactiveDone();
    if(newTab && newTab.view.onActiveDone) newTab.view.onActiveDone(reload);
};
*/











