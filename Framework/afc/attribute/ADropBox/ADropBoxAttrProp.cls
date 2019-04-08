
/**
Constructor
Do not call Function in Constructor.
*/
@class ADropBoxAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'ADropBox/';

}
@extends BaseProp;


@function ADropBoxAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Data', this.attrPath+'Data.lay');

	//common
	this.insertCommonAttr();
};


@function ADropBoxAttrProp:getUpdateValue(selComp, dataKey, groupName)
{
	//단일 선택인 경우만 값을 읽어와 셋팅한다. 다중 선택인 경우는 값을 클리어 해준다.
	if(this.selCompArr.length==1)
	{
		if(groupName=='ATTR_VALUE')
		{
			if(dataKey=='placeholder' || dataKey =='readonly')
			{
				return $(selComp.textfield).attr(dataKey);
			}
		}
		else if(groupName=='CSS_VALUE')
		{
			if(dataKey=='text-align')
			{
				return $(selComp.textfield).css(dataKey);
			}
		}
	}

	return @super.getUpdateValue(selComp, dataKey, groupName);	
};

@function ADropBoxAttrProp:applyValueToSelComp(selComp, dataKey, valGroup, value)
{
	var prevVal;
	var $selCompTxtField = $(selComp.textfield);
		
	if(valGroup=='ATTR_VALUE')
	{
		if(dataKey=='placeholder' || dataKey=='readonly')
		{
			
			prevVal = $selCompTxtField.attr(dataKey);
			
			if(value) $selCompTxtField.attr(dataKey, value);
			else $selCompTxtField.removeAttr(dataKey);
			
			return prevVal;
		}
		
	}
	
	else if(valGroup=='CSS_VALUE')
	{
		if(dataKey=='text-align')
		{			
			prevVal = $selCompTxtField.css(dataKey);
			$selCompTxtField.css(dataKey, value);
			return prevVal;
		}
	}

	
	return @super.applyValueToSelComp(selComp, dataKey, valGroup, value);
};


