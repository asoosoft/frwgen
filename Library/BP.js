

//------------------------------------------------------------------------------------------------------------------
//	DEFINE VALUE
//------------------------------------------------------------------------------------------------------------------

var GW_DEF =
{
	FITCH			: 0xFE,	// G/W헤더 시작임을 표시
	
	//frame control char
	CTL_NORMAL		: 0x01, // 정상
	CTL_ACK			: 0x02, // 뭔지 모르지만 POLL처럼 다시 서버로 전송해야 한다고 함(김호정차장)
	CTL_NAK			: 0x03, // NAK
	CTL_POLL		: 0x04, // POLL(POLL Frame을 수신하며 POLL 응답을 하여야 함, POLL Timeout:300sec)
	CTL_SESS		: 0x05, // 세션 체크
	CTL_ERR_MSG1	: 0x90, // Error message display
	CTL_ERR_MSG2	: 0x99, // Error message display & stop

	// what session ?
	SESS_TRAN		: 0x01, // 사용자 Transaction
	SESS_REAL		: 0x08, // 실시간 데이타

	// checking status (반드시 0x20으로 초기화 시킨 상태에서 비티 연산)
	CHK_RQ_ACK		: 0x01, // Reqest ACK response ( 이 BIT가 설정되면 ACK Frame을 전송해줘야 함)
	CHK_COMPRESS	: 0x02, // 메세지 압축
	CHK_CONTINUE	: 0x08, // 연속 메세지 존재함을 지정
	CHK_ERR_MSG		: 0x80  // 에러 메세지
};

// AXIS Header
var AXIS_DEF =
{
	//I,O message id.
	MSG_NORMAL			: 0x20, // 일반 메세지
	MSG_TAB_SEP			: 0x22, // TAB seperator presentation message
	MSG_REAL			: 0x50, // 실시간 데이타 메세지(TRX : none, XWIN : major key, DATA(n) : minor kyes...)
	MSG_ENCRYPT			: 0x80, // 암호화 키 transaction mode
	MSG_PUBLIC_KEY		: 0x81, // 공인인증 키 transaction mode
	MSG_SIGN_ON_TRAN	: 0x82, // Sign-on transaction
	MSG_TICK			: 0x90, // 틱 메세지(사용자의 개별적인 실시간 데이터 (실시간 주문체결, 잔고 등)
	MSG_MODALESS		: 0x91, // Modeless Dialog Message
	MSG_SISE_ALARM		: 0x92, // 시세 알람
	MSG_MULTI_CONN		: 0x94, // 중복접속
	MSG_SOUND_ORDER		: 0x95, // 장중건전주문안내(20140724 akh 신규추가)
	MSG_MODALESS_DMA	: 0x96, // Modeless Dialog Message : DMA(20141219 양윤창)
	MSG_SVR_ALERT_PUSH	: 0x97, // server alert message(PUSH)(20151105 안경환)
	MSG_ERROR			: 0x99, // Error message (Guide Message 영역에 표시할 Message)

	// action flags (비트연산 가능)
	ACT_ENCRYPT			: 0x02, // 메세지 암호화
	ACT_CONTINUE		: 0x08, // 연속 메세지 존재함을 지정
	ACT_64BIT			: 0x64,	//  64bit 서버 flag : 2015.03.04 scbang 추가
	ACT_RQ_ERROR		: 0x80, /*에러 처리 요청 Header 선두에 있음을 의미
						          errhdr = curpos(8) + msgtype + msglen(1)
						          curpos = 커서가 위치할 Symbol Name
						          msgtype = ( '0' : nomessge
								              '1' : field symbol 지정,
						                      '2' : Guide 영역에 메시지 표시
						                      '3' : DialogBox로 메시지 표지)
						          msglen = ERROR 메시지 길이 (binary value) */

	// checking flags - 데이타 수신처리에 필요한 추가기능 정의
	CHK_PUBLIC_KEY		: 0x08,	// 공인인증서 포함
	CHK_OOP_TRAN		: 0x10	// OOP Transaction Interface 시 사용 */
};

