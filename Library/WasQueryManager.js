/**
 * @author asoocool
 */

function WasQueryManager(name)
{
	QueryManager.call(this, name);

}
if(window.afc) afc.extendsClass(WasQueryManager, QueryManager);
else _afc.extendsClass(WasQueryManager, QueryManager);

WasQueryManager.prototype.setHeaderInfo = function(headerInfo)
{
	if(headerInfo)
	{
		for(var p in headerInfo)
		{
			if(!headerInfo.hasOwnProperty(p)) continue;
			this.headerInfo[p] = headerInfo[p];
		}
	}
	//파라미터가 null 인 경우 초기화
	else
	{
		var info = this.getBrowserInfo();
		
		this.headerInfo = 
		{
			EYE_CATCH		: 'D',		// 시스템 환경 정보 구분	-> 개발:"D" 검증:"T" 운영:"R"
			biz_sys_tcd		: '1',		// 업무 시스템 구분 코드 -> 업무계:"1" 정보계:"2" 퇴직:"3" 랩어카운트:"4"
			CHNL_CD			: '101',	// TR 생성 채널의 코드. 채널코드표 참조 (반드시 등록 필요)
			USER_TCD		: '0',		// 사용자구분코드 -> 해당없음(로그인TR):"0" 고객:"1" 직원:"2"
			USER_ID			: '',		// 사용자ID
			DEPT_ID			: '',		// 부서 ID
			PBLC_IP_ADDR	: '',		// 공인 IP		//10.110.51.182
			PRVT_IP_ADDR	: '',		// 사설 IP		//10.110.51.182
			MAC_ADR			: '',		// Mac 주소		//6C626D3A60C9
			TMNL_OS_TCD		: info[0],	// 단말 OS 구분 코드 MS Win:"PC" MAC:"MC" AND:"AP" IPHONE:"IP" IPAD:"ID" AND PAD:"AD" 기타:"ZZ"
			TMNL_OS_VER		: info[1],	// 단말 OS 버전
			TMNL_BROW_TCD	: info[2],	// 단말 브라우저 구분 코드 익스플로러:"IE" 사파리:"SF" 파이어폭스:"FX" 크롬:"CR" 오페라:"OP" WEBKIT:"WK" 기타:"ZZ"
			TMNL_BROW_VER	: info[3]	// 단말 브라우저 버전
		};
	}
};

WasQueryManager.prototype.getBrowserInfo = function()
{
	var os = '', osVer = '', ua = navigator.userAgent;
	
	if(afc.OS == 'WIN')
	{
		os = 'PC';
		if(ua.indexOf('Windows NT 10.0') != -1) osVer = '10';
		else if(ua.indexOf('Windows NT 6.2') != -1) osVer = '8';
		else if(ua.indexOf('Windows NT 6.1') != -1) osVer = '7';
		else if(ua.indexOf('Windows NT 6.0') != -1) osVer = 'Vista';
		else if(ua.indexOf('Windows NT 5.1') != -1) osVer = 'XP';
		else if(ua.indexOf('Windows NT 5.0') != -1) osVer = '2000';
	}
	else if(afc.OS == 'MAC') os = 'MC';
	else if(afc.isAndroid)
	{
		os = 'AP';
		osVer = afc.strAndVer;
	}
	else if(afc.isDeviceOf('iPhone'))
	{
		os = 'IP';
		osVer = afc.strIosVer;
	}
	else if(afc.isDeviceOf('iPad'))
	{
		os = 'ID';
		osVer = afc.strIosVer;
	}
	else os = 'ZZ';
	
	var browser = '', browserVer = '', verOffset, verEndOffset;
	if(browserVer = getBrowserVer('MSIE')) browser = 'IE';
	else if(browserVer = getBrowserVer('Opera')) browser = 'OP';
	else if(browserVer = getBrowserVer('Chrome')) browser = 'CR';
	else if(browserVer = getBrowserVer('Safari')) browser = 'SF';
	else if(browserVer = getBrowserVer('Firefox')) browser = 'FX';
	else if(browserVer = getBrowserVer('WebKit')) browser = 'WK';
	else browser = 'ZZ';
	
	return [os, osVer, browser, browserVer];
	
	function getBrowserVer(name)
	{
		var ua = navigator.userAgent;
		var verOffset = ua.indexOf(name);
		
		if(verOffset == -1) return null;
		else
		{
			verOffset += name.length;
			var verEndOffset = verOffset;
			while(true){ if(ua[++verEndOffset] == '.') break; }
			return ua.substring(verOffset+1, verEndOffset);
		}
	}
};

