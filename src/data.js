export const users = [
  { id: 'driver-1', name: '김현우', role: 'driver' },
  { id: 'owner-1', name: '이서연', role: 'owner' },
  { id: 'owner-2', name: '박지훈', role: 'owner' },
];

export const initialSpaces = [
  { id: 'space-1', ownerId: 'owner-1', title: '연남동 골목 안 전용 주차공간', address: '서울 마포구 동교로 38길 12', region: '홍대입구역', neighborhood: '연남동', price: 2200, availableFrom: '07:00', availableTo: '23:00', vehicleLimit: '중형차까지', description: '연남동 카페거리에서 가까운 넉넉한 주차공간입니다. 진입로가 평탄해 초행길에도 편하게 이용할 수 있어요.', tags: ['진입 쉬움', 'CCTV', '카페거리 인근'], distance: '도보 3분', x: 31, y: 37, visual: 'mint' },
  { id: 'space-2', ownerId: 'owner-1', title: '홍대 정문 앞 지하 주차장', address: '서울 마포구 와우산로 94', region: '홍대입구역', neighborhood: '서교동', price: 2800, availableFrom: '06:00', availableTo: '24:00', vehicleLimit: 'SUV까지', description: '홍대 정문에서 가까운 실내 주차공간입니다. 비 오는 날에도 편하게 이동할 수 있습니다.', tags: ['실내', '넓은 공간', '24시 출차'], distance: '도보 5분', x: 63, y: 45, visual: 'lavender' },
  { id: 'space-3', ownerId: 'owner-2', title: '합정역 7번 출구 옆 주차공간', address: '서울 마포구 독막로 10', region: '합정역', neighborhood: '합정동', price: 1800, availableFrom: '09:00', availableTo: '22:00', vehicleLimit: '중형차까지', description: '합정역 7번 출구까지 걸어서 2분. 골목 초입이라 찾기 쉽습니다.', tags: ['역세권', '진입 쉬움'], distance: '도보 2분', x: 48, y: 70, visual: 'peach' },
  { id: 'space-4', ownerId: 'owner-2', title: '망원시장 가까운 편안한 주차', address: '서울 마포구 포은로 8길 20', region: '망원역', neighborhood: '망원동', price: 1500, availableFrom: '08:00', availableTo: '21:00', vehicleLimit: '소형차까지', description: '망원시장과 망리단길 사이에 있는 조용한 주차공간입니다.', tags: ['시장 인근', '가성비'], distance: '도보 6분', x: 74, y: 26, visual: 'blue' },
  { id: 'space-5', ownerId: 'owner-2', title: '신촌역 뒷길 프라이빗 주차', address: '서울 서대문구 연세로 12길 5', region: '신촌역', neighborhood: '창천동', price: 2000, availableFrom: '10:00', availableTo: '23:00', vehicleLimit: 'SUV까지', description: '번화가 한 블록 뒤에 있어 복잡하지 않고, 밤에도 조명이 밝습니다.', tags: ['조명 밝음', '넓은 공간'], distance: '도보 4분', x: 22, y: 62, visual: 'sage' },
];

export const regions = ['홍대입구역', '합정역', '망원역', '신촌역'];