//------------------------------------------------------------------------------------------------------------------
//	SIZE
//------------------------------------------------------------------------------------------------------------------

	//------------------------------
	//	G/W Header 영역
	//------------------------------
	var SZ_GW_HEADER					= 12;	// 헤더 시작 표시(2) + 공통 게이트웨이 헤더 사이즈(10)
	
	//------------------------------
	//	AXIS Header 영역
	//------------------------------
	var SZ_AXIS_HEADER					= 24;	// AXIS 헤더 사이즈
	var SZ_AXIS_MSG_HEADER				= 10;	// AXIS 메시지정보 헤더 사이즈 + SZ_AXIS_MSGLEN(Binary Value)

	var SZ_GA_HEADER					= SZ_GW_HEADER + SZ_AXIS_HEADER;	// GW+AXIS
	
	//------------------------------
	//	Tmax Header 영역
	//------------------------------
	var SZ_TLGM_HEADER					= 45;	// 전문 정보 사이즈
	var SZ_TRAN_HEADER					= 103;	// TR 정보 사이즈
	
	var SZ_TMNL_HEADER					= 124;	// 요청정보 헤더 사이즈
	var SZ_RQST_HEADER					= SZ_TMNL_HEADER;
	
	var SZ_MESG_HEADER					= 172;	// 메시지정보 헤더 사이즈 + SZ_EXT_MSG_CN
	
	var SZ_SND_TMAX_HEADER				= SZ_TLGM_HEADER + SZ_TRAN_HEADER + SZ_RQST_HEADER;
	var SZ_RCV_TMAX_HEADER				= SZ_TLGM_HEADER + SZ_TRAN_HEADER + SZ_MESG_HEADER;
	var SZ_SND_TMAX_TOTAL_HEADER = SZ_SND_TMAX_HEADER;	//SZ_GA_HEADER + SZ_SND_TMAX_HEADER;
	var SZ_RCV_TMAX_TOTAL_HEADER = SZ_RCV_TMAX_HEADER;	//SZ_GA_HEADER + SZ_RCV_TMAX_HEADER;

	// 1. 일반
	// 	1-1. h+b
	//  1-2. FID
	//  1-3. b	(관심종목)
	// 2. Real
	
	var SZ_REAL_HEADER					= 7;
	var SZ_REAL_DATA					= 7;

	//------------------------------
	//	G/W Header 영역
	//------------------------------
	
	var SZ_GW_FILLER1			= 1;	// 0xFE,	//G/W헤더 시작임을 표시
	var SZ_GW_FILLER2			= 1;	// 0xFE,	//G/W헤더 시작임을 표시
	var SZ_GW_CTRL				= 1;	// 0x01: 정상 0x03: NAK 0x04: POLL(timeout:300sec) 0x05: 세션체크
	var SZ_GW_SESS				= 1;	// 0x01: 사용자 Transaction 0x08: 실시간 데이터
	var SZ_GW_CHCK				= 1;	// 0x02: 메시지압축여부 0x08:연속메시지 존재함을 지정 0x80: 에러메시지 0x20: 항상 세팅해야함
	var SZ_GW_RSVD				= 2;	// 사용하지 않음
	var SZ_GW_DLEN				= 5;	// ASCII CHAR 자기 자신을 포함하지 않는 데이터 길이

	//------------------------------
	//	AXIS Header 영역
	//------------------------------
	
	var SZ_AXIS_MSGK			= 1;	//	I,O message id.
										//	0x20 일반 메세지
										//	0x22 TAB seperator presentation message
										//	0x50 실시간 데이타 메세지
										//		 (TRX : none, XWIN : major key, DATA(n) : minor kyes...)
										//	0x80 암호화 키 transaction mode
										//	0x81 공인인증 키 transaction mode
										//	0x82 Sign-on transaction
										//	0x90 틱 메세지(사용자의 개별적인 실시간 데이터 (실시간 주문체결, 잔고 등)
										//	0x91 Modeless Dialog Message
										//	0x92 시세 알람
										//	0x99 Error message (Guide Message 영역에 표시할 Message)
	var SZ_AXIS_ACTF			= 1;	//	action flags
										//	0x02 메세지 암호화
										//	0x08 연속 메세지 존재함을 지정
										//	0x64 64bit 서버 flag : 2015.03.04 scbang 추가
										//	0x80 에러 처리 요청 Header 선두에 있음을 의미
										//		errhdr = curpos(8) + msgtype + msglen(1)
										//		curpos = 커서가 위치할 Symbol Name
										//		msgtype = (  '0' : nomessge
										//				 '1' : field symbol 지정,
										//				 '2' : Guide 영역에 메시지 표시
										//					 '3' : DialogBox로 메시지 표시	)
										//		msglen = ERROR 메시지 길이 (binary value)
	var SZ_AXIS_CHKF			= 1;	// checking flags - 데이타 수신처리에 필요한 추가기능 정의0x08: 공인인증서 포함 0x10: OOP Transaction Interface 시 사용
	var SZ_AXIS_XWIN			= 1;	// Major Window ID (0x20 - 0x7f) 32 - 127
	var SZ_AXIS_YWIN			= 1;	// Minor Window ID (0x00 - 0xff) 0 - 255
	var SZ_AXIS_KEYC			= 1;	// action key code 항상 0x00
	var SZ_AXIS_KEYF			= 1;	// next key action flags - 항상 0x00
	var SZ_AXIS_SVCC			= 4;	// service region code - Not use
	var SZ_AXIS_TRXC			= 8;	// I,O transaction code - Transaction Name (혹은 데이타 수신시에는 MAP-NAME으로 사용)
	var SZ_AXIS_MLEN			= 5;	// ASCII CHAR 자기 자신을 포함하지 않는 데이터 길이
	
	// SZ_AXIS_ACTF 의 값이 0x80인 경우 아래의 메시지 정보를 읽어온다
	
	var SZ_AXIS_CURPOS			= 8;	// CURPOS 커서가 위치할 Symbol Name
	var SZ_AXIS_MSGTYPE			= 1;	//	메시지 유형
										//	'0': No Message
										//	'1': Field Symbol
										//	'2': Guide 영역에 Message 표시
										//	'3': Dialog Box로 Message 표시
	var SZ_AXIS_MSGLEN			= 1;	// Error Message 길이(Binary Value)
	var SZ_AXIS_MSG				= 0;	// Message(가변)
	
	//------------------------------
	//	Realtime Header 영역
	//------------------------------
	var SZ_RHDR_GUBN			= 3;	//	gubn flags
										//	gubn[0]: 항상 'D'
										//	gubn[1]: 사용 안함
										//	gubn[2]: 리얼타임 데이터 유형 코드
	var SZ_RHDR_RTSL			= 3;	// message length
	var SZ_RHDR_RTSM			= 1;	// real-time message
	
	//------------------------------
	//	Realtime Data 영역
	//------------------------------
	var SZ_RDTA_RKND			= 1;	//	'I' Initial message(실시간 데이타 종류별 FID 정보를 송신)
										//	'D' 실시간 데이타
										//	'U' 실시간 주문체결, 잔고 등(계좌번호, 관리자번호, 주문번호
										//	    (컨텐츠에 따라 추가 될 수도)가 KEY값을 처리되어야 함.
										//	Note : 'I'인 경우는 처음 접속시 한번만 송신되므로 클라이언트에서는 수신된 정보을 저장하고,
										//	       실시간데이터 수신시 각 데이터의 FID와 조합하여 실시간 데이터를 처리해야 한다.
	var SZ_RDTA_RFLG			= 1;	// 
	var SZ_RDTA_GUBN			= 1;	// 
	var SZ_RDTA_RLEN			= 3;	// 
	var SZ_RDTA_RDATA			= 1;	// 

	//------------------------------
	//	Common Header 영역
	//------------------------------
	//	전문정보 영역
	
	var SZ_EYE_CATCH			= 1;	// 시스템 환경 정보 구분	-> 개발:"D" 검증:"T" 운영:"R"
	var SZ_CMPRS_TCD			= 1;	// 압축 구분 코드 -> 압축X:0 압축:1
	var SZ_ENC_TCD				= 1;	// 암호화 구분 코드 -> 평문:0 암호화:1
	var SZ_RQRS_TCD				= 1;	// 요청 응답 구분 코드 -> 요청:"S" 응답"R" 비요청"B"
	var SZ_SYS_LNK_TCD			= 1;	// 시스템 연계 구분 코드 -> 타발:"I" 당발:"O" 도메인 게이트:"D"
	var SZ_BIZ_SYS_TCD			= 1;	// 업무 시스템 구분 코드 -> 업무계:"1" 업무지원계:"2" 퇴직:"3" 랩어카운트:"4"
	var SZ_BIZ_SYS_SEQ			= 1;	// 업무 시스템 SEQ -> 랜덤:"0" 1호기:"1" 2호기:"2" 3호기:"3" 4호기:"4" 0~9

