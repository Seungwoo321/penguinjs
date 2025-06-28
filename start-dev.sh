#!/bin/bash

# 로그 디렉토리 생성
mkdir -p /tmp/penguinjs-logs

# 현재 시간을 파일명에 포함
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="/tmp/penguinjs-logs/dev_${TIMESTAMP}.log"

echo "🐧 PenguinJS 개발 서버를 시작합니다..."
echo "📝 로그 파일: ${LOG_FILE}"
echo "🌐 브라우저에서 http://localhost:3000/ko 로 접속하세요"
echo ""
echo "서버 시작 중... (로그는 ${LOG_FILE}에서 확인할 수 있습니다)"

# pnpm dev 실행하고 로그를 파일과 콘솔에 동시 출력
pnpm dev 2>&1 | tee "${LOG_FILE}"