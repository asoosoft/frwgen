/**
 * @author asoocool
 */


/*
//------------------------------
//	InBlock Data
this.queryObj = 
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
this.queryObj = 
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
//	class AQueryData
//-----------------------------------------------------------------------------------------

function AQueryData(aquery) 
{
	this.aquery = aquery;
	this.queryObj = null;
	
	this.flagObj = 
	{
		//zipFlag: '0',		// 압축 구분 코드 -> 압축X:0 압축:1
		//encFlag: '0'		// 암호화 구분 코드 -> 평문:0 암호화:1
	};
	
	//연속 구분값
	this.contiKey = null;
	
	this.headerInfo =
	{
		/*
		biz_sys_tcd: null,
		biz_sys_seq: null,
		scrn_oprt_tcd: null,
		ac_pwd_skip_yn: null,
		media: null,
		scm_tcd: null			// 스키마구분코드 -> AP서버에서 2개 이상의 DB스키마로 선택 접속해야 할 경우 사용 "4": RK "5": 과기공 (20170717 신규)
		*/
	};
	
	//수신된 queryData 가 리얼인지 조회인지 여부
	this.isReal = false;
}


//-------------------------------------------------------------
//	static area
//


/*
AQueryData.getDataKeyObj = function(dataKey) 
{
	var dataKeyObj = AQueryData.fidValueMap[dataKey];
	if(!dataKeyObj) 
	{
		AQueryData.fidValueMap[dataKey] = dataKeyObj = {};
		dataKeyObj.key = dataKey;
	}
	
	return dataKeyObj;
};
*/


//------------------------------------------------------------------


AQueryData.prototype.setHeaderInfo = function(headerInfo)
{
	for(var p in headerInfo)
	{
		if(!headerInfo.hasOwnProperty(p)) continue;
		
		this.headerInfo[p] = headerInfo[p];
	}
};

AQueryData.prototype.getQueryName = function()
{
	if(!this.aquery) return null;
	else return this.aquery.getName();
};

AQueryData.prototype.setQuery = function(aquery)
{
	this.aquery = aquery;
};

AQueryData.prototype.getQuery = function()
{
	return this.aquery;
};

//비동기 처리 후 updateComponent 호출을 위한, lazy call 플래그
//afterOutBlockData 함수에서 enableLazyUpdate 함수를 호출하면 화면 업데이트를 비동기 함수 호출후에 할 수 있다.
//차후 비동기 함수 콜백에서 queryData.lazyUpdate(); 함수를 호출해 준다.
AQueryData.prototype.enableLazyUpdate = function()
{
	//동적으로 변수 생성
	this.isLazyUpdate = true;
};

AQueryData.prototype.getFlag = function(flagName)
{
	if(flagName==undefined) return this.flagObj;
	else return this.flagObj[flagName];
};

AQueryData.prototype.setFlag = function(flagName, value)
{
	this.flagObj[flagName] = value;
};

AQueryData.prototype.getContiKey = function()
{
	return this.contiKey;
};

AQueryData.prototype.setContiKey = function(contiKey)
{
	this.contiKey = contiKey;
};

AQueryData.prototype.outBlockOccurs = function(block, prevData)
{
	return 1;
};

AQueryData.prototype.inBlockOccurs = function(block)
{
	return 1;
};


//------------------------------------------------