//	var SZ_GUID_CRT				= 1;	// GUID 생성자 분류 -> 채널:"C" 배치:"B" 대외인터페이스:"I" Legacy(주문매체포함):"L" 배치다발건 온라인대외거래 호출:"P"
//	var SZ_GUID_BP_HN			= 8;	// GUID 접속서버의 호스트네임
//	var SZ_GUID_BP_PID			= 10;	// GUID 접속서버의 PID
//	var SZ_GUID_DATE			= 8;	// GUID 거래일자 -> YYYYMMDD
//	var SZ_GUID_TIME			= 12;	// GUID 거래시각 -> HHMMSS + 밀리세컨드(3) + 마이크로세컨드(3)
	var SZ_TR_CRN_SBJ			= 1;	// 생성자 분류 -> 채널:"C" 배치:"B" 대외인터페이스:"I" Legacy(주문매체포함):"L" 배치다발건 온라인대외거래 호출:"P"
	var SZ_TR_YEAR				= 4;	// 거래년도 YYYY
	var SZ_GUID_MMDD			= 4;	// GUID 거래월일 MMDD
	var SZ_GUID_TIME			= 12;	// GUID 거래시각 -> HHMMSS + 밀리세컨드(3) + 마이크로세컨드(3)
	var SZ_GUID_BP_HN			= 8;	// GUID 접속서버의 호스트명
	var SZ_GUID_BP_PID			= 8;	// GUID 접속서버의 PID

	var SZ_CONN_SRNO			= 1;	// 연동일련번호 -> 0~9

	// TR정보 영역
	var SZ_CHNL_CD				= 3;	// 채널코드
	var SZ_TR_GB				= 1;	// TR구분 -> 사용자액션:"0" 시스템호출 이벤트:"1" 시스템호출 타이머:"2"
	var SZ_SVC_ID				= 10;	// 서비스ID -> 단위업무코드(2) + 업무별 정의코드(1) + "s" + 일련번호(4) + 거래유형 구분코드(1) + 참조코드(1) (ex. aabs0010u0)

