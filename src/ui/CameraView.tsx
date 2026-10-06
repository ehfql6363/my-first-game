// CCTV 화면 한 대. 도트 그림 대신 임시 도형으로 그린다 (M4에서 도트 아트로 교체).

interface Props {
  cameraId: string;
  cameraName: string;
  code: string;
  clock: string;
  /** 이 카메라에 지금 떠 있는 이상 현상 종류 */
  kinds: string[];
}

export function CameraView({ cameraId, cameraName, code, clock, kinds }: Props) {
  return (
    <div class="monitor" role="img" aria-label={`${code} ${cameraName} 화면`} data-kinds={kinds.join(' ')}>
      <div class="scene">
        <div class="abs" style={{ left: '50%', top: '0px', width: '358px', height: '270px', marginLeft: '-179px' }}>
          {cameraId === 'gate' && <Gate taeo={kinds.includes('taeo')} />}
          {cameraId === 'ticket' && <Ticket balloon={kinds.includes('balloon')} />}
          {cameraId === 'carousel' && <Carousel smile={kinds.includes('smile')} horse13={kinds.includes('horse13')} />}
          {cameraId === 'broadcast' && <Broadcast onAir={kinds.includes('namecall')} reverse={kinds.includes('reverse')} />}
        </div>
      </div>
      <div class="band" />
      <div class="lines" />
      <div class="vignette" />
      <div class="osd tl">{code} · {cameraName}</div>
      <div class="osd tr">● REC</div>
      <div class="osd bl">????-10-07 {clock}:13</div>
      <div class="osd br">신호 약함</div>
    </div>
  );
}

const ground = <div class="abs" style={{ left: '0px', right: '0px', bottom: '0px', height: '64px', background: 'var(--cctv-1)' }} />;

function Gate({ taeo }: { taeo: boolean }) {
  return (
    <>
      {ground}
      {taeo && (
        <>
          <div class="abs" style={{ left: '140px', top: '170px', width: '12px', height: '30px', background: '#a07bd6', boxShadow: 'inset 0 9px 0 0 #dcd0f0' }} />
          <div class="caption" style={{ top: '40px', color: 'var(--paper)' }}>한태오: "저 먼저 퇴근할게요 ㅎㅎ"</div>
        </>
      )}
      <div class="abs" style={{ left: '109px', top: '60px', width: '140px', height: '146px', border: '3px dashed var(--cctv-3)', borderBottom: '0px', borderRadius: '70px 70px 0 0' }} />
      <div class="abs" style={{ left: '173px', top: '172px', width: '12px', height: '26px', background: '#3f8f7a', boxShadow: 'inset 0 7px 0 0 var(--cctv-2)' }} />
      <div class="caption" style={{ top: '222px' }}>정문 없음 (06:00 전) · 인원 1명 감지</div>
    </>
  );
}

function Ticket({ balloon }: { balloon: boolean }) {
  return (
    <>
      {ground}
      <div class="abs" style={{ left: '120px', top: '96px', width: '120px', height: '110px', background: 'var(--cctv-2)', boxShadow: 'inset 0 24px 0 0 #225848' }} />
      <div class="abs" style={{ left: '140px', top: '136px', width: '80px', height: '32px', background: '#050d0b' }} />
      {balloon ? (
        <>
          <div class="abs" style={{ left: '166px', top: '132px', width: '26px', height: '32px', borderRadius: '50%', background: '#e7a3c0' }} />
          <div class="abs" style={{ left: '172px', top: '142px', width: '3px', height: '3px', background: '#050d0b', boxShadow: '9px 0 0 0 #050d0b, 2px 8px 0 0 #050d0b, 5px 9px 0 0 #050d0b, 8px 8px 0 0 #050d0b' }} />
        </>
      ) : (
        <div class="abs" style={{ left: '172px', top: '146px', width: '4px', height: '4px', background: 'var(--pink)', boxShadow: '12px 0 0 0 var(--pink)' }} />
      )}
      <div class="abs" style={{ left: '60px', top: '80px', width: '22px', height: '26px', borderRadius: '50%', background: 'var(--cctv-4)' }} />
      <div class="abs" style={{ left: '80px', top: '60px', width: '22px', height: '26px', borderRadius: '50%', background: 'var(--cctv-4)' }} />
      {!balloon && <div class="abs" style={{ left: '270px', top: '74px', width: '22px', height: '26px', borderRadius: '50%', background: 'var(--cctv-4)' }} />}
    </>
  );
}

