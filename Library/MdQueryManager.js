/**
 * @author asoocool
 */

function MdQueryManager(name)
{
	QueryManager.call(this, name);

}
afc.extendsClass(MdQueryManager, QueryManager);

MdQueryManager.prototype.setHeaderInfo = function(headerInfo)
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
			EYE_CATCH		: 'D',	// 시스템 환경 정보 구분	-> 개발:"D" 검증:"T" 운영:"R"
			biz_sys_tcd		: '1',	// 업무 시스템 구분 코드 -> 업무계:"1" 정보계:"2" 퇴직:"3" 랩어카운트:"4"	
			USER_TCD		: '0',	// 사용자구분코드 -> 해당없음(로그인TR):"0" 고객:"1" 직원:"2"
			USER_ID			: '',	// 사용자ID
			DEPT_ID			: '',	// 부서 ID
			PBLC_IP_ADDR	: '',	// 공인 IP		//10.110.51.182
			PRVT_IP_ADDR	: '',	// 사설 IP		//10.110.51.182
			MAC_ADR			: '',	// Mac 주소		//6C626D3A60C9
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

MdQueryManager.prototype.onConnected = function(success)
{
	this.isFirstConn = true;
	//afc.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ QueryManager.prototype.onConnected');
};

MdQueryManager.prototype.onClosed = function()
{
	this.isFirstConn = false;
	
	QueryManager.prototype.onClosed.call(this);
};

// 수신시 호출되는 함수
// data의 type, encoding 등 각 쿼리마다 다르므로 다르게 처리해야 한다.
MdQueryManager.prototype.onReceived = function(data, size)
{
	this.rcvBuf.setBuffer(data);
	this.rcvBuf.setDataSize(size);
	
	//this.packetInfo.packetType = '';
	this.packetInfo.packetId = this.rcvBuf.getParseInt(OS_AXIS_SVCC, SZ_AXIS_SVCC);
	
	if(this.isFirstConn)
	{
		var ipAddr = this.rcvBuf.getOriString(0, buf.length-1);
		//console.log('received addr : ' + ipAddr);
		// ipAddr가 현재 연결한 주소와 다른 경우 연결을 끊고 ipAddr에 연결
		this.isFirstConn = false;
		
		return;
	}
	
	var GW_CTRL = this.rcvBuf.getBinary(OS_GW_CTRL, SZ_GW_CTRL);
// 	var GW_SESS = this.rcvBuf.getBinary(OS_GW_SESS, SZ_GW_SESS);
// 	var GW_CHCK = this.rcvBuf.getBinary(OS_GW_CHCK, SZ_GW_CHCK);
// 	var AXIS_MSGK = this.rcvBuf.getBinary(OS_AXIS_MSGK, SZ_AXIS_MSGK);
	//console.log('GW_CTRL ' + GW_CTRL + '/GW_SESS ' + GW_SESS + '/GW_CHCK ' + GW_CHCK + '/AXIS_MSGK ' + AXIS_MSGK);

	switch(GW_CTRL[0])
	{
		case GW_DEF.CTL_NORMAL:
		{
			var GW_SESS = this.rcvBuf.getBinary(OS_GW_SESS, SZ_GW_SESS);
			var GW_CHCK = this.rcvBuf.getBinary(OS_GW_CHCK, SZ_GW_CHCK);
			
			//console.log('CTL_NORMAL');
			if (GW_CHCK[0] & GW_DEF.CHK_RQ_ACK)
			{
				//console.log('CHK_RQ_ACK');
				this.ackProcess();	// 다시 ACK 로 세팅하여 전송
				//afc.log("11  >>2<< ACK[2] POLL[4], CHK_RQ_ACK  CTcpSocket::SetSocketDataProc  수신     GW Header의 컨트럴 플래그=[%d] ",  GW_CHCK );
			}

			if(GW_CHCK[0] & GW_DEF.CHK_COMPRESS)
			{
				//console.log('$$$$ 압축 해제 필요');
				// 데이터 본문내용을 임시 버퍼로 복사한다.
				// 사이즈 저장 
				// 압축 해제
				// 압축 해제 후 사이즈를 데이터의 사이즈로 한다.
			}

			if(GW_SESS[0] == GW_DEF.SESS_TRAN)
			{
				//console.log('SESS_TRAN');
				// if(0 < 사이즈 <= MAX_RCV_SIZE * 100)
				// else afc.log("서버에서 받은 트랜 사이즈 에러 [%d][%d]", nPacketSize, MAX_RCV_SIZE * 100);

				if(GW_CHCK[0] & GW_DEF.CHK_CONTINUE)
				{
					//console.log('$$$$ 연속 데이터');
					// 연속 데이터인 경우 데이터 저장 및 합치는 작업 필요
				}

				// 기존에 누적해 놓은 데이타가 있을 경우
				// 지금 받은 데이터
				/*
				switch(GW_SESS[0])
				{
					console.log('GW_SESS');
					case GW_DEF.SESS_REAL:
					break;
				}
				*/
				//console.log('################################## tranProcess ################################## ');
				this.beforeQueryProcess(dataSize, packetType);
			}
			else if(GW_SESS[0] == GW_DEF.SESS_REAL)
			{
				this.realProcess(dataSize);
			}
		}
		break;

		case GW_DEF.CTL_NAK:		// 서버에서 데이터를 이상하게 받았다는 뜻. 소켓 재접속 처리
			//console.log('CTL_NAK');
		break;

		case GW_DEF.CTL_ACK:		// Polling 응답 처리
		case GW_DEF.CTL_POLL:		// Polling 응답 처리
			//console.log('CTL_POLL');
			this.pollingProcess();
		break;

		case GW_DEF.CTL_SESS:		// 세션 체크
			//console.log('CTL_SESS');
			//afc.log("11  >> CTL_NORMAL이 아닌경우, CTcpSocket::SetSocketDataProc  수신     GW Header의 컨트럴 플래그=["+ GW_CTRL +"]");
		break;

		case GW_DEF.CTL_ERR_MSG1:	// Error message display
			//console.log('CTL_ERR_MSG1');
		break;

		case GW_DEF.CTL_ERR_MSG2:	// Error message display & stop
			//console.log('CTL_ERR_MSG2');
		break;

		default:
			//console.log('default');
			// 로그
		break;
	}
};

MdQueryManager.prototype.ackProcess = function()
{
	this.sndBuf.setBinary(OS_GW_CTRL, SZ_GW_CTRL, [GW_DEF.CTL_ACK]);
	this.sndBuf.setBinary(OS_GW_SESS, SZ_GW_SESS, [GW_DEF.SESS_TRAN]);
	this.sndBuf.setBinary(OS_GW_CHCK, SZ_GW_CHCK, [0x20]);
	this.sndBuf.setNumString(OS_GW_DLEN, SZ_GW_DLEN, 0);
	
	this.sendBufferData(this.sndBuf.subArray(0, SZ_GW_HEADER));
};

