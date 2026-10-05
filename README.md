# Parkly 프로토타입

React와 Vite로 만든 프론트엔드 중심 주차공간 검색·예약 프로토타입입니다. 서버, 인증, 지도 API, 실제 결제 없이 동작합니다.

## 실행

Node.js 20.19 이상 또는 22.12 이상이 필요합니다.

```bash
cd parkly-prototype
npm install
npm run dev
```

터미널에 표시되는 로컬 주소(기본 `http://localhost:5173`)를 브라우저에서 여세요.

배포용 빌드 확인:

```bash
npm run build
npm run preview
```

## 화면 흐름

- 운전자: 홈 → 지역·날짜·시간 검색 → 검색 결과 → 공간 상세 → 예약 → 완료 → 내 예약
- 공간 제공자: 내 주차공간 → 공간 등록 → 등록 공간 확인 → 들어온 예약 확인

상단 메뉴에서 운전자와 공간 제공자 화면을 오갈 수 있습니다. 프로토타입에서는 운전자 `김현우`, 공간 제공자 `이서연`이 고정된 Mock 사용자입니다.

## 데이터와 동작

- `User`, `ParkingSpace`, `Reservation`만 사용합니다.
- 초기 공간 5개가 포함되어 있습니다. 새 공간과 예약은 브라우저 `localStorage`에 저장되어 새로고침 후에도 유지됩니다.
- 검색은 지역 문자열, 공간 이용 가능 시간, 기존 예약과 겹치는 시간을 기준으로 결과를 좁힙니다.
- 지도 모양 영역은 위치를 설명하는 목업입니다. 실제 지도나 경로 안내가 아닙니다.
- 예약 확정은 Mock 처리이며 실제 결제, 알림, 인증은 없습니다.
- 저장된 데모 데이터를 초기화하려면 브라우저 개발자 도구에서 `parkly.spaces.v1`, `parkly.reservations.v1` 로컬 저장소 항목을 삭제하세요.

## 폴더 구조

```text
parkly-prototype/
├─ index.html
├─ package.json
├─ package-lock.json
├─ src/
│  ├─ App.jsx          # 화면과 사용자 흐름
│  ├─ data.js          # 초기 사용자·주차공간 Mock 데이터
│  ├─ repository.js    # localStorage 기반 Mock Repository
│  ├─ main.jsx         # React 진입점
│  └─ styles.css       # 반응형 UI
└─ README.md
```