// 수신시 호출되는 함수
// data의 type, encoding 등 각 쿼리마다 다르므로 다르게 처리해야 한다.
WasQueryManager.prototype.onReceived = function(data, size)
{
 	this.rcvBuf.setBuffer(new Uint8Array(data));
	this.rcvBuf.setDataSize(size);

	if(size < SZ_RCV_TMAX_HEADER)
	{
		AIndicator.hide();

		//콜백 객체 제거
		this.clearAllQueryCallback();
			
		//console.log('서버로부터 받은 데이터 사이즈: ' +  size);
		if(window.Form && Form.FormMsgBox2) Form.FormMsgBox2('[오류] 응답전문 내용오류, 거래 내용을 확인하세요.', '서버 오류');
		else if(!window._afc)
		{
			var wnd = new AMessageBox();
			wnd.openBox(null, '[오류] 응답전문 내용오류, 거래 내용을 확인하세요.');
			wnd.setTitleText('서버 오류');
		}

		return;
	}
	
	SZ_EXT_MSG_CN = this.rcvBuf.getParseInt(OS_EXT_MSG_LEN, SZ_EXT_MSG_LEN);	// 부가 메시지 내용의 길이는 가변이므로 체크
	
	// 패킷아이디 세팅
	this.packetInfo.packetId = this.rcvBuf.getOriString(OS_GUID_TIME, SZ_GUID_TIME);
	
	this.queryProcess();
	
};

// 데이터 수신시 에러정보를 세팅하는 함수
WasQueryManager.prototype.setErrorData = function()
{
	//에러 메시지 셋팅
	this.errorData.rtnCode = this.rcvBuf.getString(OS_RTN_CODE, SZ_RTN_CODE);
	this.errorData.svcIoVer = this.rcvBuf.getString(OS_SVC_IO_VER, SZ_SVC_IO_VER);
	this.errorData.contiFlag = this.rcvBuf.getString(OS_CONTI_FLAG, SZ_CONTI_FLAG);
	this.errorData.errType = this.rcvBuf.getString(OS_MSG_TYPE, SZ_MSG_TYPE);
	this.errorData.errCode = this.rcvBuf.getString(OS_MSG_CD, SZ_MSG_CD);
	this.errorData.errMsg = this.rcvBuf.getString(OS_MSG_CN, SZ_MSG_CN);			//nextString(SZ_MSG_CN);
	this.errorData.srmNm = this.rcvBuf.getString(OS_SRM_NM, SZ_SRM_NM);				//nextString(SZ_SRM_NM);
	this.errorData.lineNo = this.rcvBuf.getParseInt(OS_LINE_NO, SZ_LINE_NO);		//nextParseInt(SZ_LINE_NO);
	this.errorData.extMsg = this.rcvBuf.getString(OS_EXT_MSG_CN, SZ_EXT_MSG_CN);
};

//헤더 이후의 데이터 셋팅 오프셋을 리턴한다.
WasQueryManager.prototype.getInDataOffset = function()
{
	return SZ_SND_TMAX_HEADER;
};

WasQueryManager.prototype.getOutDataOffset = function()
{
	return SZ_RCV_TMAX_HEADER + this.rcvBuf.getParseInt(OS_EXT_MSG_LEN, SZ_EXT_MSG_LEN);
};

//사용할 AQueryData 객체를 생성하여 리턴한다.
WasQueryManager.prototype.makeQueryData = function(aquery, isSend)
{
	return new MdQueryData(aquery);
};

