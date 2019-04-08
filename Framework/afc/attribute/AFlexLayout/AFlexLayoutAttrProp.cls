
/**
Constructor
Do not call Function in Constructor.
*/
@class AFlexLayoutAttrProp()
{
	@super();

	//TODO:edit here
	this.attrPath = BaseProp.ATTR_PATH + 'AFlexLayout/';
	
	this.ieFlexKey = 
	{
		'flex-direction': '-ms-flex-direction',
		'flex-wrap': '-ms-flex-wrap',
		'justify-content': '-ms-flex-pack',
		'align-items': '-ms-flex-align',
		'align-content': '-ms-flex-line-pack'
	};
	
	this.isIESet = false;
}
@extends BaseProp;


@function AFlexLayoutAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);

	//TODO:edit here
	this.acc.insertItem('Data', this.attrPath+'Data.lay');

	//common
	this.insertCommonAttr();
};

/*
@function AFlexLayoutAttrProp:getUpdateValue(selComp, dataKey, groupName)
{
	if(groupName=='CSS_VALUE')
	{
		var ieKey = this.ieFlexKey[dataKey];
		if(ieKey) dataKey = ieKey;
	}

	return @super.getUpdateValue(selComp, dataKey, groupName);	
};
*/
/*
@function AFlexLayoutAttrProp:applyValueToSelComp(selComp, dataKey, valGroup, value)
{
	if(valGroup=='CSS_VALUE')
	{
console.log(2);
		if(this.isIESet) 
		{
console.log(dataKey);		
			dataKey = this.ieFlexKey[dataKey];
console.log(dataKey);					
		}
	}
	
	return @super.applyValueToSelComp(selComp, dataKey, valGroup, value);
};

//selectBox value changed
@function AFlexLayoutAttrProp:onSelectValueChange(comp, info)
{
	this.applyValue(comp, info);

	var dataKey = comp.getComponentId();
	
	var ieKey = this.ieFlexKey[dataKey];
	if(ieKey)
	{
console.log(1);	
		this.isIESet = true;
		this.applyValue(comp, info);
console.log(1);		
		this.isIESet = false;
	}

};
*/









