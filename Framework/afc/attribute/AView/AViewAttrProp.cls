
/**
Constructor
Do not call Function in Constructor.
*/
@class AViewAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'AView/';

}
@extends BaseProp;


@function AViewAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Info', this.attrPath+'Info.lay');

	//common
	this.insertCommonAttr();
};

@function AViewAttrProp:getUpdateValue(selComp, dataKey, groupName)
{
	if(groupName=='ATTR_VALUE')
	{
		if(dataKey=='data-load-url')
		{
			var url = selComp.$ele.attr(dataKey);
			
			if(url) this.testLoadView(selComp.$ele, url);
		}
	}

	return @super.getUpdateValue(selComp, dataKey, groupName);	
};

@function AViewAttrProp:applyValueToSelComp(selComp, dataKey, valGroup, value)
{
	var prevVal;
	if(valGroup=='ATTR_VALUE')
	{
		switch(dataKey)
		{
			case 'data-arrange':
			{
				prevVal = selComp.$ele.attr(dataKey);
				
				if(value=='none') 
				{
					selComp.$ele.children().css({'position':'absolute', 'float':'none', 'margin':''});
					selComp.$ele.removeAttr('data-arrange');
					selComp.$ele.css('padding', '');
				}

				//float left, right 
				else 
				{
					//무조건 아래 설정을 유지해야 함. 다른 옵션은 안됨.
					selComp.$ele.children().css({'position':'relative', left:'0px', top:'0px', 'float':value});
					selComp.$ele.attr(dataKey, value);
				}
			}
			return prevVal;
			
			case 'data-load-url':
			{
				this.testLoadView(selComp.$ele, value);
			}
			break;
		}
	}
	
	return @super.applyValueToSelComp(selComp, dataKey, valGroup, value);
};


@function AViewAttrProp:testLoadView($ele, url)
{
	var prjView = theApp.getProjectView(),
		item = prjView.findProjectItemByTreePath(url);
		
	$ele.find('.test-view').remove();

	if(item)
	{
		url = prjView.getFullPath(item);
		
		if(url)
		{
			if(_AUtil.extractExtName(url) != 'lay') return;

			var html = _afc.getScriptSrc(url);
			if(html)
			{
				$ele.append('<div class="test-view">' + html + '</div>');

				var child = $ele.children();
				child.find('.RGrid-Style').removeAttr('id').css('border', '1px solid blue').text('rMate Grid').css('text-align','center');
				child.find('.RChart-Style').removeAttr('id').css('border', '1px solid yellow').text('rMate Chart').css('text-align','center');
				child.css({
					position: 'relative',
					width: '100%',
					height: '100%'
				});
			}
		}
	}
};