MdQueryManager.prototype.pollingProcess = function()
{
	var abuf = this.sndBuf;
	var sendLen = SZ_GW_HEADER;
	
	abuf.fillBuffer(0x20, SZ_GW_HEADER);
	abuf.setBinary(OS_GW_FILLER1, SZ_GW_FILLER1, [GW_DEF.FITCH]);				 		// G/W 헤더 시작임을 표시
	abuf.setBinary(OS_GW_FILLER2, SZ_GW_FILLER2, [GW_DEF.FITCH]);				 		// G/W 헤더 시작임을 표시
	abuf.setBinary(OS_GW_CTRL, SZ_GW_CTRL, [GW_DEF.CTL_POLL]);				 		// frame control char
	abuf.setBinary(OS_GW_SESS, SZ_GW_SESS, [GW_DEF.SESS_TRAN]);						// what session
// 	abuf.setBinary(OS_GW_CHCK, SZ_GW_CHCK, 0x20); 									// checking status
//	abuf.setOriString(OS_GW_RSVD, SZ_GW_RSVD, "");							 		// reserved
	abuf.setNumString(OS_GW_DLEN, SZ_GW_DLEN, 0);				// data length

	this.sendBufferData(abuf.subArray(0, sendLen) );
};

MdQueryManager.prototype.beforeQueryProcess = function()
{
	var GW_SESS = this.rcvBuf.getBinary(OS_GW_SESS, SZ_GW_SESS);
	var AXIS_MSGK = this.rcvBuf.getBinary(OS_AXIS_MSGK, SZ_AXIS_MSGK);
	var AXIS_ACTF = this.rcvBuf.getBinary(OS_AXIS_ACTF, SZ_AXIS_ACTF);
	var AXIS_CHKF = this.rcvBuf.getBinary(OS_AXIS_CHKF, SZ_AXIS_CHKF);
	var AXIS_TRXC = this.rcvBuf.getOriString(OS_AXIS_TRXC, SZ_AXIS_TRXC);
	var AXIS_MLEN = this.rcvBuf.getParseInt(OS_AXIS_MLEN, SZ_AXIS_MLEN);
	
	switch(AXIS_MSGK[0])
	{
		case AXIS_DEF.MSG_NORMAL:			// 일반 메시지
		case AXIS_DEF.MSG_SIGN_ON_TRAN:		// Sign-on transaction
		{
			/*
			// Tran Size를 읽는다.
			nTranSize				= AXIS_MLEN;	//_ttoi(pRqRpHeader->GetDataLen())
			nReadBufferSize			+= nTranSize;
			nSendingTrBuffSize	= nReadBufferSize;

			// 트랜별로 암호화를 해제한다.
			if((AXIS_ACTF[0] & AXIS_DEF.ACT_ENCRYPT) && g_pMainFrm->m_bEncrypt && nTranSize > 0)  // 비정상 데이터 수신시 예외처리.2017/06/09 akh
			{
				BYTE *pEncryptData = new BYTE[nTranSize+1];
				memset(pEncryptData, 0x00, sizeof(nTranSize+1));
				memcpy(pEncryptData, m_pAXISFrameBuf + (nAXISFramePos + nReadBufferSize) - nTranSize, nTranSize);
				int nRslt = 0, nOutSize2 = 0;
				//nRslt = SF_Block_Decrypt(m_pctx, m_pAXISFrameBuf + (nAXISFramePos + nReadBufferSize) - nTranSize, nTranSize, &nOutSize2, pEncryptData, nTranSize);
				// 2015.02.09 scbang : 64bit xecure 처리 추가
				if (m_bXecure64)
				{
					nRslt = XC_DECODE(&m_ctx, m_pAXISFrameBuf + (nAXISFramePos + nReadBufferSize) - nTranSize, &nOutSize2, pEncryptData, nTranSize, NULL, 0);
				}
				else
				{
					nRslt = SF_Block_Decrypt(m_pctx, m_pAXISFrameBuf + (nAXISFramePos + nReadBufferSize) - nTranSize, nTranSize, &nOutSize2, pEncryptData, nTranSize);
				}

				nSendingTrBuffSize	= nSendingTrBuffSize - (nTranSize - nOutSize2);
				this.rcvBuf.setNumString(OS_AXIS_MLEN, SZ_AXIS_MLEN, nOutSize2);	//pRqRpHeader->SetDataLen(nOutSize2);
				nTranSize = nOutSize2;
				delete pEncryptData;

				// 수신 메세지헤더 메모리 중복 할당 오류 처리
				// 메시지 구조체(가변 크기까지) 총 크기를 구한다.
// 				if(AXIS_ACTF[0] & AXIS_DEF.ACT_RQ_ERROR) nSendingTrBuffSize += pMsgHeader->GetMsgStructLen(); 
			}

			// MajorID, MinorID를 읽는다.
			var packetId = this.rcvBuf.getBinary(OS_AXIS_YWIN, SZ_AXIS_YWIN)[0];
			//wRQID = pRqRpHeader->GetPacketID();

			m_RequestDataObList.m_CritSect.Lock();
			pRequestData			= m_RequestDataObList.GetData(wRQID);
			//g_pMainFrm->CommsDbgLog("test2");
			//strTemp.Format("wRQID=%d, pRequestData =%x", wRQID, pRequestData);
			//g_pMainFrm->CommsDbgLog(strTemp);
			if(pRequestData)
			{
				pRequestData->m_wOriginTimeOut = 0;	// 2014/12/09 양윤창 - 타임아웃 처리를 않도록 하여, 데이터 처리도중 타임아웃이 발생하는것을 막는다.

				hComApiWnd			= pRequestData->m_hCommAPIWnd;
				pRqRpHeaderEx		= (LPRQRPHEADEREX)pRequestData->m_pTranHeaderEx;
				m_RequestDataObList.AddData(wRQID, pRqRpHeader, nSendingTrBuffSize);
				//strTemp.Format("pRqRpHeader->actf[0] : %x", pRqRpHeader->actf[0]);
				//g_pMainFrm->CommsDbgLog(strTemp);
				if((AXIS_ACTF[0] & AXIS_DEF.ACT_CONTINUE)) // 다음데이타가 있다니 처리 하지 않고 넘기자.
				{
					// 2014/04/07  akh - 다운로드 진행상태 처리
					CString strText;
					strText.Format ( _T("\r\n 파일크기 =[ %d ] [ %d ]"), pRequestData->m_nSize, nSendingTrBuffSize);
					TRACE(strText);

					if(GW_SESS[0] == GW_DEF.SESS_TRAN)
					{
						LPRPHEADER lprpheader = (LPRPHEADER)pRequestData->m_lpData ;
						char pTemp[20];
						CString strTrCode = _T("");
						memset(pTemp, 0x00, sizeof(pTemp));
						memcpy(pTemp,lprpheader->rqhdr.trxc, sizeof(lprpheader->rqhdr.trxc));
						strTrCode = pTemp;
						strTrCode.TrimRight();
						//if( _tcscmp( (LPCTSTR)strTrCode, "pinodown" ) == 0 )			//	파일다운로드
						if( $.trim(AXIS_TRXC) == 'pinodown' )
						{
							pRqRpHeader = (LPRQRPHEADER)&m_szRecvBuf[COMMHEADER_LEN];
							if (AXIS_MSGK[0] != AXIS_DEF.MSG_TICK &&
								AXIS_MSGK[0] != AXIS_DEF.MSG_MULTI_CONN &&
								AXIS_MSGK[0] != AXIS_DEF.MSG_MODALESS &&
								AXIS_MSGK[0] != AXIS_DEF.MSG_MODALESS_DMA &&	// --> 2014/12/19 양윤창 : dma 다이얼로그 팝업 메세지
								AXIS_MSGK[0] != AXIS_DEF.MSG_SVR_ALERT_PUSH &&	// <-- 2014/12/19 양윤창
								AXIS_MSGK[0] != AXIS_DEF.MSG_SOUND_ORDER) 		// --> 2014/07/24  akh - 장중건전주문안내
							{
								if(pRequestData && ::IsWindow(hComApiWnd))
								{
									cds.dwData = 998;//LOG_FILE_DOWN_MSG;//nDataKind;				// 데이터 종류 MAKELONG ( LOG_RP, 0 );
									cds.cbData = pRequestData->m_nSize;//nSendingTrBuffSize;	// 송신 데이터 길이.
									cds.lpData = pRequestData->m_lpData ;//m_szRecvBuf + COMMHEADER_LEN;				// 송신 실제 데이터.
									::SendMessage(	hComApiWnd, WM_COPYDATA, 998, &cds);
									// 통신프로그램 핸들, 메시지, LOG_FILE_DOWN_MSG 데이터 종류, COPY DATA STRUCT

									afc.log('11  1 CTcpSocket::ReceiveTick  수신중... AXIS_DEF.ACT_CONTINUE...  strTrCode['+strTrCode+']  wPacketID['+packetId+']');
								}
							}
						}
					}
					//  [ 수정완료 ]  <--    2014/04/07  akh   

					m_RequestDataObList.m_CritSect.Unlock();
					break;
				}
				else
				{
					if(GW_SESS[0] == GW_DEF.SESS_TRAN)
					{
						LPRPHEADER lprpheader = (LPRPHEADER)pRequestData->m_lpData ;
						char pTemp[20];
						CString strTrCode = _T("");
						memset(pTemp, 0x00, sizeof(pTemp));
						memcpy(pTemp,lprpheader->rqhdr.trxc, sizeof(lprpheader->rqhdr.trxc));
						strTrCode = pTemp;
						strTrCode.TrimRight();
						if( _tcscmp( (LPCTSTR)strTrCode, "pinodown" ) == 0 || _tcscmp( (LPCTSTR)strTrCode, "pinotime" ) == 0 )			//	파일다운로드
						{
							afc.log('12  14-1 CTcpSocket::ReceiveTick  수신끝...  strTrCode['+strTrCode+']  wPacketID['+packetId+'] Que개수['+GetQueueDataCount()+']');

						}
					}
				}

				//g_pMainFrm->CommsDbgLog("test3");

				int nReceiveSize = pRequestData->m_nSize;
				pRqRpHeader = (LPRQRPHEADER) pRequestData->m_lpData;
				nTranSize = nReceiveSize - RQRPHEADER_LEN;
				if(pRqRpHeader->actf[0] & AXIS_DEF.ACT_RQ_ERROR)
				{
					pMsgHeader = (LPMSGHEADER)(pRequestData->m_lpData + RQRPHEADER_LEN);
					// --> 2015/03/30 양윤창
					// 수신 메세지헤더 메모리 중복 할당 오류 처리
					//									nTranSize -= pMsgHeader->GetMsgStructLen();
					// <-- 2015/03/30 양윤창
				}

				pRqRpHeader->SetDataLen(nTranSize);
				delete m_pAXISFrameBuf;
				m_pAXISFrameBuf = new BYTE[nReceiveSize + 1];
				memcpy(m_pAXISFrameBuf, pRequestData->m_lpData, nReceiveSize);
				m_pAXISFrameBuf[nReceiveSize] = 0;

				nSendingTrBuffSize = nReceiveSize;
				if(pRqRpHeaderEx)
					nSendingTrBuffSize += RQRPHEADEREX_LEN;
				//						}
				//
				//						{
				// CommApi가 살아 있을 경우에 보낸다.
				//////////////////////////////////////////
				// 트랜별로 인증을 확인한다. 
				// 인증 생략(무시)
				//////////////////////////////////////////
				pSendBuf = new BYTE[nSendingTrBuffSize + 1];

				if(pSendBuf)
				{
					int nCopyPos = 0;
					nMsgStructLen = 0;

					//TR헤더 복사
					memcpy(pSendBuf, pRqRpHeader, RQRPHEADER_LEN);
					nCopyPos += RQRPHEADER_LEN;

					if(pRqRpHeaderEx)
					{
						//Tran확장헤더 복사
						pRqRpHeaderEx->SetPacketLength(nSendingTrBuffSize);
						memcpy(pSendBuf + nCopyPos, pRqRpHeaderEx, RQRPHEADEREX_LEN);
						nCopyPos += RQRPHEADEREX_LEN;
					}

					//메시지
					if(pMsgHeader)
					{
						nMsgStructLen = pMsgHeader->GetMsgStructLen();
						memcpy(pSendBuf + nCopyPos, pMsgHeader, nMsgStructLen);
						nCopyPos += nMsgStructLen;

						//Note : 메시지가 크기까지 tr 데이타 크기에 포함되어 있음으로 여기서 빼주자.
						//       그래야 화면이나 DLL 단에서 혼동 없이 사용 가능하다.
						nTranSize -= nMsgStructLen;
						((LPRQRPHEADER)pSendBuf)->SetDataLen(nTranSize);
					}

					//Tran 데이타 복사
					if (nTranSize > 0)
					{
						memcpy(	pSendBuf + nCopyPos,
							   m_pAXISFrameBuf + nAXISFramePos + RQRPHEADER_LEN + nMsgStructLen, 
							   nTranSize );
					}
				}

				pSendBuf[nSendingTrBuffSize] = 0x0;

				//tran 및 메시지 헤더를 복사한다.
				memcpy(m_szRecvBuf+COMMHEADER_LEN, pSendBuf, RQRPHEADER_LEN + RQRPHEADEREX_LEN + nMsgStructLen);

				//Note : FID 그리드성 데이타 Replay에서 그리드임을 구분해 주는 '$'가 없어
				//       화면이나 컨트롤에서 파싱하는 데 문제가 있음으로 Comms에서 Reply 데이타에
				//       '$'를 임의로 넣어주도록 처리한다. (2013/1/7 변윤식 - 내 생일이다 ㅋㅋㅋ)
				if(pRequestData && pRequestData->pArrFidTabCnt->GetSize() >= 1)
				{
					RQHEADER* pRqTranHeader = (RQHEADER*)m_szRecvBuf;
											   CPtrArray* pArr = pRequestData->pArrFidTabCnt;

											   BYTE* pOrgPureData = pSendBuf + RQRPHEADER_LEN + RQRPHEADEREX_LEN + nMsgStructLen;
											   BYTE* pDestTemp = pRqTranHeader->GetDataPtr();

					if (pDestTemp != NULL)
					{
						int nPureDataLen = nSendingTrBuffSize - (RQRPHEADER_LEN + RQRPHEADEREX_LEN + nMsgStructLen);//_ttoi(pRqTranHeader->rqhdr.GetDataLen());
						int nTempPos = 0;
						int nTabCntIndex = 0;
						int nTabCnt = 0;
						BOOL bStartGrid = FALSE;
						int nAddCnt = 0;

						int i = 0, j = 0;
						for(; i < pArr->GetSize() + 1; i++)
						{
							if(i == pArr->GetSize())
								nTabCnt = -1;
							else
								nTabCnt = (int)pArr->GetAt(i);

							for(nTabCntIndex = 0; j < nPureDataLen; j++, nTempPos++)
							{
								if(nTabCnt == nTabCntIndex && !bStartGrid)
								{
									pDestTemp[nTempPos] = '$';
									nTempPos++;
									nAddCnt++;
									bStartGrid = TRUE;
									break;
								}

								if(pOrgPureData[j] == 0x0D) //그리드 데이타의 끝
									bStartGrid = FALSE;

								if(!bStartGrid && pOrgPureData[j] == 0x09)
									nTabCntIndex++;

								pDestTemp[nTempPos] = pOrgPureData[j];

							}//End of for

						}//End of for

						if(nAddCnt > 0)
						{
							int nTranDataLen = _ttoi(pRqTranHeader->rqhdr.GetDataLen());

							nSendingTrBuffSize += nAddCnt;
							nPureDataLen += nAddCnt;

							pRqTranHeader->commhdr.SetDataLen(nSendingTrBuffSize);
							pRqTranHeader->rqhdr.SetDataLen(nPureDataLen);
						}
					}
				}
				else
				{
					if (0 <= nSendingTrBuffSize && nSendingTrBuffSize <= MAX_RCV_SIZE * 100)
					{
						memcpy(m_szRecvBuf+COMMHEADER_LEN, pSendBuf, nSendingTrBuffSize);
					}
					else
					{
						CString strMsg;
						strMsg.Format ("단말 전송 사이즈 에러 [%d][%d]", nSendingTrBuffSize, MAX_RCV_SIZE * 100);
						g_pMainFrm->CommsDbgLog( strMsg );
						g_pMainFrm->WriteLogMsg(1, strMsg);
						break;
					}
				}
				
				cds.dwData = nDataKind;				// 데이터 종류 MAKELONG ( LOG_RP, 0 );
				cds.cbData = nSendingTrBuffSize;	// 송신 데이터 길이.
				cds.lpData = m_szRecvBuf + COMMHEADER_LEN;				// 송신 실제 데이터.
				//cds.lpData = pSendBuf;				// 송신 실제 데이터.


				// 통신프로그램 핸들, 메세지, 데이터 종류, COPYDATASTRUCT
				if(::IsWindow(hComApiWnd)) ::SendMessage(	hComApiWnd, WM_COPYDATA, nDataKind, &cds);
				else int bb = 0;

				delete[] pSendBuf;
				pSendBuf = NULL;

				if (pRqRpHeaderEx)
				{
					int nSendCount = pRqRpHeaderEx->GetCount();
					if ( nSendCount <= 1)
					{
						m_RequestDataObList.RemoveData( wRQID, FALSE);
						RemoveUniquePacketHwnd( wRQID );
					}
					else
					{
						free(pRequestData->m_lpData);
						pRequestData->m_lpData = NULL;
						pRequestData->m_nSize = 0;
						pRqRpHeaderEx->SetCount(nSendCount - 1);

					}
				}
			}
			else
			{
				TRACE("ID가 없는 통신이 왔음");
			}
			m_RequestDataObList.m_CritSect.Unlock();
			*/
		}
		break;
		case AXIS_DEF.MSG_TAB_SEP:			// TAB seperator presentation message
		break;
		case AXIS_DEF.MSG_REAL:				// 실시간 데이타 메세지(TRX : none, XWIN : major key, DATA(n) : minor kyes...)
		break;
		case AXIS_DEF.MSG_ENCRYPT:			// 암호화 키 transaction mode
		{
			if (m_nXecureStatus == xcHELLO) XecureClientID(m_szRecvBuf, nQueDataLen);
			else if (m_nXecureStatus == xcID) XecureClientPWD(m_szRecvBuf, nQueDataLen);
			else if (m_nXecureStatus == xcPWD) XecureClientFinal(m_szRecvBuf, nQueDataLen);
			else if (m_nXecureStatus == xc64) Xecure64HandShakingReceive(m_szRecvBuf, nQueDataLen);
		}
		break;
		case AXIS_DEF.MSG_PUBLIC_KEY:		// 공인인증 키 transaction mode
		break;
		case AXIS_DEF.MSG_TICK:				// 틱 메세지(사용자의 개별적인 실시간 데이터 (실시간 주문체결, 잔고 등)
		case AXIS_DEF.MSG_MODALESS:			// Modeless Dialog Message
		case AXIS_DEF.MSG_MULTI_CONN:		// 중복접속
		case AXIS_DEF.MSG_SOUND_ORDER:		// 장중건전주문안내(20140724 신규추가)
		case AXIS_DEF.MSG_MODALESS_DMA:		// Modeless Dialog Message : DMA
		case AXIS_DEF.MSG_SVR_ALERT_PUSH:	// server alert message(PUSH)
			 this.realProcess(dataSize);
			// nDataKind = LOG_PB;
			return;
		break;
		case AXIS_DEF.MSG_SISE_ALARM:		// 시세 알람
		break;
		case AXIS_DEF.MSG_ERROR:			// Error message (Guide Message 영역에 표시할 Message)
		break;
		default:							// 정의되지 않은 유형
			//정의되지 않은 유형이 있습니다.
			//nDatKind = -1;
		break;
	}
	/*
	// action flags (비트연산 가능)
	switch(AXIS_ACTF[0])
	{
		case AXIS_DEF.ACT_ENCRYPT:			// 메세지 암호화
		break;
		case AXIS_DEF.ACT_CONTINUE:			// 연속 메세지 존재함을 지정
		break;
		case AXIS_DEF.ACT_64BIT:			// 64bit 서버 flag : 2015.03.04 scbang 추가
		break;
		case AXIS_DEF.ACT_RQ_ERROR:			에러 처리 요청 Header 선두에 있음을 의미
											  errhdr = curpos(8) + msgtype + msglen(1)
											  curpos = 커서가 위치할 Symbol Name
											  msgtype = ( '0' : nomessge
														  '1' : field symbol 지정,
														  '2' : Guide 영역에 메시지 표시
														  '3' : DialogBox로 메시지 표지)
											  msglen = ERROR 메시지 길이 (binary value) 
		break;
	}
	
	// checking flags - 데이타 수신처리에 필요한 추가기능 정의
	switch(AXIS_CHKF[0])
	{
		case AXIS_DEF.CHK_PUBLIC_KEY:		// 공인인증서 포함
		break;
		case AXIS_DEF.CHK_OOP_TRAN:			// OOP Transaction Interface 시 사용
		break;
		default:
		break;
	}
	*/
};