//	var SZ_SCRN_NO				= 5;	// 화면번호 -> 화면번호(4) + 탭번호(1)
//	var SZ_OBJECT_ID			= 9;	// ObjectID
//	var SZ_OBJECT_IO_VER		= 4;	// Object I/O버전 -> "01" ~ "ZZ"
	var SZ_OBJ_IO_VER			= 4;	// Object I/O버전 -> "01" ~ "ZZ"
	var SZ_SCRN_NO				= 5;	// 화면번호 -> 화면번호(4) + 탭번호(1)
	var SZ_MAP_OBJECT_ID		= 16;	// 실제 화면 ID

	var SZ_SCRN_OPRT_TCD		= 1;	// 화면조작구분코드 -> CUD:"1" 조회:"2"
	var SZ_AC_PWD_SKIP_YN		= 1;	// 계좌비밀번호스킵여부 -> 스킵:"Y" 스킵X:"N"
	var SZ_MEDIA				= 2;	// 거래매체 -> 키보드:"00" 카드:"01" 통장:"02"
	var SZ_LANG_CD				= 1;	// 언어구분코드 -> 한글:"H" 영문:"E"
	var SZ_USER_TCD				= 1;	// 사용자구분코드 -> 해당없음(로그인TR):"0" 고객:"1" 직원:"2"
	var SZ_DEPT_ID				= 6;	// 부서ID
	var SZ_USER_ID				= 12;	// 사용자ID
	var SZ_SCM_TCD				= 1;	// 스키마 구분코드 -> AP서버에서 2개 이상의 DB 스키마로 선택 접속해야 할 경우 사용 4:RK 5:과기공
	var SZ_OPUT_MDA_TCD			= 1;	// 출력화면일 경우 세팅됨 -> 1=통발기 2=프린터 3=SMS 4=e-mail 5=FAX 6=홈페이지
	var SZ_REC_NO				= 3;	// 레코드 번호 -> 개별 TR식별용. 영문,숫자 자유롭게사용
	var SZ_GRP_ID				= 1;	// 그룹ID -> 레거시에서 동일 TR인데 다른 IO를 적용할때 사용. 스페이스 or [0-9A-Z]
	var SZ_RESV_AREA			= 34;	// FILLER

	//------------------------------
	//  송신,수신여부에 따라 헤더 정보가 다름
	//------------------------------
	//	요청정보 Header 영역 (송신)
	//------------------------------
	var SZ_PBLC_IP_ADDR			= 32;	// 공인 IP
	var SZ_PRVT_IP_ADDR			= 32;	// 사설 IP
	var SZ_MAC_ADR				= 40;	// Mac 주소
	var SZ_TMNL_OS_TCD			= 2;	// 단말 OS 구분 코드 MS Win:"PC" MAC:"MC" AND:"AP" IPHONE:"IP" IPAD:"ID" AND PAD:"AD" 기타:"ZZ"
	var SZ_TMNL_OS_VER			= 8;	// 단말 OS 버전
	var SZ_TMNL_BROW_TCD		= 2;	// 단말 브라우저 구분 코드 익스플로러:"IE" 사파리:"SF" 파이어폭스:"FX" 크롬:"CR" 오페라:"OP" WEBKIT:"WK" 기타:"ZZ"
	var SZ_TMNL_BROW_VER		= 8;	// 단말 브라우저 버전

	//------------------------------
	//	출력정보 Header 영역 (수신)
	//------------------------------
	var SZ_RTN_CODE				= 1;	// 서비스 응답코드
	var SZ_SVC_IO_VER			= 4;	// 실제 화면의 버전정보 "00"~"ZZ"
	var SZ_CONTI_FLAG			= 1;	// 클라이언트에서 다음 버튼의 disable 처리에 사용 다음데이터X:"0" 다음데이터O:"1"
	var SZ_MSG_TYPE				= 1;	// 클라이언트의 메시지 표현방법을 서버에서 설정 Line:"1" Popup:"2" Line+Popup:"3"
	var SZ_MSG_CD				= 6;	// 메시지코드
	var SZ_MSG_CN				= 100;	// 메시지내용
	var SZ_SRM_NM				= 50;	// 소스명
	var SZ_LINE_NO				= 6;	// 소스라인번호
	var SZ_EXT_MSG_LEN			= 3;	// 부가 메시지의 길이(가변) "000"~"999"
	var SZ_EXT_MSG_CN			= 0;	// 부가 메시지 내용
	
	
