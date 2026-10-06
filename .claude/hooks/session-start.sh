#!/bin/bash
# 클라우드 세션 시작 시 의존성 설치. 로컬에서는 아무것도 하지 않는다.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm install --no-audit --no-fund
