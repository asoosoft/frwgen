/**
 * @author asoocool
 */


/*
//------------------------------
//	InBlock Data
this.queryData = 
{
	InBlock1:
	[
		{ MENU_CHCK_CODE: '1500', USER_ID: 'z0622' }
	],
	InBlock2:
	[
		{ MENU_CHCK_CODE: '1500', USER_ID: 'z0622' },
		{ MENU_CHCK_CODE: '1500', USER_ID: 'z0622' },
		...
	],
	...
	InBlock2_Occurs:
	{
		RowCount: 0,
		ActionKey: 0x30, //0x30:최초, 0x31:이전, 0x32:다음
		OffsetData: null,
		DataLen: 0
	}
};

//------------------------------
//	OutBlock Data
this.queryData = 
{
	OutBlock1:
	[
		{ MENU_CHCK_CODE: '1500', USER_ID: 'z0622' }
	],
	OutBlock2:
	[
		{ MENU_CHCK_CODE: '1500', USER_ID: 'z0622' },
		{ MENU_CHCK_CODE: '1500', USER_ID: 'z0622' },
		...
	],
	...
	OutBlock2_Occurs:
	{
		RowCount: 0,
		Status: 0x40, //0x40:디폴트, 0x01:이전존재, 0x02:다음존재, 0x01|0x02:동시존재
		OffsetData: null,
		DataLen: 0
	}
};
*/


//-----------------------------------------------------------------------------------------
//	class MdQueryData
//-----------------------------------------------------------------------------------------

AQuery.FORMAT = 'xml';

function MdQueryData(aquery) 
{
	AQueryData.call(this, aquery);
	
	this.setFlag('zipFlag', '0');
	this.setFlag('encFlag', '0');
}
if(window.afc) afc.extendsClass(MdQueryData, AQueryData);
else _afc.extendsClass(MdQueryData, AQueryData);


MdQueryData.prototype.outBlockOccurs = function(block)
{
	var count, tmp;
	if(!block.occurs || block.occurs < 2) count = 1;
	else
	{
		if(block.occursRef)
		{
			tmp = block.occursRef.split('.');
			count = parseInt(this.getBlockData(tmp[0])[0][tmp[1]], 10);
		}
		else
		{
			// 0:OutBlockN 1:OutBlock 2:N
			tmp = parseInt(name.replace('OutBlock', ''));
			// this : aquery
			cntBlock = this.getBlockData('OutBlock'+ (tmp-1))[0];
			for(var key in cntBlock)
			{
				// 현재로서는 grid_cnt00의 field id 를 확실하게 모르므로 아래처럼 처리
				if(key.indexOf('grid_cnt') > -1)
				{
					count = parseInt(cntBlock[key], 10);
					break;
				}
			}
		}
	}
	
	return count;
};

MdQueryData.prototype.inBlockOccurs = function(block)
{
	var count = 1;
	if(block.occurs) count = block.occurs;
	return count;
};

//------------------------------------------------
//QueryData to InBlock Buffer
MdQueryData.prototype.inBlockBuffer = function(abuf, offset)
{
	var blockData, i, j, fmtLen, fmt, value, thisObj = this, exp, type, fldKey, fldSize, count;
	
	abuf.fillBuffer(0x00, offset);
	abuf.setOffset(offset);
	
	this.aquery.eachQueryBlock('input', function(name, block)
	{
		//[ { MENU_CHCK_CODE: '1500', USER_ID: 'z0622' }, ... ]
		blockData = thisObj.queryObj[name];

		fmtLen = block.format.length;
		
		if(!block.occurs || block.occurs < 2) count = 1;
		else 
		{
			if(block.occursRef)
			{
				tmp = block.occursRef.split('.');
				count = parseInt(thisObj.getBlockData(tmp[0])[0][tmp[1]], 10);
			}
			else
			{
				// 0:OutBlockN 1:OutBlock 2:N
				tmp = parseInt(name.replace('OutBlock', ''));
				// this : aquery
				cntBlock = thisObj.getBlockData('OutBlock'+ (tmp-1))[0];
				for(var key in cntBlock)
				{
					// 현재로서는 grid_cnt00의 field id 를 확실하게 모르므로 아래처럼 처리
					if(key.indexOf('grid_cnt') > -1)
					{
						count = parseInt(cntBlock[key], 10);
						break;
					}
				}
			}
		}
		
		for(i=0; i<count; i++)
		{
			//{ MENU_CHCK_CODE: '1500', USER_ID: 'z0622' }
			obj = blockData[i];

			for(j=0; j<fmtLen; j++)
			{
				//[로그인구분,D1로그인구분,0,LoginTp,STRING,1,0]
				fmt = block.format[j];

				fldKey = fmt[AQuery.IKEY];
				fldSize = fmt[AQuery.ISIZE];

				value = obj[fldKey];
				type = fmt[AQuery.ITYPE];

				if(type==AQuery.STRING) abuf.addString(fldSize, value);
				else if(type==AQuery.BINARY) abuf.addBinary(fldSize, value);
				else 
				{
					// 20180910
					// 숫자타입이고 값이 없을 경우 0으로 세팅해달라는 요청에 의해 수정
					if(!value) value = 0;
					
					exp = fmt[AQuery.IEXP];

					if(exp>0) abuf.addString(fldSize, parseFloat(value).toFixed(exp));
					else abuf.addString(fldSize, value);
				}
				
			}
		}
	});
};