//------------------------------------------------------------------------------------------------------------------
//	OFFSET
//------------------------------------------------------------------------------------------------------------------

	//------------------------------
	//	G/W Header 영역
	//------------------------------
	
	var OS_GW_FILLER1			= 0;
	var OS_GW_FILLER2			= OS_GW_FILLER1 + SZ_GW_FILLER1;
	var OS_GW_CTRL				= OS_GW_FILLER2 + SZ_GW_FILLER2;
	var OS_GW_SESS				= OS_GW_CTRL + SZ_GW_CTRL;
	var OS_GW_CHCK				= OS_GW_SESS + SZ_GW_SESS;
	var OS_GW_RSVD				= OS_GW_CHCK + SZ_GW_CHCK;
	var OS_GW_DLEN				= OS_GW_RSVD + SZ_GW_RSVD;

	//------------------------------
	//	AXIS Header 영역
	//------------------------------
	
	var OS_AXIS_MSGK			= OS_GW_DLEN + SZ_GW_DLEN;
	var OS_AXIS_ACTF			= OS_AXIS_MSGK + SZ_AXIS_MSGK;
	var OS_AXIS_CHKF			= OS_AXIS_ACTF + SZ_AXIS_ACTF;
	var OS_AXIS_XWIN			= OS_AXIS_CHKF + SZ_AXIS_CHKF;
	var OS_AXIS_YWIN			= OS_AXIS_XWIN + SZ_AXIS_XWIN;
	var OS_AXIS_KEYC			= OS_AXIS_YWIN + SZ_AXIS_YWIN;
	var OS_AXIS_KEYF			= OS_AXIS_KEYC + SZ_AXIS_KEYC;
	var OS_AXIS_SVCC			= OS_AXIS_KEYF + SZ_AXIS_KEYF;
	var OS_AXIS_TRXC			= OS_AXIS_SVCC + SZ_AXIS_SVCC;
	var OS_AXIS_MLEN			= OS_AXIS_TRXC + SZ_AXIS_TRXC;
	
	// SZ_AXIS_ACTF 의 값이 0x80인 경우 아래의 메시지 정보를 읽어온다
	
	var OS_AXIS_CURPOS			= OS_AXIS_MLEN + SZ_AXIS_MLEN;
	var OS_AXIS_MSGTYPE			= OS_AXIS_CURPOS + SZ_AXIS_CURPOS;
	var OS_AXIS_MSGLEN			= OS_AXIS_MSGTYPE + SZ_AXIS_MSGTYPE;
	var OS_AXIS_MSG				= OS_AXIS_MSGLEN + SZ_AXIS_MSGLEN;
	
	//------------------------------
	//	Realtime Header 영역
	//------------------------------
	
	var OS_RHDR_GUBN			= OS_GW_DLEN + OS_GW_DLEN;
	var OS_RHDR_RTSL			= OS_RHDR_GUBN + SZ_RHDR_GUBN;
	var OS_RHDR_RTSM			= OS_RHDR_RTSL + SZ_RHDR_RTSL;
	
	//------------------------------
	//	Realtime Data 영역
	//------------------------------
	
	var OS_RDTA_RKND			= OS_RHDR_RTSM + SZ_RHDR_RTSM;
	var OS_RDTA_RFLG			= OS_RDTA_RKND + SZ_RDTA_RKND;
	var OS_RDTA_GUBN			= OS_RDTA_RFLG + SZ_RDTA_RFLG;
	var OS_RDTA_RLEN			= OS_RDTA_GUBN + SZ_RDTA_GUBN;
	var OS_RDTA_RDATA			= OS_RDTA_RLEN + SZ_RDTA_RLEN;
	
	//------------------------------
	//	Tmax Header 영역
	//------------------------------

	var OS_EYE_CATCH			= 0;
	var OS_CMPRS_TCD			= OS_EYE_CATCH + SZ_EYE_CATCH;
	var OS_ENC_TCD				= OS_CMPRS_TCD + SZ_CMPRS_TCD;
	var OS_RQRS_TCD				= OS_ENC_TCD + SZ_ENC_TCD;
	var OS_SYS_LNK_TCD			= OS_RQRS_TCD + SZ_RQRS_TCD;
	var OS_BIZ_SYS_TCD			= OS_SYS_LNK_TCD + SZ_SYS_LNK_TCD;
	var OS_BIZ_SYS_SEQ			= OS_BIZ_SYS_TCD + SZ_BIZ_SYS_TCD;