// 수신된 전문 로그 남기는 함수
WasQueryManager.prototype.recv_log_helper = function(dataSize, dataOffset)
{
	// isShowLog를 세팅하지 않으면 로그를 남기지 않는다.
	if(!this.isShowLog) return;
	
	var trName = this.packetInfo.trName;
	var abuf = this.rcvBuf;
	//-------------------------------------------------------------------------------------------------------
	//	for debug
	console.log('[' + trName + '] in Receive Buffer Header <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< dataSize : ' + dataSize);

	abuf.printBySize(TR_RCV_SIZE_INFO, 0);
	//abuf.printBuffer(0, dataOffset);

	console.log('[' + trName + '] in Receive Buffer Body <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< dataOffset : ' + dataOffset);

	abuf.printBuffer(dataOffset, dataSize);
// 		if(packetType==PACKET_TYPE.I) abuf.printBuffer(dataOffset, dataSize, 16);
// 		else abuf.printBuffer(dataOffset, dataSize);
	//-----------------------------------------------------------------------------------------------------
};

WasQueryManager.prototype.send_log_helper = function(sendLen)
{
	// isShowLog를 세팅하지 않으면 로그를 남기지 않는다.
	if(!this.isShowLog) return;
	
	//----------------------------------------------------------------------------------------------------------------------------------------
	//	for debug
	var abuf = this.sndBuf;
	var packetType;
	var qryName = abuf.getOriString(OS_SVC_ID, SZ_SVC_ID),
		dataOffset = SZ_SND_TMAX_HEADER;

	console.log('[' + qryName + '] in Send Buffer Header >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> sendLen : ' + sendLen);

	abuf.printBySize(TR_SND_SIZE_INFO, 0);
	//abuf.printBuffer(0, dataOffset);

	console.log('[' + qryName + '] in Send Buffer Body >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> dataOffset : ' + dataOffset);

	abuf.printBuffer(dataOffset, sendLen-dataOffset);
	//--------------------------------------------------------------------------------------------------------------------------------
};

WasQueryManager.prototype.makePacketId = function()
{
	/*++this.packetId;
	if(this.packetId  > 999) this.packetId = 0;
	return this.packetId;*/
		
	var d = new Date(),
		hh = d.getHours(),
		mm = d.getMinutes(),
		ss = d.getSeconds(),
		um = Math.floor(Math.random()*999999) + 1;
		
		this.packetId = sprintf('%02d%02d%02d%06d', hh, mm, ss, um);
		
	return this.packetId;
	
};