/*
// 패킷, 에러정보를 세팅하고 dataOffset을 리턴하는 함수
// 수신된 값으로 항목별 사이즈가 변경되는 경우에도 처리한다.
MdQueryManager.prototype.getHeaderData = function(rcvParam)
{
	var AXIS_ACTF = this.rcvBuf.getBinary(OS_AXIS_ACTF, SZ_AXIS_ACTF);
	var AXIS_TRXC = this.rcvBuf.getOriString(OS_AXIS_TRXC, SZ_AXIS_TRXC);
	
	var AXIS_XWIN = this.rcvBuf.getBinary(OS_AXIS_XWIN, SZ_AXIS_XWIN);
	var AXIS_YWIN = this.rcvBuf.getBinary(OS_AXIS_YWIN, SZ_AXIS_YWIN);
	
	var AXIS_MSG = '';
	
	// 인증에 관한 처리 - 완전 하드 코딩임 ㅜㅜ 0x20은 변형 TR로 인정합니다.
	if(AXIS_XWIN[0] == 0x20 && AXIS_TRXC == 'axisenca')
	{
		this.rcvBuf.setBinary(OS_AXIS_SVCC, SZ_AXIS_SVCC, AXIS_YWIN);
		this.rcvBuf.setBinary(OS_AXIS_YWIN, SZ_AXIS_YWIN, [0x01]);		// 인증 트랜 Minor 값
	}
	
	// 기존에 누적해 놓은 데이터가 있는 경우
	// if() {}
	// 1프레임 데이터(지금 받은 데이터. 최소 데이터)
	// else {}
	
	var axis_msg_len = 0;
	if(AXIS_ACTF[0] == AXIS_DEF.ACT_RQ_ERROR)
	{
		var AXIS_MSGLEN = this.rcvBuf.getBinary(OS_AXIS_MSGLEN, SZ_AXIS_MSGLEN);
		axis_msg_len = SZ_AXIS_MSG_HEADER + AXIS_MSGLEN[0];
		
		var AXIS_CURPOS = this.rcvBuf.getOriString(OS_AXIS_CURPOS, SZ_AXIS_CURPOS);	// CURPOS
		// 메시지 유형 '0': No Message 1': Field Symbol '2': Guide 영역에 Message 표시 '3': Dialog Box로 Message 표시
		var AXIS_MSGTYPE = this.rcvBuf.getOriString(OS_AXIS_MSGTYPE, SZ_AXIS_MSGTYPE);
		AXIS_MSG = this.rcvBuf.getOriString(OS_AXIS_MSG, AXIS_MSGLEN[0]);
		
		if(AXIS_MSGTYPE == '3')
		{
			var win = new AMessageBox('Error Message');
			win.openBox(null, AXIS_MSG);
		}
	}
	
	console.log(axis_msg_len + '/' + this.rcvBuf.getParseInt(OS_AXIS_MLEN+axis_msg_len, SZ_AXIS_MLEN) + '/' +  SZ_GA_HEADER +'/'+ SZ_AXIS_MSG_HEADER);
    var packetSize = this.rcvBuf.getParseInt(OS_AXIS_MLEN+axis_msg_len, SZ_AXIS_MLEN) + SZ_GA_HEADER + SZ_AXIS_MSG_HEADER;
	var	packetId = 0, menuNo = '', groupName = '', trName = '', dataOffset = 0;


	this.packetInfo.packetId = this.rcvBuf.getParseInt(OS_AXIS_SVCC, SZ_AXIS_SVCC);
	
	//에러 메시지 셋팅
	this.errorData.errMsg = AXIS_MSG;
	
	//dataOffset = SZ_GA_HEADER + SZ_RCV_TMAX_HEADER + axis_msg_len;
	return SZ_GA_HEADER + axis_msg_len + SZ_RCV_TMAX_HEADER;
};
*/
//헤더 이후의 데이터 셋팅 오프셋을 리턴한다.
MdQueryManager.prototype.getInDataOffset = function()
{
	return SZ_GA_HEADER + SZ_SND_TMAX_HEADER;
};