//	var OS_GUID_CRT				= OS_BIZ_SYS_SEQ + SZ_BIZ_SYS_SEQ;
//	var OS_GUID_BP_HN			= OS_GUID_CRT + SZ_GUID_CRT;
//	var OS_GUID_BP_PID			= OS_GUID_BP_HN + SZ_GUID_BP_HN;
//	var OS_GUID_DATE			= OS_GUID_BP_PID + SZ_GUID_BP_PID;
//	var OS_GUID_TIME			= OS_GUID_DATE + SZ_GUID_DATE;
	var OS_TR_CRN_SBJ			= OS_BIZ_SYS_SEQ + SZ_BIZ_SYS_SEQ;
	var OS_TR_YEAR				= OS_TR_CRN_SBJ + SZ_TR_CRN_SBJ;
	var OS_GUID_MMDD			= OS_TR_YEAR + SZ_TR_YEAR;
	var OS_GUID_TIME			= OS_GUID_MMDD + SZ_GUID_MMDD;
	var OS_GUID_BP_HN			= OS_GUID_TIME + SZ_GUID_TIME;
	var OS_GUID_BP_PID			= OS_GUID_BP_HN + SZ_GUID_BP_HN;
	var OS_CONN_SRNO			= OS_GUID_BP_PID + SZ_GUID_BP_PID;

	// TR정보 영역
	var OS_CHNL_CD				= OS_CONN_SRNO + SZ_CONN_SRNO;
	var OS_TR_GB				= OS_CHNL_CD + SZ_CHNL_CD;
	var OS_SVC_ID				= OS_TR_GB + SZ_TR_GB;