WasQueryManager.prototype.makeHeader = function(queryData, abuf, menuNo)
{
	var packetId = this.makePacketId(), qryHeaderInfo = null;

	abuf.fillBuffer(0x20, SZ_SND_TMAX_HEADER);
	//--------------------------------------------------
	//	Common Header
	//--------------------------------------------------
	// ▲:변경될 수 있는 항목
	// ★:로그인 후 세팅해야하는 항목
	// ●:개발자가 입력해야하는 부분
	
	abuf.setChar(OS_EYE_CATCH, this.headerInfo.EYE_CATCH);		 			// 시스템 환경 정보 구분	-> 개발:"D" 검증:"T" 운영:"R"
	abuf.setChar(OS_CMPRS_TCD, queryData.getFlag('zipFlag')); 				// 압축 구분 코드 -> 압축X:0 압축:1
	abuf.setChar(OS_ENC_TCD, queryData.getFlag('encFlag')); 				// 암호화 구분 코드 -> 평문:0 암호화:1
	abuf.setChar(OS_RQRS_TCD, "S");							 				// 요청 응답 구분 코드 -> 요청:"S" 응답"R" 비요청"B"
 	abuf.setChar(OS_SYS_LNK_TCD, "");						 				// 시스템 연계 구분 코드 -> 타발:"I" 당발:"O" 도메인 게이트:"D"

	// ●업무 시스템 구분 코드 -> 업무계:"1" 정보계:"2" 퇴직:"3" 랩어카운트:"4"
	qryHeaderInfo = queryData.headerInfo['biz_sys_tcd'];
	if(!qryHeaderInfo) qryHeaderInfo = this.headerInfo.biz_sys_tcd;
	abuf.setChar(OS_BIZ_SYS_TCD, qryHeaderInfo);

	// ●업무 시스템 SEQ -> 랜덤:"0" 1호기:"1" 2호기:"2" 3호기:"3" 4호기:"4" 0~9
	qryHeaderInfo = queryData.headerInfo['biz_sys_seq'];
	if(!qryHeaderInfo) qryHeaderInfo = '0';
	abuf.setChar(OS_BIZ_SYS_SEQ, qryHeaderInfo);

	abuf.setChar(OS_TR_CRN_SBJ, "C"); 										// GUID 생성자 분류 -> 채널:"C" 배치:"B" 대외인터페이스:"I" Legacy(주문매체포함):"L" 배치다발건 온라인대외거래 호출:"P"
	var date = new Date(), m = date.getMonth()+1, d = date.getDate();
 	abuf.setOriString(OS_TR_YEAR, SZ_TR_YEAR, date.getFullYear()); 			// 거래연도 YYYY
 	abuf.setOriString(OS_GUID_MMDD, SZ_GUID_MMDD, [(m>9?m:'0'+m), (d>9?d:'0'+d)].join(''));	// GUID 거래월일 -> MMDD
	//abuf.setNumString(OS_GUID_TIME, SZ_GUID_TIME, packetId); 				// GUID 거래시각 대신 packetId를 저장한다
	abuf.setOriString(OS_GUID_TIME, SZ_GUID_TIME, packetId); 				// GUID 거래시각 대신 packetId를 저장한다
 	abuf.setOriString(OS_GUID_BP_HN, SZ_GUID_BP_HN, "dinfoap0"); 			// GUID 접속서버의 호스트네임
 	abuf.setOriString(OS_GUID_BP_PID, SZ_GUID_BP_PID, "08716792");			// GUID 접속서버의 PID
	
	abuf.setChar(OS_CONN_SRNO, "0"); 										// ▲연동일련번호 -> 0~9
	
	// ▲채널코드
	qryHeaderInfo = queryData.headerInfo['CHNL_CD'];
	if(!qryHeaderInfo) qryHeaderInfo = this.headerInfo.CHNL_CD;
	abuf.setOriString(OS_CHNL_CD, SZ_CHNL_CD, qryHeaderInfo);

	abuf.setChar(OS_TR_GB, "0"); 											// TR구분 -> 사용자액션:"0" 시스템호출 이벤트:"1" 시스템호출 타이머:"2"
	abuf.setOriString(OS_SVC_ID, SZ_SVC_ID, queryData.getQueryName()); 		// 서비스ID -> 단위업무코드(2)+업무별 정의코드(1)+"s"+일련번호(4)+거래유형 구분코드(1)+참조코드(1) (ex. aabs0010u0)
	abuf.setOriString(OS_OBJ_IO_VER, SZ_OBJ_IO_VER, queryData.getQuery().getIoVer()); 	// Object I/O버전 -> "01" ~ "ZZ"
	
	// 화면번호 -> 화면번호(4) + 탭번호(1)
	qryHeaderInfo = queryData.headerInfo['SCRN_NO'];
	if(!qryHeaderInfo) qryHeaderInfo = "00000";
	else qryHeaderInfo = qryHeaderInfo.substring(0, 4) + '0';				//2018.03.09/탭번호 (0)으로 고정
	abuf.setOriString(OS_SCRN_NO, SZ_SCRN_NO, qryHeaderInfo);				// 화면번호 -> 화면번호(4) + 탭번호(1)
	
	// ObjectID -> 실제 파일명
	qryHeaderInfo = queryData.headerInfo['MAP_OBJECT_ID'];
	if(!qryHeaderInfo) qryHeaderInfo = "";
	abuf.setOriString(OS_MAP_OBJECT_ID, SZ_MAP_OBJECT_ID, qryHeaderInfo);
	
	// ●화면조작구분코드 -> "C", "R" ,"U", "D"
	qryHeaderInfo = queryData.headerInfo['scrn_oprt_tcd'];
	if(!qryHeaderInfo) qryHeaderInfo = "R";
	abuf.setChar(OS_SCRN_OPRT_TCD, qryHeaderInfo);
	
	// ●계좌비밀번호스킵여부 -> 스킵:"Y" 스킵X:"N"
	qryHeaderInfo = queryData.headerInfo['ac_pwd_skip_yn'];
	if(!qryHeaderInfo) qryHeaderInfo = "0";
	abuf.setChar(OS_AC_PWD_SKIP_YN, qryHeaderInfo);
	
	// ●거래매체 -> 키보드:"00" 카드:"01" 통장:"02"
	qryHeaderInfo = queryData.headerInfo['media'];
	if(!qryHeaderInfo) qryHeaderInfo = "00";
	abuf.setOriString(OS_MEDIA, SZ_MEDIA, qryHeaderInfo);
	
	abuf.setChar(OS_LANG_CD, "H"); 											// 언어구분코드 -> 한글:"H" 영문:"E"
	abuf.setChar(OS_USER_TCD, this.headerInfo.USER_TCD);					// ★사용자구분코드 -> 해당없음(로그인TR):"0" 고객:"1" 직원:"2"
 	abuf.setOriString(OS_DEPT_ID, SZ_DEPT_ID, this.headerInfo.DEPT_ID);		// ★부서ID
 	abuf.setOriString(OS_USER_ID, SZ_USER_ID, this.headerInfo.USER_ID);		// ★사용자ID
	
	// ●스키마구분코드 -> AP서버에서 2개 이상의 DB스키마로 선택 접속해야 할 경우 사용 "4": RK "5": 과기공 (20170717 신규)
	qryHeaderInfo = queryData.headerInfo['scm_tcd'];
	if(!qryHeaderInfo) qryHeaderInfo = "";
 	abuf.setChar(OS_SCM_TCD, qryHeaderInfo);

	// ●출력화면일 경우 세팅됨 -> 1=통발기 2=프린터 3=SMS 4=e-mail 5=FAX 6=홈페이지
	qryHeaderInfo = queryData.headerInfo['OPUT_MDA_TCD'];
	if(!qryHeaderInfo) qryHeaderInfo = "";
 	abuf.setChar(OS_OPUT_MDA_TCD, qryHeaderInfo);

	// ●레코드 번호 -> 개별 TR식별용. 영문,숫자 자유롭게사용
	qryHeaderInfo = queryData.headerInfo['REC_NO'];
	if(!qryHeaderInfo) qryHeaderInfo = "";
 	abuf.setOriString(OS_REC_NO, SZ_REC_NO, qryHeaderInfo);

	// ●그룹ID -> 레거시에서 동일 TR인데 다른 IO를 적용할때 사용. 스페이스 or [0-9A-Z]
	qryHeaderInfo = queryData.headerInfo['GRP_ID'];
	if(!qryHeaderInfo) qryHeaderInfo = "";
 	abuf.setChar(OS_GRP_ID, qryHeaderInfo);
	
// 	abuf.setOriString(OS_RESV_AREA, SZ_RESV_AREA, "");										// FILLER
	abuf.setOriString(OS_PBLC_IP_ADDR, SZ_PBLC_IP_ADDR, this.headerInfo.PBLC_IP_ADDR); 		// 공인 IP
	abuf.setOriString(OS_PRVT_IP_ADDR, SZ_PRVT_IP_ADDR, this.headerInfo.PRVT_IP_ADDR); 		// 사설 IP
	abuf.setOriString(OS_MAC_ADR, SZ_MAC_ADR, this.headerInfo.MAC_ADR); 					// Mac 주소
	abuf.setOriString(OS_TMNL_OS_TCD, SZ_TMNL_OS_TCD, this.headerInfo.TMNL_OS_TCD); 		// 단말 OS 구분 코드 MS Win:"PC" MAC:"MC" AND:"AP" IPHONE:"IP" IPAD:"ID" AND PAD:"AD" 기타:"ZZ"
	abuf.setOriString(OS_TMNL_OS_VER, SZ_TMNL_OS_VER, this.headerInfo.TMNL_OS_VER); 		// 단말 OS 버전
	abuf.setOriString(OS_TMNL_BROW_TCD, SZ_TMNL_BROW_TCD, this.headerInfo.TMNL_BROW_TCD); 	// 단말 브라우저 구분 코드 익스플로러:"IE" 사파리:"SF" 파이어폭스:"FX" 크롬:"CR" 오페라:"OP" WEBKIT:"WK" 기타:"ZZ"
	abuf.setOriString(OS_TMNL_BROW_VER, SZ_TMNL_BROW_VER, this.headerInfo.TMNL_BROW_VER); 	// 단말 브라우저 버전
	
	return packetId;
};