function Carousel({ smile, horse13 }: { smile: boolean; horse13: boolean }) {
  const white = '#dfe9e2';
  return (
    <>
      {ground}
      <div class="abs" style={{ left: '59px', top: '50px', width: '240px', height: '60px', background: 'var(--cctv-2)', clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
      <div class="abs" style={{ left: '69px', top: '110px', width: '220px', height: '96px', boxShadow: 'inset 0 0 0 3px #225848' }} />
      <div class="abs" style={{ left: '95px', top: '140px', width: '26px', height: '40px', background: 'var(--cctv-3)' }} />
      <div class="abs" style={{ left: '235px', top: '140px', width: '26px', height: '40px', background: 'var(--cctv-3)' }} />
      <div class="abs" style={{ left: '176px', top: '110px', width: '6px', height: '96px', background: 'var(--cctv-3)' }} />
      {horse13 && (
        <>
          <div class="abs" style={{ left: '128px', top: '150px', width: '22px', height: '36px', background: '#5a8f80' }} />
          <div class="abs" style={{ left: '124px', top: '144px', width: '14px', height: '12px', background: '#5a8f80' }} />
          <div class="abs" style={{ left: '127px', top: '147px', width: '3px', height: '3px', background: 'var(--pink)' }} />
        </>
      )}
      {smile && (
        <>
          <div class="abs" style={{ left: '155px', top: '122px', width: '48px', height: '48px', borderRadius: '50%', background: white }} />
          <div class="abs" style={{ left: '151px', top: '108px', width: '14px', height: '22px', borderRadius: '50%', background: white }} />
          <div class="abs" style={{ left: '193px', top: '108px', width: '14px', height: '22px', borderRadius: '50%', background: white }} />
          <div class="abs" style={{ left: '165px', top: '136px', width: '10px', height: '10px', borderRadius: '50%', background: '#050d0b' }} />
          <div class="abs" style={{ left: '183px', top: '136px', width: '10px', height: '10px', borderRadius: '50%', background: '#050d0b' }} />
          <div class="abs" style={{ left: '168px', top: '139px', width: '3px', height: '3px', background: 'var(--pink)', animation: 'look 5s infinite' }} />
          <div class="abs" style={{ left: '186px', top: '139px', width: '3px', height: '3px', background: 'var(--pink)', animation: 'look 5s infinite' }} />
          <div class="abs" style={{ left: '163px', top: '153px', width: '32px', height: '5px', background: '#8a1f33', animation: 'grin 9s infinite alternate' }} />
        </>
      )}
    </>
  );
}

function Broadcast({ onAir, reverse }: { onAir: boolean; reverse: boolean }) {
  return (
    <>
      <div class="abs" style={{ left: '60px', top: '160px', width: '240px', height: '50px', background: 'var(--cctv-2)' }} />
      <div class="abs" style={{ left: '176px', top: '110px', width: '6px', height: '50px', background: 'var(--cctv-3)' }} />
      <div class="abs" style={{ left: '166px', top: '90px', width: '26px', height: '30px', borderRadius: '12px', background: 'var(--cctv-4)' }} />
      <div class="abs" style={{ left: '236px', top: '86px', width: '30px', height: '74px', background: '#071512', borderRadius: '15px 15px 0 0', opacity: 0.85 }} />
      {reverse && (
        <div class="caption" style={{ top: '64px', color: '#c9a7ff', fontFamily: 'var(--pen)', fontSize: '24px' }}>♪ 드이레퍼 운거즐 ♪ 드이레퍼 운거즐 ♪</div>
      )}
      {onAir && (
        <>
          <div class="abs" style={{ left: '130px', top: '40px', padding: '4px 10px', background: '#c2304a', color: 'var(--paper)', fontFamily: 'var(--pixel)', fontSize: '14px', animation: 'blink 1.2s steps(1) infinite' }}>ON AIR</div>
          <div class="caption" style={{ bottom: '40px', color: 'var(--paper)', background: 'rgba(0,0,0,0.65)', padding: '6px', fontSize: '13px' }}>"…수습생 님? 거기 계시죠? 대답해 주세요."</div>
        </>
      )}
    </>
  );
}