MdQueryManager.prototype.getOutDataOffset = function()
{
	var AXIS_ACTF = this.rcvBuf.getBinary(OS_AXIS_ACTF, SZ_AXIS_ACTF);
	var axis_msg_len = 0;
	
	if(AXIS_ACTF[0] == AXIS_DEF.ACT_RQ_ERROR)
	{
		var AXIS_MSGLEN = this.rcvBuf.getBinary(OS_AXIS_MSGLEN, SZ_AXIS_MSGLEN);
		axis_msg_len = SZ_AXIS_MSG_HEADER + AXIS_MSGLEN[0];
	}
	
	return SZ_GA_HEADER + axis_msg_len + SZ_RCV_TMAX_HEADER + this.rcvBuf.getParseInt(axis_msg_len + OS_EXT_MSG_LEN, SZ_EXT_MSG_LEN);
};

MdQueryManager.prototype.setErrorData = function()
{
	var AXIS_ACTF = this.rcvBuf.getBinary(OS_AXIS_ACTF, SZ_AXIS_ACTF),
		AXIS_MSG;
		
	var axis_msg_len = 0;
	if(AXIS_ACTF[0] == AXIS_DEF.ACT_RQ_ERROR)
	{
		var AXIS_MSGLEN = this.rcvBuf.getBinary(OS_AXIS_MSGLEN, SZ_AXIS_MSGLEN);
		axis_msg_len = SZ_AXIS_MSG_HEADER + AXIS_MSGLEN[0];
		
		var AXIS_CURPOS = this.rcvBuf.getOriString(OS_AXIS_CURPOS, SZ_AXIS_CURPOS);		// CURPOS
		var AXIS_MSGTYPE = this.rcvBuf.getOriString(OS_AXIS_MSGTYPE, SZ_AXIS_MSGTYPE);	// 메시지 유형 '0': No Message 1': Field Symbol '2': Guide 영역에 Message 표시 '3': Dialog Box로 Message 표시
		
		AXIS_MSG = this.rcvBuf.getOriString(OS_AXIS_MSG, AXIS_MSGLEN[0]);
		this.errorData.errMsg = AXIS_MSG;
		
		if(AXIS_MSGTYPE == '3')
		{
			var win = new AMessageBox('Error Message');
			win.openBox(null, AXIS_MSG);
		}
	}
};

