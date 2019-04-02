/*
	로컬라이즈 특정언어에서 테스트가 필요할때 방법
	theApp에서 ready된후에
	LocalizeManager.LANGUAGE 에 언어를 지정해준다. en, ko, zh 등등
	!!주의 : 첫 페이지를 로드하기 전에 해야함.
*/

var LocalizeManager = {};

LocalizeManager.loadMap = function()
{
	LocalizeManager.resMap = AUtil.readTextFile('Resource/LocalizeInfo.json');
};

if(PROJECT_OPTION.general.localizing)
{
	LocalizeManager.loadMap();
}


LocalizeManager.isExistFile = function(url, mode)
{
	if(LocalizeManager.resMap && LocalizeManager.resMap[mode])
	{
		return LocalizeManager.resMap[mode][url];
	}
};

LocalizeManager.getLanguage = function()
{	
	var langStr;
	//ie11
	if(afc.isIE && afc.strIEVer == "msie") langStr = navigator.browserLanguage;
	else langStr = navigator.language;
	
	if(langStr) return langStr.split('-')[0];
	else return 'en';
};

LocalizeManager.LANGUAGE = LocalizeManager.getLanguage();

LocalizeManager.conversionText = function(key, callback)
{
	if(PROJECT_OPTION.general.localizing && PROJECT_OPTION.general.localizing.indexOf(LocalizeManager.LANGUAGE) > -1)
	{
		//최초1회 또는 언어가 변경되었을경우 ajax.
		if(!LocalizeManager.DATA_ARRAY || LocalizeManager.DATA_ARRAY[0] != LocalizeManager.LANGUAGE)
		{
			LocalizeManager.DATA_ARRAY = [];
			LocalizeManager.DATA_ARRAY.push(LocalizeManager.LANGUAGE);
			var resData = AUtil.readTextFile('Resource/'+LocalizeManager.LANGUAGE+'.json');
			if(resData)
			{
				LocalizeManager.DATA_ARRAY.push(resData);
				callback(LocalizeManager.getLocalizedStr(key));
			}
			else callback(null);
		}
		else
		{
			callback(LocalizeManager.getLocalizedStr(key));
		}
	}
};

LocalizeManager.getLocalizedStr = function(key)
{
	if(LocalizeManager.DATA_ARRAY[1]) return LocalizeManager.DATA_ARRAY[1][key];
};