//OutBlock Buffer to QueryData
AQueryData.prototype.outBlockData = function(abuf, offset)
{
	if(!this.queryObj) this.queryObj = {};
	
	if(offset!=undefined) abuf.setOffset(offset);
	
	var blockData, count, i, j, fmtLen, obj = null, fmt, thisObj = this, exp, tmp, cntBlock;
	var types = ['output'];	// inblock 영역은 수신받지 않기 때문에 outblock 부분만 처리
	
	for(var h=0; h<types.length; h++)
	{
		this.aquery.eachQueryBlock(types[h], function(name, block)
		{
			blockData = thisObj.queryObj[name] = [];
			
			count = thisObj.outBlockOccurs(block, obj);

			fmtLen = block.format.length;

			for(i=0; i<count; i++)
			{
				obj = new Object();

				for(j=0; j<fmtLen; j++)
				{
					//[로그인구분,D1로그인구분,0,LoginTp,STRING,1,0]
					fmt = block.format[j];

					if(fmt[AQuery.ITYPE]==AQuery.STRING) obj[fmt[AQuery.IKEY]] = abuf.nextString(fmt[AQuery.ISIZE]);
					else 
					{
						//asoocool dblTostr
						//double 형이지만 문자열로 리턴받기를 원할 경우
						if(thisObj.dblTostr) 
						{
							//3333.2222 , 3344232
							tmp = abuf.nextString(fmt[AQuery.ISIZE]).split('.');
							
							tmp[0] = parseInt(tmp[0], 10);
							
							if(tmp.length>1) tmp = tmp[0] + '.' + tmp[1];
							else tmp = tmp[0].toString();
							
							obj[fmt[AQuery.IKEY]] = tmp;
						}
						else
						{
							exp = fmt[AQuery.IEXP];

							if(exp>0) obj[fmt[AQuery.IKEY]] = abuf.nextParseFloat(fmt[AQuery.ISIZE]).toFixed(exp);
							else obj[fmt[AQuery.IKEY]] = abuf.nextParseFloat(fmt[AQuery.ISIZE]);
						}
					}
				}

				blockData.push(obj);
			}
		});
	}
};

AQueryData.prototype.inBlockPrepare = function()
{
	this.queryObj = {};
	
	var blockData, count, i, j, fmtLen, obj, fmt, thisObj = this;
	this.aquery.eachQueryBlock('input', function(name, inblock)
	{
		blockData = thisObj.queryObj[name] = [];

		count = thisObj.inBlockOccurs(inblock);
		
		fmtLen = inblock.format.length;

		for(i=0; i<count; i++)
		{
			obj = new Object();
			
			for(j=0; j<fmtLen; j++)
			{
				//[현재가,D1현재가,15001,,ULONG,4,-2]
				//D1현재가 == AQuery.IKEY
				fmt = inblock.format[j];
				obj[fmt[AQuery.IKEY]] = fmt[AQuery.IVALUE];
			}
			
			blockData.push(obj);
		}
	});
};


//QueryData to InBlock Buffer
AQueryData.prototype.inBlockBuffer = function(abuf, offset)
{
	var blockData, i, j, fmtLen, fmt, value, thisObj = this, exp, type, fldKey, fldSize;
	
	abuf.fillBuffer(0x00, offset);
	abuf.setOffset(offset);
	
	this.aquery.eachQueryBlock('input', function(name, block)
	{
		//[ { MENU_CHCK_CODE: '1500', USER_ID: 'z0622' }, ... ]
		blockData = thisObj.queryObj[name];

		fmtLen = block.format.length;

		for(i=0; i<blockData.length; i++)
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
					exp = fmt[AQuery.IEXP];

					if(exp>0) abuf.addNumString(fldSize, parseFloat(value).toFixed(exp));
					else abuf.addNumString(fldSize, value);
				}
				
			}
		}
	});
};

AQueryData.prototype.getQueryObj = function()
{
	return this.queryObj;
};

AQueryData.prototype.setQueryObj = function(queryObj)
{
	this.queryObj = queryObj;
};

AQueryData.prototype.getBlockData = function(blockName)
{
	return this.queryObj[blockName];
};

AQueryData.prototype.searchBlockData = function(blockName)
{
	var resultObj = new Object();
	
	if(!blockName) blockName = 'Block';
	
	for(var key in this.queryObj)
	{
		if(key.indexOf(blockName) > -1)
			resultObj[key] = this.queryObj[key];
	}
	return resultObj;
};

AQueryData.prototype.printQueryData = function()
{
	afc.log('[' + this.getQueryName() + '] AQueryData : ==================================');
	//afc.log(JSON.stringify(this.queryObj, undefined, 2));
	return afc.log(this.queryObj);
};