MdQueryManager.prototype.makePacketId = function()
{
	++this.packetId;
	if(this.packetId  > 999) this.packetId = 0;
	return this.packetId;
};

MdQueryManager.prototype.send_log_helper = function(sendLen)
{
	// isShowLog를 세팅하지 않으면 로그를 남기지 않는다.
	if(!this.isShowLog) return;
	
	//----------------------------------------------------------------------------------------------------------------------------------------
	//	for debug
	
	var packetType;
	var abuf = this.sndBuf;
	var qryName = abuf.getOriString(OS_SVC_ID, SZ_SVC_ID),
		dataOffset = SZ_GA_HEADER + SZ_SND_TMAX_HEADER;

	console.log('[' + qryName + '] in Send Buffer Header >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> sendLen : ' + sendLen);

	abuf.printBySize(TR_GW_SIZE_INFO, 0);
	abuf.printBySize(TR_AXIS_SIZE_INFO, SZ_GW_HEADER);
	abuf.printBySize(TR_SND_SIZE_INFO, SZ_GA_HEADER);
	//abuf.printBuffer(0, dataOffset);

	console.log('[' + qryName + '] in Send Buffer Body >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> dataOffset : ' + dataOffset);

	abuf.printBuffer(dataOffset, sendLen-dataOffset);
	//--------------------------------------------------------------------------------------------------------------------------------
};