//	var OS_SCRN_NO				= OS_SVC_ID + SZ_SVC_ID;
//	var OS_OBJECT_ID			= OS_SCRN_NO + SZ_SCRN_NO;
//	var OS_OBJECT_IO_VER		= OS_OBJECT_ID + SZ_OBJECT_ID;
//	var OS_SCRN_OPRT_TCD		= OS_OBJECT_IO_VER + SZ_OBJECT_IO_VER;
	var OS_OBJ_IO_VER			= OS_SVC_ID + SZ_SVC_ID;
	var OS_SCRN_NO				= OS_OBJ_IO_VER + SZ_OBJ_IO_VER;
	var OS_MAP_OBJECT_ID		= OS_SCRN_NO + SZ_SCRN_NO;
	var OS_SCRN_OPRT_TCD		= OS_MAP_OBJECT_ID + SZ_MAP_OBJECT_ID;

	var OS_AC_PWD_SKIP_YN		= OS_SCRN_OPRT_TCD + SZ_SCRN_OPRT_TCD;
	var OS_MEDIA				= OS_AC_PWD_SKIP_YN + SZ_AC_PWD_SKIP_YN;
	var OS_LANG_CD				= OS_MEDIA + SZ_MEDIA;
	var OS_USER_TCD				= OS_LANG_CD + SZ_LANG_CD;
	var OS_DEPT_ID				= OS_USER_TCD + SZ_USER_TCD;
	var OS_USER_ID				= OS_DEPT_ID + SZ_DEPT_ID;
	var OS_SCM_TCD				= OS_USER_ID + SZ_USER_ID;
	var OS_OPUT_MDA_TCD			= OS_SCM_TCD + SZ_SCM_TCD;
	var OS_REC_NO				= OS_OPUT_MDA_TCD + SZ_OPUT_MDA_TCD;
	var OS_GRP_ID				= OS_REC_NO + SZ_REC_NO;
	var OS_RESV_AREA			= OS_GRP_ID + SZ_GRP_ID;

	//------------------------------
	//  송신,수신여부에 따라 헤더 정보가 다름
	//------------------------------
	//	요청정보 Header 영역 송신시
	//--------------------------
	var OS_PBLC_IP_ADDR			= OS_RESV_AREA + SZ_RESV_AREA;
	var OS_PRVT_IP_ADDR			= OS_PBLC_IP_ADDR + SZ_PBLC_IP_ADDR;
	var OS_MAC_ADR				= OS_PRVT_IP_ADDR + SZ_PRVT_IP_ADDR;
	var OS_TMNL_OS_TCD			= OS_MAC_ADR + SZ_MAC_ADR;
	var OS_TMNL_OS_VER			= OS_TMNL_OS_TCD + SZ_TMNL_OS_TCD;
	var OS_TMNL_BROW_TCD		= OS_TMNL_OS_VER + SZ_TMNL_OS_VER;
	var OS_TMNL_BROW_VER		= OS_TMNL_BROW_TCD + SZ_TMNL_BROW_TCD;

	//데이터 시작 오프셋
	var OS_SND_TR_DATA			= OS_TMNL_BROW_VER + SZ_TMNL_BROW_VER;
	//정보계 압축 오프셋
	var TR_ZIP_OFFSET			= OS_SND_TR_DATA;
	//정보계 암호화 오프셋
	var TR_ENC_OFFSET			= OS_SND_TR_DATA;

	//--------------------------
	//	메시지 Header 영역 수신시
	//--------------------------
	var OS_RTN_CODE				= OS_RESV_AREA + SZ_RESV_AREA;
	var OS_SVC_IO_VER			= OS_RTN_CODE + SZ_RTN_CODE;
	var OS_CONTI_FLAG			= OS_SVC_IO_VER + SZ_SVC_IO_VER;
	var OS_MSG_TYPE				= OS_CONTI_FLAG + SZ_CONTI_FLAG;
	var OS_MSG_CD				= OS_MSG_TYPE + SZ_MSG_TYPE;
	var OS_MSG_CN				= OS_MSG_CD + SZ_MSG_CD;
	var OS_SRM_NM				= OS_MSG_CN + SZ_MSG_CN;
	var OS_LINE_NO				= OS_SRM_NM + SZ_SRM_NM;
	var OS_EXT_MSG_LEN			= OS_LINE_NO + SZ_LINE_NO;
	var OS_EXT_MSG_CN			= OS_EXT_MSG_LEN + SZ_EXT_MSG_LEN;

	//데이터 시작 오프셋
	var OS_RCV_TR_DATA			= OS_EXT_MSG_CN + SZ_EXT_MSG_CN;

