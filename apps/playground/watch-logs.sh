#!/bin/bash

# 로그 파일 감시 스크립트
LOG_FILE="dev.log"

echo "📝 Monitoring development server logs..."
echo "Server URL: http://localhost:4000"
echo "Press Ctrl+C to stop monitoring"
echo "========================================="

# 로그 파일 실시간 감시
tail -f $LOG_FILE | while read line; do
    # 에러 메시지를 빨간색으로 표시
    if [[ $line == *"Error"* ]] || [[ $line == *"error"* ]] || [[ $line == *"failed"* ]]; then
        echo -e "\033[91m$line\033[0m"
    # 경고 메시지를 노란색으로 표시
    elif [[ $line == *"Warning"* ]] || [[ $line == *"warning"* ]] || [[ $line == *"warn"* ]]; then
        echo -e "\033[93m$line\033[0m"
    # 성공 메시지를 초록색으로 표시
    elif [[ $line == *"✓"* ]] || [[ $line == *"success"* ]] || [[ $line == *"compiled"* ]]; then
        echo -e "\033[92m$line\033[0m"
    # 일반 메시지
    else
        echo "$line"
    fi
done