//onReceive 함수 내에서 패킷 타입에 따라 분기하여 호출되는 함수
MdQueryManager.prototype.realProcess = function()
{
	//----------------------------------------------------
	
	//	1. 쿼리 네임을 얻어 queryData 를 생성한다.
	//	var qryName = this.rcvBuf.nextOriString(4),
	//		aquery = AQuery.getSafeQuery(qryName),
	//		queryData = this.makeQueryData(aquery);
	
	//	2. queryData 객체에 값을 채우고 dataKey 값을 구한 후
	//	queryData.outBlockData(this.rcvBuf, offset);
		
	//	3. realDataToComp 함수를 호출한다.
	
	//----------------------------------------------------
	
	//afc.log('realProcess');
	return;
	/*
	var GW_SESS = this.sndBuf.getBinary(OS_GW_SESS, SZ_GW_SESS);
	var AXIS_MSGK = this.sndBuf.getBinary(OS_AXIS_MSGK, SZ_AXIS_MSGK);
	//리얼 데이타 크기
	//int nRealDataLen	= _ttoi(pCommHeader->GetDataLen());
	
	if(GW_SESS[0] == GW_DEF.SESS_TRAN)
	{
		var AXIS_MLEN = this.sndBuf.getNumString(OS_AXIS_MLEN, SZ_AXIS_MLEN);
		dataSize = AXIS_MLEN + SZ_REAL_HEADER;
		//nRealDataLen = atoi(pRqRpHeader->GetDataLen()) + (sizeof(REALHEADER) - 1);
	}
	var dataOffset = SZ_GW_HEADER;
	//nGWFramePos	= COMMHEADER_LEN;

	if(nRealDataLen > 0)
	{
		BYTE* pSendBuf = new BYTE[nRealDataLen + 1];
		if(pSendBuf != NULL)
		{
			if (GW_SESS[0] == GW_DEF.SESS_TRAN)	// TRAN인데 넘어온 경우
			{
				LPREALHEADER lprealheader = pSendBuf;
				memset(lprealheader, 0x00, sizeof(REALHEADER));
				if (AXIS_MSGK[0] == AXIS_DEF.MSG_TICK) this.sndBuf.setOriString(OS_RHDR_GUBN, SZ_RHDR_GUBN, 'D00');
				else if (AXIS_MSGK[0] == AXIS_DEF.MSG_MULTI_CONN) this.sndBuf.setOriString(OS_RHDR_GUBN, SZ_RHDR_GUBN, 'D01');
				else if (AXIS_MSGK[0] == AXIS_DEF.MSG_MODALESS) this.sndBuf.setOriString(OS_RHDR_GUBN, SZ_RHDR_GUBN, 'D02');
				else if (AXIS_MSGK[0] == AXIS_DEF.MSG_MODALESS_DMA) this.sndBuf.setOriString(OS_RHDR_GUBN, SZ_RHDR_GUBN, 'D04');	// dma 다이얼로그 팝업 메세지(2014/12/19 양윤창)
				else if (AXIS_MSGK[0] == AXIS_DEF.MSG_SVR_ALERT_PUSH) this.sndBuf.setOriString(OS_RHDR_GUBN, SZ_RHDR_GUBN, 'D05');	
				else if (AXIS_MSGK[0] == AXIS_DEF.MSG_SOUND_ORDER) this.sndBuf.setOriString(OS_RHDR_GUBN, SZ_RHDR_GUBN, 'D03');		// 장중건전주문안내(2014/07/24 akh)
				
				this.sndBuf.setNumString(OS_RHDR_RTSL, SZ_RHDR_RTSL, dataSize - SZ_REAL_HEADER);
				
				//this.sndBuf.setOriString(OS_RHDR_RTSM, SZ_RHDR_RTSM, dataSize - SZ_REAL_HEADER);	// 메시지
				
// 				wsprintf((LPSTR)lprealheader->rtsl, "%03d", nRealDataLen - (sizeof(REALHEADER) - 1));
// 				memcpy(lprealheader->rtsm, &m_pGWFrameBuf[nGWFramePos + sizeof(RQRPHEADER)], nRealDataLen - (sizeof(REALHEADER) - 1));
			}
			else
			{
				memcpy(pSendBuf, &m_pGWFrameBuf[nGWFramePos], nRealDataLen);
			}
			pSendBuf[nRealDataLen] = 0x0;

			//  [ 수정내용 ]  - [시세PoolData] 큐개수를 전달한다.
			nDataKind  = MAKELONG ( LOG_PB + nFirst, nCurQueCnt);

			cds.dwData = nDataKind;			// 데이터 종류 MAKELONG ( LOG_SB, 0 );
			cds.cbData = nRealDataLen;		// 송신 데이터 길이.
			cds.lpData = pSendBuf;			// 송신 실제 데이터.

			// 통신프로그램 핸들. 메세지. 데이터 종류 COPYDATASTRUCT
			::SendMessage(	(HWND)hWndCommAPI, WM_COPYDATA,	(WPARAM)nDataKind, (LPARAM)&cds);
			delete[] pSendBuf;
		}
	}
	else
	{
		afc.log('리얼데이터 포맷 이상 nRealDataLen '+nRealDataLen+',nPos '+nGWFramePos+', Data '+&m_pGWFrameBuf[nGWFramePos]);
	}
	*/
//--------------------------------------
//	for debug
//console.log('in real Recv Buffer ----------------------------- ' + dataSize);
//this.rcvBuf.printBuffer(0, dataSize, 16);
		
	var trName = this.rcvBuf.getOriString(OS_TR_CODE, SZ_TR_CODE); // 서비스명
	var aquery = AQuery.getSafeQuery(trName);
	var queryData = new AQueryData(aquery);
	var dataOffset = SZ_GW_HEADER;
	var dataKey = queryData.outBlockData_SFID(this.rcvBuf, dataOffset);
	
	if(!dataKey) dataKey = trName; //return;
	
//asoocool test	
//queryData.printQueryData();

	//dataKey 가 동일한 컴포넌트 들은 일단 모두 updateComponent 를 호출해 줘야 한다.(updateComponent 내부 주석 참조)
	var compArray = this.getRealComps(dataKey);
	if(compArray)
	{
		queryData.isReal = true;
		
		//packet skip
		var newTime = new Date().getTime();
		var acomp;
		
		for(var i=0; i<compArray.length; i++)
		{
			acomp = compArray[i];
			/*
			//unregisterReal 호출 후 리얼이 올 수도 있으므로 null 비교해야 함.
			//자신에게 해당사항이 없는 쿼리는 호출되지 않도록 함.
			if(acomp.curRealQuery && acomp.curRealQuery.hasQueryDataKey(queryData))
			{
				//리얼타입이 update 이면 
				//시간 간격을 체크하여 updateComponent 를 스킵한다.
				if(acomp.updateType==0)
				{
					//update all
					if( (newTime-acomp.prevUpdateTime) > 100)
					{
						acomp.prevUpdateTime = newTime;
						
						//-----------------------------------
						
						if(acomp.isPacketSkip)
						{
							//afc.log('---- call updateSkippedComp ----------- ' +  acomp.getComponentId());
							
							this.updateSkippedComp(acomp);
						}
						else
						{
							//afc.log('---- update part ----------------------' +  acomp.getComponentId());
						
							queryData.setQuery(acomp.curRealQuery);
							acomp.updateComponent(queryData);
						}
					}
					
					//packet skip
					else
					{
						//afc.log('---- packet skip ---------------------- ' +  acomp.getComponentId());
						acomp.isPacketSkip = true;
					}
				}
				
				//insert
				else
				{
					queryData.setQuery(acomp.curRealQuery);
					acomp.updateComponent(queryData);
				}
			
			}
			*/
			
			//	orignal code
			//리얼타입이 insert 인 경우 자신에게 해당사항이 없는 쿼리는 호출되지 않도록 함.
			//if(acomp.updateType==0 || acomp.curRealQuery.hasQueryDataKey(queryData)) {}
			queryData.setQuery(aquery);
			acomp.updateComponent(queryData);
// 			afc.log('REAL PROCESS-------------------------------------');
// 			queryData.printQueryData();
		}
	}
};