var TR_SND_SIZE_INFO = 
[
	SZ_EYE_CATCH,
	SZ_CMPRS_TCD,
	SZ_ENC_TCD,
	SZ_RQRS_TCD,
	SZ_SYS_LNK_TCD,
	SZ_BIZ_SYS_TCD,
	SZ_BIZ_SYS_SEQ,

//	SZ_GUID_CRT,
//	SZ_GUID_BP_HN,
//	SZ_GUID_BP_PID,
//	SZ_GUID_DATE,
//	SZ_GUID_TIME,
	SZ_TR_CRN_SBJ,
	SZ_TR_YEAR,
	SZ_GUID_MMDD,
	SZ_GUID_TIME,
	SZ_GUID_BP_HN,
	SZ_GUID_BP_PID,

	SZ_CONN_SRNO,
	SZ_CHNL_CD,
	SZ_TR_GB,
	SZ_SVC_ID,

//	SZ_SCRN_NO,
//	SZ_OBJECT_ID,
//	SZ_OBJECT_IO_VER,
	SZ_OBJ_IO_VER,
	SZ_SCRN_NO,
	SZ_MAP_OBJECT_ID,

	SZ_SCRN_OPRT_TCD,
	SZ_AC_PWD_SKIP_YN,
	SZ_MEDIA,
	SZ_LANG_CD,
	SZ_USER_TCD,
	SZ_DEPT_ID,
	SZ_USER_ID,
	SZ_SCM_TCD,
	SZ_OPUT_MDA_TCD,
	SZ_RESV_AREA,
	SZ_PBLC_IP_ADDR,
	SZ_PRVT_IP_ADDR,
	SZ_MAC_ADR,
	SZ_TMNL_OS_TCD,
	SZ_TMNL_OS_VER,
	SZ_TMNL_BROW_TCD,
	SZ_TMNL_BROW_VER
];

var TR_GW_SIZE_INFO = 
[
	SZ_GW_FILLER1,
	SZ_GW_FILLER2,
	SZ_GW_CTRL,
	SZ_GW_SESS,
	SZ_GW_CHCK,
	SZ_GW_RSVD,
	SZ_GW_DLEN
];

var TR_AXIS_SIZE_INFO = 
[
	SZ_AXIS_MSGK,
	SZ_AXIS_ACTF,
	SZ_AXIS_CHKF,
	SZ_AXIS_XWIN,
	SZ_AXIS_YWIN,
	SZ_AXIS_KEYC,
	SZ_AXIS_KEYF,
	SZ_AXIS_SVCC,
	SZ_AXIS_TRXC,
	SZ_AXIS_MLEN
];

var TR_RCV_SIZE_INFO = 
[
	SZ_EYE_CATCH,
	SZ_CMPRS_TCD,
	SZ_ENC_TCD,
	SZ_RQRS_TCD,
	SZ_SYS_LNK_TCD,
	SZ_BIZ_SYS_TCD,
	SZ_BIZ_SYS_SEQ,

//	SZ_GUID_CRT,
//	SZ_GUID_BP_HN,
//	SZ_GUID_BP_PID,
//	SZ_GUID_DATE,
//	SZ_GUID_TIME,
	SZ_TR_CRN_SBJ,
	SZ_TR_YEAR,
	SZ_GUID_MMDD,
	SZ_GUID_TIME,
	SZ_GUID_BP_HN,
	SZ_GUID_BP_PID,

	SZ_CONN_SRNO,
	SZ_CHNL_CD,
	SZ_TR_GB,
	SZ_SVC_ID,

//	SZ_SCRN_NO,
//	SZ_OBJECT_ID,
//	SZ_OBJECT_IO_VER,
	SZ_OBJ_IO_VER,
	SZ_SCRN_NO,
	SZ_MAP_OBJECT_ID,

	SZ_SCRN_OPRT_TCD,
	SZ_AC_PWD_SKIP_YN,
	SZ_MEDIA,
	SZ_LANG_CD,
	SZ_USER_TCD,
	SZ_DEPT_ID,
	SZ_USER_ID,
	SZ_SCM_TCD,
	SZ_OPUT_MDA_TCD,
	SZ_RESV_AREA,
	SZ_RTN_CODE,
	SZ_SVC_IO_VER,
	SZ_CONTI_FLAG,
	SZ_MSG_TYPE,
	SZ_MSG_CD,
	SZ_MSG_CN,
	SZ_SRM_NM,
	SZ_LINE_NO,
	SZ_EXT_MSG_LEN,
	SZ_EXT_MSG_CN
];




