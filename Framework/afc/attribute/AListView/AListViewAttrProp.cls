
/**
Constructor
Do not call Function in Constructor.
*/
@class AListViewAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'AListView/';

}
@extends BaseProp;


@function AListViewAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	
	this.acc.insertItem('Item', this.attrPath+'Item.lay');
	this.acc.insertItem('Option', this.attrPath+'Option.lay');
	//this.acc.insertItem('Preview', this.attrPath+'Preview.lay');


	//common
	this.insertCommonAttr();
};


@function AListViewAttrProp:applyValueToSelComp(selComp, dataKey, valGroup, value)
{
	if(valGroup=='ATTR_VALUE')
	{
		if(dataKey=='data-style-selectitem')
		{
			var preVal = selComp.$ele.attr(dataKey);
			this.applyStyleValue(dataKey, value, selComp.$ele, selComp.$ele.find('.AListView-select'));
			return preVal;
		}
	}
	else if(valGroup=='CSS_VALUE')
	{
		if(dataKey=='item-height')
		{
			var $items = selComp.$ele.children(),
				preVal = $items.get(0).style['height'];
				
			$items.each(function()
			{
				this.style['height'] = value;
			});
			
			return preVal;
		}
	}
	
	return @super.applyValueToSelComp(selComp, dataKey, valGroup, value);
};



@function AListViewAttrProp:getUpdateValue(selComp, dataKey, groupName)
{
	//단일 선택인 경우만 값을 읽어와 셋팅한다. 다중 선택인 경우는 값을 클리어 해준다.
	if(this.selCompArr.length==1)
	{
		if(groupName=='CSS_VALUE')
		{
			if(dataKey=='item-height')
			{
				var $items = selComp.$ele.children();
				return $items.get(0).style['height'];
			}
		}
	}

	return @super.getUpdateValue(selComp, dataKey, groupName);	
};