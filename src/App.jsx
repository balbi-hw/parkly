import React, { useEffect, useMemo, useState } from 'react';
import { initialSpaces, regions, users } from './data';
import { createId, mockRepository } from './repository';

const money = (n) => new Intl.NumberFormat('ko-KR').format(n);
const dateLabel = (value) => new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${value}T12:00:00`));
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const defaultDate = () => new Date().getHours() >= 18 ? tomorrow() : today();
const hours = (start, end) => (Number(end.slice(0, 2)) * 60 + Number(end.slice(3)) - Number(start.slice(0, 2)) * 60 - Number(start.slice(3))) / 60;
const validFuture = (date, start) => new Date(`${date}T${start}:00`).getTime() > Date.now();
const overlap = (a, b) => a.start < b.end && b.start < a.end;

function Icon({ name, size = 20, stroke = 1.8 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    back: <path d="M19 12H5m6-6-6 6 6 6"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    car: <><path d="m4 10 2-5h12l2 5v9H4v-9Z"/><path d="M4 14h16M7 17h1m8 0h1M2 10h20"/></>,
    check: <path d="m4 12 5 5L20 6"/>,
    shield: <><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></>,
    spark: <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2ZM19 18v4m-2-2h4"/>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.1M3 12h.1M3 18h.1"/></>,
    close: <path d="M5 5l14 14M19 5 5 19"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function SpaceVisual({ space, small = false }) {
  return <div className={`space-visual visual-${space.visual || 'mint'} ${small ? 'space-visual-small' : ''}`}>
    {space.photoUrl ? <img src={space.photoUrl} alt={`${space.title} 주차공간`} onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : null}
    <div className="visual-scene"><span className="visual-sun"/><span className="visual-building one"/><span className="visual-building two"/><span className="visual-road"/><span className="visual-car"><span/></span></div>
    {!small && <span className="visual-caption"><Icon name="car" size={15}/> PARKLY SPACE</span>}
  </div>;
}

function SearchFields({ search, updateSearch, submitSearch, compact = false }) {
  return <form className={`search-form ${compact ? 'compact' : ''}`} onSubmit={submitSearch}>
    <label className="field region-field"><span><Icon name="pin" size={18}/> 지역</span><input name="region" list="regions" value={search.region} onChange={updateSearch} placeholder="어디에 주차하시나요?"/><datalist id="regions">{regions.map((region) => <option key={region} value={region}/>)}</datalist></label>
    <label className="field"><span><Icon name="calendar" size={18}/> 날짜</span><input name="date" type="date" min={today()} value={search.date} onChange={updateSearch}/></label>
    <label className="field"><span><Icon name="clock" size={18}/> 시작</span><input name="start" type="time" value={search.start} onChange={updateSearch}/></label>
    <label className="field"><span><Icon name="clock" size={18}/> 종료</span><input name="end" type="time" value={search.end} onChange={updateSearch}/></label>
    <button className="button button-primary search-button" type="submit"><Icon name="search" size={19}/> 주차공간 찾기</button>
  </form>;
}

function App() {
  const [page, setPage] = useState('home');
  const [spaces, setSpaces] = useState(() => mockRepository.getSpaces());
  const [reservations, setReservations] = useState(() => mockRepository.getReservations());
  const [search, setSearch] = useState({ region: '홍대입구역', date: defaultDate(), start: '18:00', end: '21:00' });
  const [selectedId, setSelectedId] = useState(initialSpaces[0].id);
  const [completedId, setCompletedId] = useState(null);
  const [error, setError] = useState('');
  const [listOpen, setListOpen] = useState(true);
  const selected = spaces.find((space) => space.id === selectedId);
  const completed = reservations.find((reservation) => reservation.id === completedId);
  const owner = users.find((user) => user.role === 'owner');
  const driver = users.find((user) => user.role === 'driver');

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setError(''); }, [page]);

  const results = useMemo(() => spaces.filter((space) => {
    const q = search.region.trim().toLowerCase();
    const matches = !q || [space.region, space.neighborhood, space.address, space.title].some((value) => value.toLowerCase().includes(q));
    const available = search.start >= space.availableFrom && search.end <= space.availableTo;
    const reserved = reservations.some((reservation) => reservation.spaceId === space.id && reservation.date === search.date && overlap(reservation, search));
    return matches && available && !reserved;
  }), [spaces, reservations, search]);

  function go(next) { setPage(next); }
  function openSpace(space) { setSelectedId(space.id); go('detail'); }
  function updateSearch(event) { setSearch((current) => ({ ...current, [event.target.name]: event.target.value })); }
  function validateSearch() {
    if (!search.region.trim()) return '검색할 지역을 입력해 주세요.';
    if (!search.date || !search.start || !search.end) return '날짜와 이용 시간을 모두 선택해 주세요.';
    if (hours(search.start, search.end) <= 0) return '종료 시간은 시작 시간보다 늦어야 해요.';
    if (!validFuture(search.date, search.start)) return '현재 이후의 날짜와 시간을 선택해 주세요.';
    return '';
  }
  function submitSearch(event) { event.preventDefault(); const message = validateSearch(); if (message) { setError(message); return; } go('results'); }
  function submitReservation() {
    const message = validateSearch();
    if (message) { setError(message); return; }
    if (search.start < selected.availableFrom || search.end > selected.availableTo) { setError('이 공간의 이용 가능 시간을 확인해 주세요.'); return; }
    if (reservations.some((r) => r.spaceId === selected.id && r.date === search.date && overlap(r, search))) { setError('선택한 시간은 이미 예약되었어요. 다른 시간을 선택해 주세요.'); return; }
    const reservation = { id: createId('reservation'), userId: driver.id, spaceId: selected.id, date: search.date, start: search.start, end: search.end, totalPrice: Math.ceil(hours(search.start, search.end) * selected.price), status: '확정', createdAt: new Date().toISOString() };
    mockRepository.addReservation(reservation);
    setReservations(mockRepository.getReservations());
    setCompletedId(reservation.id);
    go('completed');
  }
  function submitSpace(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (values.availableFrom >= values.availableTo) { setError('이용 종료 시간은 시작 시간보다 늦어야 해요.'); return; }
    if (Number(values.price) < 100) { setError('시간당 요금을 100원 이상 입력해 주세요.'); return; }
    const space = { id: createId('space'), ownerId: owner.id, title: values.title.trim(), address: values.address.trim(), region: values.region, neighborhood: values.region.replace('역', ''), price: Number(values.price), availableFrom: values.availableFrom, availableTo: values.availableTo, vehicleLimit: values.vehicleLimit, description: values.description.trim(), tags: ['새 공간', values.vehicleLimit], distance: '위치 확인', x: 45, y: 43, visual: 'mint', photoUrl: values.photoUrl.trim() };
    mockRepository.addSpace(space);
    setSpaces(mockRepository.getSpaces());
    setSelectedId(space.id);
    go('my-spaces');
  }

  return <div className="app-shell">
    <header className="site-header"><div className="container header-inner">
      <button className="brand" onClick={() => go('home')} aria-label="Parkly 홈"><span className="brand-mark">P<span>.</span></span><span>parkly</span></button>
      <nav aria-label="주 메뉴"><button className={['home', 'results', 'detail', 'booking', 'completed'].includes(page) ? 'active' : ''} onClick={() => go('home')}>주차공간 찾기</button><button className={page === 'reservations' ? 'active' : ''} onClick={() => go('reservations')}>내 예약</button><button className={['my-spaces', 'new-space', 'owner-reservations'].includes(page) ? 'active' : ''} onClick={() => go('my-spaces')}>공간 제공하기</button></nav>
      <div className="header-user"><span className="avatar">현</span><span>{driver.name} 님</span></div>
    </div></header>

    {page === 'home' && <><main>
      <section className="hero"><div className="container hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> 우리 동네 빈 공간을 더 가깝게</div><h1>가는 곳마다<br/><em>주차 걱정 없이.</em></h1><p>목적지 근처의 남는 주차공간을 찾고,<br/>필요한 시간만큼 간편하게 예약하세요.</p><div className="hero-proof"><div className="proof-icon"><Icon name="shield" size={22}/></div><span>미리 예약하고, 여유롭게 도착하세요</span></div></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-grid"/><div className="art-route"/><div className="art-marker marker-one">P</div><div className="art-marker marker-two">P</div><div className="art-marker marker-three">P</div><div className="art-car">🚙</div><div className="art-floating"><span className="floating-check"><Icon name="check" size={16}/></span><span>주차공간을 찾았어요!<small>목적지까지 도보 3분</small></span></div></div></div></section>
      <section className="search-section container"><div className="search-card"><div className="search-card-heading"><div><span className="section-kicker">FIND YOUR SPACE</span><h2>어디에 주차하시나요?</h2></div><span className="search-card-note">검색부터 예약까지, 몇 번의 클릭이면 충분해요.</span></div><SearchFields search={search} updateSearch={updateSearch} submitSearch={submitSearch}/>{error && <p className="form-error" role="alert">{error}</p>}</div></section>
      <section className="container featured-section"><div className="section-heading"><div><span className="section-kicker">NEAR YOU</span><h2>이런 공간은 어떠세요?</h2><p>동네 곳곳의 편리한 주차공간을 만나보세요.</p></div><button className="text-link" onClick={() => { if (validateSearch()) setSearch({ region: '홍대입구역', date: tomorrow(), start: '18:00', end: '21:00' }); go('results'); }}>전체 보기 <Icon name="arrow" size={17}/></button></div><div className="featured-grid">{spaces.slice(0, 3).map((space) => <button className="featured-card" key={space.id} onClick={() => openSpace(space)}><SpaceVisual space={space}/><div className="featured-content"><span className="pill">{space.neighborhood}</span><h3>{space.title}</h3><p><Icon name="pin" size={15}/>{space.address}</p><div className="card-bottom"><span><strong>₩{money(space.price)}</strong> / 시간</span><span className="round-arrow"><Icon name="arrow" size={17}/></span></div></div></button>)}</div></section>
      <section className="container how-section"><div><span className="section-kicker">HOW IT WORKS</span><h2>주차가 쉬워지는<br/>세 가지 순간</h2></div><div className="how-steps"><article><span>01</span><div className="step-icon"><Icon name="search" size={24}/></div><h3>가까운 공간 찾기</h3><p>목적지와 이용 시간을 입력하고 주변 공간을 살펴보세요.</p></article><article><span>02</span><div className="step-icon"><Icon name="calendar" size={24}/></div><h3>원하는 시간 예약</h3><p>가격과 이용 조건을 확인하고 간편하게 예약하세요.</p></article><article><span>03</span><div className="step-icon"><Icon name="car" size={24}/></div><h3>편하게 주차하기</h3><p>예약 내역을 확인하고 주차공간으로 이동하면 끝!</p></article></div></section>
      <section className="container owner-cta"><div><span>FOR SPACE OWNERS</span><h2>비어 있는 공간이 있나요?</h2><p>내 주차공간을 등록하고 필요한 사람과 연결해 보세요.</p></div><button className="button button-light" onClick={() => go('new-space')}>공간 등록하기 <Icon name="arrow" size={18}/></button></section>
    </main></>}

    {page === 'results' && <main className="results-page"><div className="container"><div className="page-top"><button className="back-link" onClick={() => go('home')}><Icon name="back" size={18}/> 홈으로</button><span>주차공간 검색</span></div><div className="results-heading"><div><span className="section-kicker">SEARCH RESULTS</span><h1>{search.region} 주변 주차공간</h1><p>{dateLabel(search.date)} · {search.start}–{search.end} · 이용 가능한 공간 <strong>{results.length}곳</strong></p></div></div><div className="results-search"><SearchFields search={search} updateSearch={updateSearch} submitSearch={submitSearch} compact/>{error && <p className="form-error" role="alert">{error}</p>}</div><div className="results-layout"><section className="results-list"><div className="list-heading"><h2>공간 목록 <span>{results.length}</span></h2><button className="map-toggle" onClick={() => setListOpen(!listOpen)}><Icon name="list" size={17}/>{listOpen ? '목록 접기' : '목록 보기'}</button></div>{listOpen && (results.length ? results.map((space) => <button className="result-card" key={space.id} onClick={() => openSpace(space)}><SpaceVisual space={space} small/><div className="result-card-body"><div className="result-card-top"><span className="pill">{space.neighborhood}</span><span className="distance"><Icon name="pin" size={14}/>{space.distance}</span></div><h3>{space.title}</h3><p className="muted">{space.address}</p><div className="tag-list">{space.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="result-card-bottom"><span><strong>₩{money(space.price)}</strong> / 시간</span><span className="card-link">자세히 보기 <Icon name="chevron" size={16}/></span></div></div></button>) : <div className="empty-state"><div className="empty-icon"><Icon name="search" size={30}/></div><h3>조건에 맞는 공간이 없어요</h3><p>지역이나 이용 시간을 바꾸어 다시 검색해 보세요.</p></div>)}</section><aside className="mock-map" aria-label="검색 결과 위치 안내용 목업 지도"><div className="map-grid"/><div className="map-park park-a"/><div className="map-park park-b"/><div className="map-road road-a"/><div className="map-road road-b"/><div className="map-road road-c"/><span className="map-label label-a">{search.region}</span><span className="map-label label-b">연남동</span><span className="map-label label-c">서교동</span>{results.map((space) => <button key={space.id} className="map-pin" style={{ left: `${space.x}%`, top: `${space.y}%` }} onClick={() => openSpace(space)} aria-label={`${space.title} 상세 보기`}>₩{money(space.price)}</button>)}<div className="map-disclaimer">위치는 프로토타입용 예시입니다</div></aside></div></div></main>}

    {page === 'detail' && selected && <main className="container detail-page"><div className="page-top"><button className="back-link" onClick={() => go('results')}><Icon name="back" size={18}/> 검색 결과</button><span>공간 상세</span></div><div className="detail-title"><div><span className="pill">{selected.neighborhood}</span><h1>{selected.title}</h1><p><Icon name="pin" size={17}/>{selected.address} <span>· {selected.distance}</span></p></div></div><div className="detail-grid"><div className="detail-main"><SpaceVisual space={selected}/><div className="detail-content"><div className="content-heading"><h2>주차공간 소개</h2><span className="verified"><Icon name="shield" size={17}/> Parkly 등록 공간</span></div><p>{selected.description}</p><div className="detail-divider"/><h2>이용 안내</h2><div className="info-grid"><div><span className="info-icon"><Icon name="clock" size={21}/></span><span><small>이용 가능 시간</small><strong>{selected.availableFrom}–{selected.availableTo}</strong></span></div><div><span className="info-icon"><Icon name="car" size={21}/></span><span><small>주차 가능 차량</small><strong>{selected.vehicleLimit}</strong></span></div><div><span className="info-icon"><Icon name="pin" size={21}/></span><span><small>위치</small><strong>{selected.neighborhood} · {selected.distance}</strong></span></div><div><span className="info-icon"><Icon name="spark" size={21}/></span><span><small>특징</small><strong>{selected.tags.join(' · ')}</strong></span></div></div><div className="detail-divider"/><h2>찾아오시는 길</h2><div className="address-box"><span className="address-marker"><Icon name="pin" size={23}/></span><div><strong>{selected.address}</strong><p>상세 위치는 예약 완료 후 안내됩니다.</p></div></div></div></div><aside className="booking-card"><span className="booking-card-kicker">PARKING RATE</span><div className="booking-price"><strong>₩{money(selected.price)}</strong><span>/ 시간</span></div><div className="booking-summary"><div><Icon name="calendar" size={18}/><span>{dateLabel(search.date)}</span></div><div><Icon name="clock" size={18}/><span>{search.start}–{search.end}</span></div><div><Icon name="car" size={18}/><span>{selected.vehicleLimit}</span></div></div><div className="booking-total"><span>예상 요금</span><strong>₩{money(Math.max(0, hours(search.start, search.end) * selected.price))}</strong></div><button className="button button-primary full" onClick={() => go('booking')}>예약하기 <Icon name="arrow" size={18}/></button><p className="booking-note">결제 없이 예약 흐름을 체험할 수 있어요.</p></aside></div></main>}

    {page === 'booking' && selected && <main className="container form-page"><div className="page-top"><button className="back-link" onClick={() => go('detail')}><Icon name="back" size={18}/> 공간 상세</button><span>예약하기</span></div><div className="form-page-heading"><span className="section-kicker">BOOK YOUR SPACE</span><h1>주차 예약을 확인해 주세요</h1><p>이용 시간과 요금을 확인하면 예약이 바로 확정됩니다.</p></div><div className="two-column"><section className="panel booking-form-panel"><h2>이용 정보</h2><div className="booking-space-row"><SpaceVisual space={selected} small/><div><span className="pill">{selected.neighborhood}</span><h3>{selected.title}</h3><p>{selected.address}</p></div></div><div className="form-grid"><label className="field"><span>이용 날짜</span><input type="date" name="date" min={today()} value={search.date} onChange={updateSearch}/></label><div className="time-pair"><label className="field"><span>시작 시간</span><input type="time" name="start" value={search.start} onChange={updateSearch}/></label><label className="field"><span>종료 시간</span><input type="time" name="end" value={search.end} onChange={updateSearch}/></label></div></div><p className="field-help">이용 가능 시간: {selected.availableFrom}–{selected.availableTo}</p>{error && <p className="form-error" role="alert">{error}</p>}<div className="mock-notice"><Icon name="shield" size={20}/><p><strong>프로토타입 예약입니다.</strong><br/>실제 결제나 알림은 진행되지 않습니다.</p></div></section><aside className="panel payment-panel"><h2>예약 요약</h2><div className="summary-line"><span>시간당 요금</span><strong>₩{money(selected.price)}</strong></div><div className="summary-line"><span>이용 시간</span><strong>{Math.max(0, hours(search.start, search.end))}시간</strong></div><div className="summary-line"><span>이용 날짜</span><strong>{dateLabel(search.date)}</strong></div><div className="summary-total"><span>총 요금</span><strong>₩{money(Math.max(0, Math.ceil(hours(search.start, search.end) * selected.price)))}</strong></div><button className="button button-primary full" onClick={submitReservation}>예약 확정하기 <Icon name="arrow" size={18}/></button><p className="booking-note">버튼을 누르면 Mock 예약이 저장됩니다.</p></aside></div></main>}

    {page === 'completed' && completed && <main className="container success-page"><div className="success-card"><div className="success-icon"><Icon name="check" size={37} stroke={2.4}/></div><span className="section-kicker">BOOKING CONFIRMED</span><h1>예약이 완료되었어요!</h1><p>이제 주차 걱정은 내려놓고 목적지로 향하세요.</p><div className="success-detail"><div><span>예약 공간</span><strong>{spaces.find((s) => s.id === completed.spaceId)?.title}</strong></div><div><span>이용 일시</span><strong>{dateLabel(completed.date)} · {completed.start}–{completed.end}</strong></div><div><span>예약 번호</span><strong>{completed.id.split('-').slice(-2).join('-').toUpperCase()}</strong></div><div><span>총 요금</span><strong>₩{money(completed.totalPrice)}</strong></div></div><div className="success-actions"><button className="button button-primary" onClick={() => go('reservations')}>내 예약 확인하기 <Icon name="arrow" size={18}/></button><button className="button button-outline" onClick={() => go('home')}>홈으로 가기</button></div></div></main>}

    {page === 'reservations' && <main className="container collection-page"><div className="collection-header"><div><span className="section-kicker">MY BOOKINGS</span><h1>내 예약</h1><p>{driver.name} 님의 주차 예약 내역을 확인하세요.</p></div><button className="button button-outline" onClick={() => go('home')}><Icon name="plus" size={18}/> 새 공간 찾기</button></div>{reservations.filter((r) => r.userId === driver.id).length ? <div className="collection-list">{reservations.filter((r) => r.userId === driver.id).map((reservation) => { const space = spaces.find((s) => s.id === reservation.spaceId); return space && <article className="reservation-card" key={reservation.id}><SpaceVisual space={space} small/><div className="reservation-body"><span className="status-badge"><Icon name="check" size={14}/> 예약 확정</span><h2>{space.title}</h2><p><Icon name="pin" size={15}/>{space.address}</p><div className="reservation-meta"><span><Icon name="calendar" size={16}/>{dateLabel(reservation.date)}</span><span><Icon name="clock" size={16}/>{reservation.start}–{reservation.end}</span></div></div><div className="reservation-side"><small>결제 예정 금액 · Mock</small><strong>₩{money(reservation.totalPrice)}</strong><button onClick={() => openSpace(space)}>공간 자세히 <Icon name="chevron" size={16}/></button></div></article>; })}</div> : <div className="empty-state wide"><div className="empty-icon"><Icon name="calendar" size={30}/></div><h3>아직 예약한 공간이 없어요</h3><p>필요한 시간에 맞는 주차공간을 찾아보세요.</p><button className="button button-primary" onClick={() => go('home')}>주차공간 찾기</button></div>}</main>}

    {page === 'my-spaces' && <main className="container collection-page"><div className="collection-header"><div><span className="section-kicker">SPACE OWNER</span><h1>내 주차공간</h1><p>{owner.name} 님이 등록한 공간과 예약을 관리하세요.</p></div><button className="button button-primary" onClick={() => go('new-space')}><Icon name="plus" size={18}/> 주차공간 등록</button></div><div className="owner-tabs"><button className="selected">등록 공간 <span>{spaces.filter((s) => s.ownerId === owner.id).length}</span></button><button onClick={() => go('owner-reservations')}>들어온 예약 <span>{reservations.filter((r) => spaces.find((s) => s.id === r.spaceId)?.ownerId === owner.id).length}</span></button></div><div className="owner-grid">{spaces.filter((s) => s.ownerId === owner.id).map((space) => <article className="owner-card" key={space.id}><SpaceVisual space={space}/><div className="owner-card-body"><div className="owner-card-top"><span className="status-badge"><Icon name="check" size={14}/> 등록 완료</span><span className="pill">{space.neighborhood}</span></div><h2>{space.title}</h2><p><Icon name="pin" size={15}/>{space.address}</p><div className="owner-card-info"><span><Icon name="clock" size={16}/>{space.availableFrom}–{space.availableTo}</span><strong>₩{money(space.price)} <small>/ 시간</small></strong></div><button className="text-link" onClick={() => openSpace(space)}>공간 확인하기 <Icon name="arrow" size={17}/></button></div></article>)}</div></main>}

    {page === 'new-space' && <main className="container form-page"><div className="page-top"><button className="back-link" onClick={() => go('my-spaces')}><Icon name="back" size={18}/> 내 주차공간</button><span>공간 등록</span></div><div className="form-page-heading"><span className="section-kicker">LIST YOUR SPACE</span><h1>새 주차공간 등록</h1><p>공간 정보를 입력하면 검색 결과에 바로 표시됩니다.</p></div><form className="space-form panel" onSubmit={submitSpace}><div className="form-section"><span className="form-section-number">01</span><div><h2>기본 정보</h2><p>운전자가 공간을 쉽게 알아볼 수 있도록 입력해 주세요.</p></div></div><div className="form-grid two"><label className="field"><span>공간 이름 <b>*</b></span><input name="title" required maxLength="50" placeholder="예: 연남동 골목 안 전용 주차공간"/></label><label className="field"><span>가까운 지역 <b>*</b></span><select name="region" required>{regions.map((region) => <option key={region}>{region}</option>)}</select></label><label className="field span-two"><span>주소 <b>*</b></span><input name="address" required maxLength="100" placeholder="예: 서울 마포구 동교로 38길 12"/></label><label className="field span-two"><span>사진 URL <small>(선택)</small></span><input name="photoUrl" type="url" placeholder="https://..."/><small className="field-help">사진이 없으면 Parkly 기본 이미지가 표시됩니다.</small></label></div><div className="form-divider"/><div className="form-section"><span className="form-section-number">02</span><div><h2>이용 조건</h2><p>이용 가능한 시간과 요금을 알려주세요.</p></div></div><div className="form-grid two"><label className="field"><span>이용 시작 <b>*</b></span><input name="availableFrom" type="time" defaultValue="08:00" required/></label><label className="field"><span>이용 종료 <b>*</b></span><input name="availableTo" type="time" defaultValue="22:00" required/></label><label className="field"><span>시간당 요금 <b>*</b></span><div className="input-suffix"><input name="price" type="number" min="100" step="100" defaultValue="2000" required/><span>원 / 시간</span></div></label><label className="field"><span>주차 가능 차량 <b>*</b></span><select name="vehicleLimit" required><option>소형차까지</option><option>중형차까지</option><option>SUV까지</option></select></label><label className="field span-two"><span>공간 소개 <b>*</b></span><textarea name="description" required maxLength="500" rows="4" placeholder="진입 방법, 주변 시설 등 운전자에게 도움이 될 정보를 적어주세요."/></label></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button className="button button-outline" type="button" onClick={() => go('my-spaces')}>취소</button><button className="button button-primary" type="submit">공간 등록하기 <Icon name="arrow" size={18}/></button></div></form></main>}

    {page === 'owner-reservations' && <main className="container collection-page"><div className="collection-header"><div><span className="section-kicker">SPACE OWNER</span><h1>들어온 예약</h1><p>내 주차공간에 들어온 예약을 확인하세요.</p></div><button className="button button-outline" onClick={() => go('new-space')}><Icon name="plus" size={18}/> 공간 등록</button></div><div className="owner-tabs"><button onClick={() => go('my-spaces')}>등록 공간 <span>{spaces.filter((s) => s.ownerId === owner.id).length}</span></button><button className="selected">들어온 예약 <span>{reservations.filter((r) => spaces.find((s) => s.id === r.spaceId)?.ownerId === owner.id).length}</span></button></div>{reservations.filter((r) => spaces.find((s) => s.id === r.spaceId)?.ownerId === owner.id).length ? <div className="collection-list">{reservations.filter((r) => spaces.find((s) => s.id === r.spaceId)?.ownerId === owner.id).map((reservation) => { const space = spaces.find((s) => s.id === reservation.spaceId); return <article className="reservation-card" key={reservation.id}><SpaceVisual space={space} small/><div className="reservation-body"><span className="status-badge"><Icon name="check" size={14}/> 예약 확정</span><h2>{space.title}</h2><p>예약자: {driver.name}</p><div className="reservation-meta"><span><Icon name="calendar" size={16}/>{dateLabel(reservation.date)}</span><span><Icon name="clock" size={16}/>{reservation.start}–{reservation.end}</span></div></div><div className="reservation-side"><small>예약 금액 · Mock</small><strong>₩{money(reservation.totalPrice)}</strong></div></article>; })}</div> : <div className="empty-state wide"><div className="empty-icon"><Icon name="calendar" size={30}/></div><h3>아직 들어온 예약이 없어요</h3><p>새 예약이 생성되면 이곳에서 확인할 수 있습니다.</p><button className="button button-primary" onClick={() => go('my-spaces')}>내 공간 확인하기</button></div>}</main>}

    <footer className="site-footer"><div className="container footer-inner"><div><span className="footer-brand">parkly<span>.</span></span><p>동네의 빈 공간을 새로운 가능성으로.</p></div><span>Parkly Prototype · Mock 데이터로 작동합니다</span></div></footer>
  </div>;
}

export default App;
