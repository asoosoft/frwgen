
/**
Constructor
Do not call Function in Constructor.
*/
@class AGridAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'AGrid/';

}
@extends BaseProp;


@function AGridAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Option', this.attrPath+'Option.lay');
	this.acc.insertItem('Style', this.attrPath+'Style.lay');

	//TODO:edit here
	this.insertCommonAttr();
};

@function AGridAttrProp:getUpdateValue(selComp, dataKey, groupName)
{
	//단일 선택인 경우만 값을 읽어와 셋팅한다. 다중 선택인 경우는 값을 클리어 해준다.
	if(this.selCompArr.length==1)
	{
		if(groupName=='ATTR_VALUE')
		{
			switch(dataKey)
			{
				case 'data-style-header': 
					return selComp.showThead.attr(dataKey);
					
				case 'data-style-body': 
					return selComp.tBody.attr(dataKey);
					
				//data-hide-header
			}
		}
	}

	return @super.getUpdateValue(selComp, dataKey, groupName);	
};

@function AGridAttrProp:applyValueToSelComp(selComp, dataKey, valGroup, value)
{
	var prevVal;
	if(valGroup=='ATTR_VALUE')
	{
		switch(dataKey)
		{
			case 'data-style-header':
			{
				prevVal = selComp.showThead.attr(dataKey);
				this.applyStyleValue(dataKey, value, selComp.showThead);
				this.applyStyleValue(dataKey, value, selComp.hideThead);
			}
			return prevVal;
			
			case 'data-style-body':
			{
				prevVal = selComp.tBody.attr(dataKey);
				this.applyStyleValue(dataKey, value, selComp.tBody);
			}
			return prevVal;
			
			case 'data-hide-header':
			{
				if(value) selComp.hideHeader();
				else selComp.showHeader();
			}
			break;
			//return !value;

			case 'data-flexible-row':
			{
				selComp.setFlexibleRow(value);
			}
			break;

		}
	}
	
	return @super.applyValueToSelComp(selComp, dataKey, valGroup, value);
};

@function AGridAttrProp:onStyleFocus(comp, info)
{
	var selStyle = comp.getText().trim(), selComp;

	this.saveSelArr = [];

	if(!selStyle) selStyle = 'agrid_select';
	
	for(var i=0; i<this.selCompArr.length; i++)
	{
		selComp = this.selCompArr[i];
		
		selComp.selectStyleName = selStyle;
		selComp.selectCell(selComp.getRow(0));
		
		this.saveSelArr[i] = selComp;
	}
};

@function AGridAttrProp:onStyleBlur(comp, info)
{
	for(var i=0; i<this.saveSelArr.length; i++)
	{
		this.saveSelArr[i].clearSelected();
	}
};




