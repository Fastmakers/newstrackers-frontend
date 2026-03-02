# Career Dashboard (취업 전략 대시보드)

자기소개서 기반으로 취업 전략을 시각화하는 React + Vite 프로젝트입니다.
현재 버전은 백엔드 연동 전 스켈레톤으로, 업로드/입력 후 분석 결과 화면을 데모 형태로 보여줍니다.

## Tech Stack

- React 18
- Vite 6
- TypeScript
- Lucide React (아이콘)

## 주요 기능

- 자소서 PDF 파일 선택 UI
- 지원 정보 입력 폼 (이름, 희망 산업군, 목표 기업, 희망 직무, 경력 사항)
- 분석 시뮬레이션 후 결과 탭 전환
- 결과 화면 3개 섹션
  - 산업 동향 분석
  - 자소서 첨삭 결과
  - SWOT 분석

## 프로젝트 구조

```text
src/
  App.tsx
  main.tsx
  index.css
  components/
    UploadSection.tsx
    IndustryAnalysis.tsx
    ResumeReview.tsx
    SwotAnalysis.tsx
```

## 실행 방법

```bash
# 1) 의존성 설치
npm install

# 2) 개발 서버 실행
npm run dev
```

기본 실행 주소: `http://localhost:3000`

## 빌드

```bash
npm run build
```

빌드 결과물은 `build/` 디렉터리에 생성됩니다.

## Git 업로드 (dev 브랜치)

```bash
# dev 브랜치로 이동 (없으면 생성)
git switch dev || git switch -c dev

# 변경사항 커밋
git add .
git commit -m "docs: update README"

# 원격 dev 브랜치 푸시
git push -u origin dev
```

## 참고

- 현재 분석 데이터는 하드코딩/시뮬레이션입니다.
- 실제 AI 분석 및 PDF 파싱은 추후 백엔드/모델 연동이 필요합니다.