MdQueryManager.prototype.makeHeader = function(queryData, abuf, menuNo)
{
	var packetId = this.makePacketId(), qryHeaderInfo = null;

	//--------------------------------------------------
	//	Common Header
	//--------------------------------------------------
	// ▲:변경될 수 있는 항목
	// ★:로그인 후 세팅해야하는 항목
	// ●:개발자가 입력해야하는 부분
	
	var sz_prev_header = SZ_GA_HEADER;
	
	abuf.setChar(sz_prev_header + OS_EYE_CATCH, this.headerInfo.EYE_CATCH);		 			// 시스템 환경 정보 구분	-> 개발:"D" 검증:"T" 운영:"R"
	abuf.setChar(sz_prev_header + OS_CMPRS_TCD, queryData.getFlag('zipFlag')); 				// 압축 구분 코드 -> 압축X:0 압축:1
	abuf.setChar(sz_prev_header + OS_ENC_TCD, queryData.getFlag('encFlag')); 				// 암호화 구분 코드 -> 평문:0 암호화:1
	abuf.setChar(sz_prev_header + OS_RQRS_TCD, "S");							 			// 요청 응답 구분 코드 -> 요청:"S" 응답"R" 비요청"B"
// 	abuf.setChar(sz_prev_header + OS_SYS_LNK_TCD, "");						 				// 시스템 연계 구분 코드 -> 타발:"I" 당발:"O" 도메인 게이트:"D"

	// ●업무 시스템 구분 코드 -> 업무계:"1" 정보계:"2" 퇴직:"3" 랩어카운트:"4"
	qryHeaderInfo = queryData.headerInfo['biz_sys_tcd'];
	if(!qryHeaderInfo) qryHeaderInfo = this.headerInfo.biz_sys_tcd;
	abuf.setChar(sz_prev_header + OS_BIZ_SYS_TCD, qryHeaderInfo);

	// ●업무 시스템 SEQ -> 랜덤:"0" 1호기:"1" 2호기:"2" 3호기:"3" 4호기:"4" 0~9
	qryHeaderInfo = queryData.headerInfo['biz_sys_seq'];
	if(!qryHeaderInfo) qryHeaderInfo = '0';
	abuf.setChar(sz_prev_header + OS_BIZ_SYS_SEQ, qryHeaderInfo);
	
	abuf.setChar(sz_prev_header + OS_GUID_CRT, "C"); 										// GUID 생성자 분류 -> 채널:"C" 배치:"B" 대외인터페이스:"I" Legacy(주문매체포함):"L" 배치다발건 온라인대외거래 호출:"P"
// 	abuf.setOriString(sz_prev_header + OS_GUID_BP_HN, SZ_GUID_BP_HN, ""); 					// GUID 접속서버의 호스트네임
// 	abuf.setOriString(sz_prev_header + OS_GUID_BP_PID, SZ_GUID_BP_PID, ""); 				// GUID 접속서버의 PID
// 	abuf.setOriString(sz_prev_header + OS_GUID_DATE, SZ_GUID_DATE, ""); 					// GUID 거래일자 -> YYYYMMDD
// 	abuf.setOriString(sz_prev_header + OS_GUID_TIME, SZ_GUID_TIME, "");						// GUID 거래시각 -> HHMMSS + 밀리세컨드(3) + 마이크로세컨드(3)
	abuf.setChar(sz_prev_header + OS_CONN_SRNO, "0"); 										// ▲연동일련번호 -> 0~9
	abuf.setOriString(sz_prev_header + OS_CHNL_CD, SZ_CHNL_CD, "101"); 						// ▲채널코드
	abuf.setChar(sz_prev_header + OS_TR_GB, "0"); 											// TR구분 -> 사용자액션:"0" 시스템호출 이벤트:"1" 시스템호출 타이머:"2"
	abuf.setOriString(sz_prev_header + OS_SVC_ID, SZ_SVC_ID, queryData.getQueryName()); 	// 서비스ID -> 단위업무코드(2)+업무별 정의코드(1)+"s"+일련번호(4)+거래유형 구분코드(1)+참조코드(1) (ex. aabs0010u0)
 	abuf.setOriString(sz_prev_header + OS_SCRN_NO, SZ_SCRN_NO, menuNo); 					// 화면번호 -> 화면번호(4) + 탭번호(1)
	abuf.setNumString(sz_prev_header + OS_OBJECT_ID, SZ_OBJECT_ID, packetId); 				// ObjectID -> packetId를 저장한다
	abuf.setOriString(sz_prev_header + OS_OBJECT_IO_VER, SZ_OBJECT_IO_VER, queryData.getQuery().getIoVer()); 	// Object I/O버전 -> "01" ~ "ZZ"
	
	// ●화면조작구분코드 -> "C", "R" ,"U", "D"
	qryHeaderInfo = queryData.headerInfo['scrn_oprt_tcd'];
	if(!qryHeaderInfo) qryHeaderInfo = "R";
	abuf.setChar(sz_prev_header + OS_SCRN_OPRT_TCD, qryHeaderInfo);
	
	// ●계좌비밀번호스킵여부 -> 스킵:"Y" 스킵X:"N"
	qryHeaderInfo = queryData.headerInfo['ac_pwd_skip_yn'];
	if(!qryHeaderInfo) qryHeaderInfo = "N";
	abuf.setChar(sz_prev_header + OS_AC_PWD_SKIP_YN, qryHeaderInfo);
	
	// ●거래매체 -> 키보드:"00" 카드:"01" 통장:"02"
	qryHeaderInfo = queryData.headerInfo['media'];
	if(!qryHeaderInfo) qryHeaderInfo = "00";
	abuf.setOriString(sz_prev_header + OS_MEDIA, SZ_MEDIA, qryHeaderInfo);
	
	abuf.setChar(sz_prev_header + OS_LANG_CD, "H"); 										// 언어구분코드 -> 한글:"H" 영문:"E"
	abuf.setChar(sz_prev_header + OS_USER_TCD, this.headerInfo.USER_TCD); 					// ★사용자구분코드 -> 해당없음(로그인TR):"0" 고객:"1" 직원:"2"
 	abuf.setOriString(sz_prev_header + OS_DEPT_ID, SZ_DEPT_ID, this.headerInfo.DEPT_ID);	// ★부서ID
 	abuf.setOriString(sz_prev_header + OS_USER_ID, SZ_USER_ID, this.headerInfo.USER_ID);	// ★사용자ID
	
	// ●스키마구분코드 -> AP서버에서 2개 이상의 DB스키마로 선택 접속해야 할 경우 사용 "4": RK "5": 과기공 (20170717 신규)
	qryHeaderInfo = queryData.headerInfo['scm_tcd'];
	if(!qryHeaderInfo) qryHeaderInfo = "";
 	abuf.setChar(sz_prev_header + OS_SCM_TCD, qryHeaderInfo);
	
// 	abuf.setOriString(sz_prev_header + OS_RESV_AREA, SZ_RESV_AREA, "");										// FILLER
	abuf.setOriString(sz_prev_header + OS_PBLC_IP_ADDR, SZ_PBLC_IP_ADDR, this.headerInfo.PBLC_IP_ADDR); 	// 공인 IP
	abuf.setOriString(sz_prev_header + OS_PRVT_IP_ADDR, SZ_PRVT_IP_ADDR, this.headerInfo.PRVT_IP_ADDR); 	// 사설 IP
	abuf.setOriString(sz_prev_header + OS_MAC_ADR, SZ_MAC_ADR, this.headerInfo.MAC_ADR); 					// Mac 주소
	abuf.setOriString(sz_prev_header + OS_TMNL_OS_TCD, SZ_TMNL_OS_TCD, this.headerInfo.TMNL_OS_TCD); 		// 단말 OS 구분 코드 MS Win:"PC" MAC:"MC" AND:"AP" IPHONE:"IP" IPAD:"ID" AND PAD:"AD" 기타:"ZZ"
	abuf.setOriString(sz_prev_header + OS_TMNL_OS_VER, SZ_TMNL_OS_VER, this.headerInfo.TMNL_OS_VER); 		// 단말 OS 버전
	abuf.setOriString(sz_prev_header + OS_TMNL_BROW_TCD, SZ_TMNL_BROW_TCD, this.headerInfo.TMNL_BROW_TCD); 	// 단말 브라우저 구분 코드 익스플로러:"IE" 사파리:"SF" 파이어폭스:"FX" 크롬:"CR" 오페라:"OP" WEBKIT:"WK" 기타:"ZZ"
	abuf.setOriString(sz_prev_header + OS_TMNL_BROW_VER, SZ_TMNL_BROW_VER, this.headerInfo.TMNL_BROW_VER); 	// 단말 브라우저 버전
	
	this.makeAxisHeader(queryData, abuf, menuNo, packetId);
	
	return packetId;
};

