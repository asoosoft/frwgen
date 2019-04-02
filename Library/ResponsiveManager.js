var ResponsiveManager = {};

ResponsiveManager.loadMap = function()
{
	ResponsiveManager.resMap = AUtil.readTextFile('Resource/ResponsiveInfo.json');
};

if(PROJECT_OPTION.general.responsiveLay)
{
	ResponsiveManager.loadMap();
}

ResponsiveManager.isExistFile = function(url, mode)
{
	if(ResponsiveManager.resMap && ResponsiveManager.resMap[mode])
	{
		return ResponsiveManager.resMap[mode][url];
	}
};