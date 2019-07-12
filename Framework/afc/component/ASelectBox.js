/**
 * @author asoocool
 */
//ASelectBox 컴포넌트에서 Item은 option태그를 사용

function ASelectBox()
{
	AComponent.call(this);
}
afc.extendsClass(ASelectBox, AComponent);

ASelectBox.CONTEXT = 
{
    tag: '<select data-base="ASelectBox" data-class="ASelectBox" data-flag="0001" class="ASelectBox-Style"><option value="value1">item1</option></select>',

    defStyle: 
    {
        width:'140px', height:'22px'
    },

    events: ['change']
};



ASelectBox.prototype.init = function(context, evtListener)
{
	AComponent.prototype.init.call(this, context, evtListener);
	
};

ASelectBox.prototype.insertItem = function(text, value, data, index)
{
	var opt = new Option(text, value);
	
	this.element.options.add(opt, index);
	opt.data = data;
};

ASelectBox.prototype.selectItem = function(index) 
{ 
	this.element.selectedIndex = index; 
};

ASelectBox.prototype.getItem = function(index) 
{ 
	return this.element.options[index]; 
};

ASelectBox.prototype.addItem = function(text, value, data)
{
	this.insertItem(text, value, data);
};

ASelectBox.prototype.removeItem = function(index)
{
	this.element.remove(index);	
};

ASelectBox.prototype.removeAll = function()
{
	$(this.element).children().remove();	
};

ASelectBox.prototype.setItemText = function(index, text) 	{ this.element.options[index].text = text; };
ASelectBox.prototype.setItemData = function(index, data)	{ this.element.options[index].data = data; };
ASelectBox.prototype.setItemValue = function(index, value)	{ this.element.options[index].value = value; };

ASelectBox.prototype.getItemText = function(index)	{ return this.element.options[index].text; };
ASelectBox.prototype.getItemData = function(index)	{ return this.element.options[index].data; };
ASelectBox.prototype.getItemValue = function(index)	{ return this.element.options[index].value; };

//----------------------------------------------------------------------------------------------------------------------

ASelectBox.prototype.getSelectedIndex = function()		{ return this.element.selectedIndex; };
ASelectBox.prototype.getSelectedItem = function()		{ return this.getItem(this.element.selectedIndex); };
ASelectBox.prototype.getSelectedItemText = function()	{ return this.getItemText(this.element.selectedIndex); };
ASelectBox.prototype.getSelectedItemData = function()	{ return this.getItemData(this.element.selectedIndex); };
ASelectBox.prototype.getSelectedItemValue = function()	{ return this.getItemValue(this.element.selectedIndex); };

ASelectBox.prototype.indexOfText = function(text)	{ return this.indexOf('text', text); };
ASelectBox.prototype.indexOfValue = function(value)	{ return this.indexOf('value', value); };
ASelectBox.prototype.indexOfData = function(data)	{ return this.indexOf('data', data); };

ASelectBox.prototype.selectItemByText = function(text) { this.selectItem(this.indexOfText(text)); };
ASelectBox.prototype.selectItemByData = function(data) { this.selectItem(this.indexOfData(data)); };
ASelectBox.prototype.selectItemByValue = function(value) { this.selectItem(this.indexOfValue(value)); };

ASelectBox.prototype.removeItemByText = function(text) { this.removeItem(this.indexOfText(text)); };
ASelectBox.prototype.removeItemByData = function(data) { this.removeItem(this.indexOfData(data)); };
ASelectBox.prototype.removeItemByValue = function(value) { this.removeItem(this.indexOfValue(value)); };

//key is 'text', 'value', 'data'
ASelectBox.prototype.indexOf = function(key, value)
{
	var options = this.element.options;
	
	for(var i=0; i<options.length; i++)
	{
		if(options[i][key]==value) return i;
	}
	
	return -1;
};


ASelectBox.prototype.setTextAlign = function(align)
{
	this.setStyle('textAlign', align);
};

ASelectBox.prototype.getTextAlign = function()
{
	return this.getStyle('textAlign');
};

ASelectBox.prototype.setPadding = function(padding)
{
	this.setStyle('padding', parseInt(padding, 10)+'px');
};

ASelectBox.prototype.getPadding = function()
{
	return this.getStyle('padding');
};

ASelectBox.prototype.getItemSize = function()
{
	return this.element.options.length;
};

// 매핑가능한 개수를 리턴한다.
ASelectBox.prototype.getMappingCount = function()
{
	return ['value', 'text'];
};

ASelectBox.prototype.getQueryData = function(dataArr, keyArr, queryData)
{
	if(!keyArr) return;
	if(!dataArr || dataArr.length==0) return;
	
	var item = this.getSelectedItem();
	dataArr[0][keyArr[0]] = item.value;
	dataArr[0][keyArr[1]] = item.text;
};

ASelectBox.prototype.setQueryData = function(dataArr, keyArr, queryData)
{
	if(!keyArr || !dataArr) return;
	
	this.removeAll();
	
	for(var i=0; i<dataArr.length; i++)
		this.addItem(dataArr[i][keyArr[1]], dataArr[i][keyArr[0]]);
};
