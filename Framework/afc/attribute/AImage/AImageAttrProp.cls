
/**
Constructor
Do not call Function in Constructor.
*/
@class AImageAttrProp()
{
	@super();

	this.attrPath = BaseProp.ATTR_PATH + 'AImage/';

}
@extends BaseProp;


@function AImageAttrProp:init(context, evtListener)
{
	@super.init(context, evtListener);
	
	this.acc.insertItem('Data', this.attrPath+'Data.lay');
	
	//common
	this.insertCommonAttr();
	
	
};

/*
@function AImageAttrProp:onTextValueChange(comp, info)
{
	var compId = comp.getComponentId();
	
	if(compId=='src')
	{
	}
	
	this.applyValue(comp, info);
};
*/

/*

@function AImageAttrProp:onImagePickerClick(comp, info)
{
	var wnd = new _AFilterWnd('Image'), thisObj = this;
	var valueComp = comp.getPrevComp();
	
	if(valueComp.getComponentId()!='src'){
	
		return @super.onImagePickerClick(comp, info);
		
	}else{
		
		wnd.openBox(null, ResType.IMAGE, comp, function(result)
		{
			if(!result) return;
	
			result = theApp.resMap.getResInfo(ResType.IMAGE, result);
			
			valueComp.$ele.css('background-image', 'url(' + result + ')');
			
			valueComp.$ele.val(result);
			
			thisObj.applyValue(valueComp, result);
			
		});
		wnd.setTitleText('Image Picker');
		
	}
	
};
*/

/*
@function AImageAttrProp:applyValueToSelComp(selComp, dataKey, valGroup, value)
{
	var prevVal;
	
	if(valGroup=='ATTR_VALUE'){
	
		if(dataKey == 'src'){
			
			prevVal = selComp.getImage();//selComp.$ele.attr(dataKey);
			
			
			selComp.setImage(value);
			
			return prevVal;
			
		}
	}
	else if(valGroup=='CSS_VALUE')
	{
		if(dataKey.indexOf('background-image')>-1)
		{
			prevVal = selComp.$ele.css(dataKey);
			
			selComp.$ele.css(dataKey, value);
			
			if(value){
				selComp.$ele.removeClass('aimage-blank');
			}
			else {				
			
				if(!selComp.$ele.css('background-color') || selComp.$ele.css('background-color')== 'rgba(0, 0, 0, 0)')					
					selComp.$ele.addClass('aimage-blank');
			}
			
			return prevVal;
		}
		else if(dataKey.indexOf('background-color')>-1){
			
			prevVal = selComp.$ele.css(dataKey);
			
			selComp.$ele.css(dataKey, value);
			
			if(value){
				selComp.$ele.removeClass('aimage-blank');
			}
			else {				
				if(!selComp.$ele.css('background-image') || selComp.$ele.css('background-image')=='none')					
					selComp.$ele.addClass('aimage-blank');
			}
			
			return prevVal;
			
		}
		
		
	}
	
	return @super.applyValueToSelComp(selComp, dataKey, valGroup, value);
};
*/