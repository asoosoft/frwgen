/**
 * @author asoocool
 */

function SoriQueryManager(name)
{
	QueryManager.call(this, name);

}
afc.extendsClass(SoriQueryManager, QueryManager);

//############################################################################################################################################
// SoriQueryManager에만 있는 함수 CS에서 조회한 경우 최초조회인지 다음조회인지여부를 알려준다.
SoriQueryManager.prototype.setPrevNext = function(prevNext)
{
	this.prevNext = prevNext;
};

SoriQueryManager.prototype.getPrevNext = function()
{
	return this.prevNext;
};

//############################################################################################################################################

SoriQueryManager.prototype.setHeaderInfo = function(headerInfo)
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
		this.headerInfo = 
		{
			EYE_CATCH		: 'D',	// 시스템 환경 정보 구분	-> 개발:"D" 검증:"T" 운영:"R"
			biz_sys_tcd		: '1',	// 업무 시스템 구분 코드 -> 업무계:"1" 정보계:"2" 퇴직:"3" 랩어카운트:"4"	
			USER_TCD		: '0',	// 사용자구분코드 -> 해당없음(로그인TR):"0" 고객:"1" 직원:"2"
			USER_ID			: '',	// 사용자ID
			DEPT_ID			: '',	// 부서 ID
			PBLC_IP_ADDR	: '',	// 공인 IP		//10.110.51.182
			PRVT_IP_ADDR	: '',	// 사설 IP		//10.110.51.182
			MAC_ADR			: '',	// Mac 주소		//6C626D3A60C9
			TMNL_OS_TCD		: 'PC',	// 단말 OS 구분 코드 MS Win:"PC" MAC:"MC" AND:"AP" IPHONE:"IP" IPAD:"ID" AND PAD:"AD" 기타:"ZZ"
			TMNL_OS_VER		: '',	// 단말 OS 버전
			TMNL_BROW_TCD	: '',	// 단말 브라우저 구분 코드 익스플로러:"IE" 사파리:"SF" 파이어폭스:"FX" 크롬:"CR" 오페라:"OP" WEBKIT:"WK" 기타:"ZZ"
			TMNL_BROW_VER	: ''	// 단말 브라우저 버전
		};
	}
};

// Native에서 전송하는 경우 Native 전송전에 onInitDone에서 호출하는 함수
// SorimachiIoManager
SoriQueryManager.prototype.setNativeSendInfo = function(trName, menuNo, groupName, afterOutBlockData)
{
	var packetId = this.makePacketId();
	var obj = 
	{
		"packetId": packetId, "trName": trName, "groupName": groupName, "menuNo": menuNo
	};
	
	var callbackObj = 
	{
		'menuNo': menuNo, 'groupName': groupName, 'func': afterOutBlockData, 'timeout': null, 'noDelete': true
		//'dataFidArr': queryData.dataFidArr
	};
	
	this.setQueryCallback(packetId.toString(), callbackObj);
	
	// SoriIO에 있는 SetMapsData 함수 호출
	SetMapsData('RQ_INIT', trName + '^' + JSON.stringify(obj));
};

// 수신시 호출되는 함수
// data의 type, encoding 등 각 쿼리마다 다르므로 다르게 처리해야 한다.
SoriQueryManager.prototype.onReceived = function(data, rb, nPrevNext)
{
//	this.rcvBuf.setString(0, 0, data);
// 	this.rcvBuf.setDataSize(data.length);

	this.rcvBuf.setBufferByString(data);
	this.rcvBuf.setDataSize(data.length);
	
	if(!rb)
	{
		AIndicator.hide();
		return;
	}
	
	this.packetInfo.packetId = rb.packetId;
	this.setPrevNext(nPrevNext);

	this.queryProcess();
};