MdQueryManager.prototype.makeAxisHeader = function(queryData, abuf, menuNo, packetId)
{
	//--------------------------------------------------
	//	AXIS Header
	//--------------------------------------------------
	
	abuf.setBinary(OS_AXIS_MSGK, SZ_AXIS_MSGK, [AXIS_DEF.MSG_NORMAL]);		/* I,O message id.
																				0x20 일반 메세지
																				0x22 TAB seperator presentation message
																				0x50 실시간 데이타 메세지
																					 (TRX : none, XWIN : major key, DATA(n) : minor kyes...)
																				0x80 암호화 키 transaction mode
																				0x81 공인인증 키 transaction mode
																				0x82 Sign-on transaction
																				0x90 틱 메세지(사용자의 개별적인 실시간 데이터 (실시간 주문체결, 잔고 등)
																				0x91 Modeless Dialog Message
																				0x92 시세 알람
																				0x99 Error message (Guide Message 영역에 표시할 Message)
																			*/
	abuf.setBinary(OS_AXIS_ACTF, SZ_AXIS_ACTF, [0x00]);						/* action flags
																				0x02 메세지 암호화
																				0x08 연속 메세지 존재함을 지정
																				0x64 64bit 서버 flag : 2015.03.04 scbang 추가
																				0x80 에러 처리 요청 Header 선두에 있음을 의미
																					errhdr = curpos(8) + msgtype + msglen(1)
																					curpos = 커서가 위치할 Symbol Name
																					msgtype = (  '0' : nomessge
																								 '1' : field symbol 지정,
																								 '2' : Guide 영역에 메시지 표시
																								 '3' : DialogBox로 메시지 표시	)
																					msglen = ERROR 메시지 길이 (binary value)
																			*/
	abuf.setBinary(OS_AXIS_CHKF, SZ_AXIS_CHKF, [0x00]);						// checking flags - 데이타 수신처리에 필요한 추가기능 정의0x08: 공인인증서 포함 0x10: OOP Transaction Interface 시 사용
	abuf.setBinary(OS_AXIS_XWIN, SZ_AXIS_XWIN, [0x25]); 					// Major Window ID (0x20 - 0x7f) 32 - 127
	abuf.setBinary(OS_AXIS_YWIN, SZ_AXIS_YWIN, [0x00]); 					// Minor Window ID (0x00 - 0xff) 0 - 255
	abuf.setBinary(OS_AXIS_KEYC, SZ_AXIS_KEYC, [0x00]); 					// action key code 항상 0x00
	abuf.setBinary(OS_AXIS_KEYF, SZ_AXIS_KEYF, [0x00]); 					// next key action flags - 항상 0x00
 	abuf.setNumString(OS_AXIS_SVCC, SZ_AXIS_SVCC, packetId);				// service region code - Not use
	abuf.setOriString(OS_AXIS_TRXC, SZ_AXIS_TRXC, 'PIBOBMAX');				// ★I,O transaction code - Transaction Name (혹은 데이타 수신시에는 MAP-NAME으로 사용)
																			// BP서버에서 각 매체를 구분하는 값, 추후 WEB용으로 명칭을 바꿔야함.
	abuf.setNumString(OS_AXIS_MLEN, SZ_AXIS_MLEN, abuf.getDataSize()-SZ_GA_HEADER);	// ASCII CHAR 자기 자신을 포함하지 않는 데이터 길이
	
	this.makeGwHeader(queryData, abuf, menuNo);
};

MdQueryManager.prototype.makeGwHeader = function(queryData, abuf, menuNo)
{
	//--------------------------------------------------
	//	G/W Header
	//--------------------------------------------------
	abuf.setBinary(OS_GW_FILLER1, SZ_GW_FILLER1, [GW_DEF.FITCH]);		// G/W 헤더 시작임을 표시
	abuf.setBinary(OS_GW_FILLER2, SZ_GW_FILLER2, [GW_DEF.FITCH]);		// G/W 헤더 시작임을 표시
	abuf.setBinary(OS_GW_CTRL, SZ_GW_CTRL, [GW_DEF.CTL_NORMAL]);		// frame control char
	abuf.setBinary(OS_GW_SESS, SZ_GW_SESS, [GW_DEF.SESS_TRAN]);			// what session
	abuf.setBinary(OS_GW_CHCK, SZ_GW_CHCK, [0x20]); 					// checking status
//	abuf.setOriString(OS_GW_RSVD, SZ_GW_RSVD, "");						// reserved
	abuf.setNumString(OS_GW_DLEN, SZ_GW_DLEN, abuf.getDataSize()-SZ_GW_HEADER);	// data length
	
	//return packetId;
};