//헤더 이후의 데이터 셋팅 오프셋을 리턴한다.
SoriQueryManager.prototype.setErrorData = function(cbObj)
{
	//에러 메시지 셋팅
//	this.errorData.trName = cbObj.trName;
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
SoriQueryManager.prototype.getInDataOffset = function()
{
	return SZ_SND_TMAX_HEADER;
};

SoriQueryManager.prototype.getOutDataOffset = function()
{
	return SZ_RCV_TMAX_HEADER + this.rcvBuf.getParseInt(OS_EXT_MSG_LEN, SZ_EXT_MSG_LEN);
};

//사용할 AQueryData 객체를 생성하여 리턴한다.
SoriQueryManager.prototype.makeQueryData = function(aquery, isSend)
{
	return new MdQueryData(aquery);
};

SoriQueryManager.prototype.makePacketId = function()
{
	++this.packetId;
	if(this.packetId  > 999) this.packetId = 0;
	return this.packetId;
};

SoriQueryManager.prototype.makeHeader = function(queryData, abuf, menuNo)
{
	var packetId = this.makePacketId(), qryHeaderInfo = null;

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
// 	abuf.setChar(OS_SYS_LNK_TCD, "");						 				// 시스템 연계 구분 코드 -> 타발:"I" 당발:"O" 도메인 게이트:"D"

	// ●업무 시스템 구분 코드 -> 업무계:"1" 정보계:"2" 퇴직:"3" 랩어카운트:"4"
	qryHeaderInfo = queryData.headerInfo['biz_sys_tcd'];
	if(!qryHeaderInfo) qryHeaderInfo = this.headerInfo.biz_sys_tcd;
	abuf.setChar(OS_BIZ_SYS_TCD, qryHeaderInfo);

	// ●업무 시스템 SEQ -> 랜덤:"0" 1호기:"1" 2호기:"2" 3호기:"3" 4호기:"4" 0~9
	qryHeaderInfo = queryData.headerInfo['biz_sys_seq'];
	if(!qryHeaderInfo) qryHeaderInfo = '0';
	abuf.setChar(OS_BIZ_SYS_SEQ, qryHeaderInfo);
	
	abuf.setChar(OS_GUID_CRT, "C"); 										// GUID 생성자 분류 -> 채널:"C" 배치:"B" 대외인터페이스:"I" Legacy(주문매체포함):"L" 배치다발건 온라인대외거래 호출:"P"
// 	abuf.setOriString(OS_GUID_BP_HN, SZ_GUID_BP_HN, ""); 					// GUID 접속서버의 호스트네임
// 	abuf.setOriString(OS_GUID_BP_PID, SZ_GUID_BP_PID, ""); 					// GUID 접속서버의 PID
// 	abuf.setOriString(OS_GUID_DATE, SZ_GUID_DATE, ""); 						// GUID 거래일자 -> YYYYMMDD
// 	abuf.setOriString(OS_GUID_TIME, SZ_GUID_TIME, "");						// GUID 거래시각 -> HHMMSS + 밀리세컨드(3) + 마이크로세컨드(3)
	abuf.setChar(OS_CONN_SRNO, "0"); 										// ▲연동일련번호 -> 0~9
	abuf.setOriString(OS_CHNL_CD, SZ_CHNL_CD, "101"); 						// ▲채널코드
	abuf.setChar(OS_TR_GB, "0"); 											// TR구분 -> 사용자액션:"0" 시스템호출 이벤트:"1" 시스템호출 타이머:"2"
	abuf.setOriString(OS_SVC_ID, SZ_SVC_ID, queryData.getQueryName()); 		// 서비스ID -> 단위업무코드(2)+업무별 정의코드(1)+"s"+일련번호(4)+거래유형 구분코드(1)+참조코드(1) (ex. aabs0010u0)
 	abuf.setOriString(OS_SCRN_NO, SZ_SCRN_NO, menuNo);						// 화면번호 -> 화면번호(4) + 탭번호(1)
	abuf.setNumString(OS_OBJECT_ID, SZ_OBJECT_ID, packetId); 				// ObjectID -> packetId를 저장한다
	abuf.setOriString(OS_OBJECT_IO_VER, SZ_OBJECT_IO_VER, queryData.getQuery().getIoVer()); 	// Object I/O버전 -> "01" ~ "ZZ"
	
	// ●화면조작구분코드 -> "C", "R" ,"U", "D"
	qryHeaderInfo = queryData.headerInfo['scrn_oprt_tcd'];
	if(!qryHeaderInfo) qryHeaderInfo = "R";
	abuf.setChar(OS_SCRN_OPRT_TCD, qryHeaderInfo);
	
	// ●계좌비밀번호스킵여부 -> 스킵:"Y" 스킵X:"N"
	qryHeaderInfo = queryData.headerInfo['ac_pwd_skip_yn'];
	if(!qryHeaderInfo) qryHeaderInfo = "N";
	abuf.setChar(OS_AC_PWD_SKIP_YN, qryHeaderInfo);
	
	// ●거래매체 -> 키보드:"00" 카드:"01" 통장:"02"
	qryHeaderInfo = queryData.headerInfo['media'];
	if(!qryHeaderInfo) qryHeaderInfo = "00";
	abuf.setOriString(OS_MEDIA, SZ_MEDIA, qryHeaderInfo);
	
	abuf.setChar(OS_LANG_CD, "H"); 											// 언어구분코드 -> 한글:"H" 영문:"E"
	abuf.setChar(OS_USER_TCD, this.headerInfo.USER_TCD); 					// ★사용자구분코드 -> 해당없음(로그인TR):"0" 고객:"1" 직원:"2"
 	abuf.setOriString(OS_DEPT_ID, SZ_DEPT_ID, this.headerInfo.DEPT_ID);		// ★부서ID
 	abuf.setOriString(OS_USER_ID, SZ_USER_ID, this.headerInfo.USER_ID);		// ★사용자ID
	
	// ●스키마구분코드 -> AP서버에서 2개 이상의 DB스키마로 선택 접속해야 할 경우 사용 "4": RK "5": 과기공 (20170717 신규)
	qryHeaderInfo = queryData.headerInfo['scm_tcd'];
	if(!qryHeaderInfo) qryHeaderInfo = "";
 	abuf.setChar(OS_SCM_TCD, qryHeaderInfo);
	
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
