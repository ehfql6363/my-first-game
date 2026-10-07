// CCTV 화면 한 대. 배경은 CSS 도형, 이상 현상과 인물은 도트 스프라이트.
import { PixelSprite } from './PixelSprite';
import { BALLOON, BATTERY, GHOST, GUARD_BACK, GUARD_FRONT, HORSE, MOONROO, STAR, TAEO } from './sprites';

interface Props {
  cameraId: string;
  cameraName: string;
  code: string;
  clock: string;
  /** 이 카메라에 지금 떠 있는 이상 현상 종류 */
  kinds: string[];
  /** 위험도가 높을 때: 화면이 더 불안정해진다 */
  dread?: boolean;
  /** 새 이상 현상이 나타난 순간 잠깐 화면이 튄다 */
  glitch?: boolean;
}

export function CameraView({ cameraId, cameraName, code, clock, kinds, dread = false, glitch = false }: Props) {
  return (
    <div class={['monitor', dread && 'dread', glitch && 'glitch'].filter(Boolean).join(' ')} role="img" aria-label={`${code} ${cameraName} 화면`} data-kinds={kinds.join(' ')}>
      <div class="scene">
        <div class="abs" style={{ left: '50%', top: '0px', width: '358px', height: '270px', marginLeft: '-179px' }}>
          {cameraId === 'gate' && <Gate kinds={kinds} dread={dread} />}
          {cameraId === 'haunted' && <Haunted kinds={kinds} />}
          {cameraId === 'ferris' && <Ferris kinds={kinds} />}
          {cameraId === 'parade' && <Parade kinds={kinds} />}
          {cameraId === 'tunnel' && <Tunnel kinds={kinds} />}
          {cameraId === 'ticket' && <Ticket balloon={kinds.includes('balloon')} />}
          {cameraId === 'carousel' && <Carousel smile={kinds.includes('smile')} horse13={kinds.includes('horse13')} offer={kinds.includes('offer')} />}
          {cameraId === 'broadcast' && <Broadcast onAir={kinds.includes('namecall')} reverse={kinds.includes('reverse')} />}
        </div>
      </div>
      <div class="band" />
      <div class="lines" />
      <div class="vignette" />
      <div class="osd tl">{code} · {cameraName}</div>
      <div class="osd tr">● REC</div>
      <div class="osd bl">????-10-07 {clock}:13</div>
      <div class="osd br">{dread ? '신호 없음' : '신호 약함'}</div>
    </div>
  );
}

const ground = <div class="abs" style={{ left: '0px', right: '0px', bottom: '0px', height: '64px', background: 'var(--cctv-1)' }} />;

function Gate({ kinds, dread }: { kinds: string[]; dread: boolean }) {
  const taeo = kinds.includes('taeo');
  const facing = kinds.includes('guardface');
  return (
    <>
      {ground}
      {kinds.includes('exit2') && (
        <div class="abs" style={{ left: '262px', top: '120px', padding: '3px 6px', background: '#1d8a4a', color: '#e8ffe8', fontFamily: 'var(--pixel)', fontSize: '11px', boxShadow: '0 0 12px #2fd36f' }}>EXIT →</div>
      )}
      {kinds.includes('star') && <PixelSprite sprite={STAR} scale={3} class="creep" style={{ left: '60px', top: '36px' }} />}
      {taeo && (
        <>
          <PixelSprite sprite={TAEO} scale={3} style={{ left: '128px', top: '158px' }} />
          <div class="caption" style={{ top: '40px', color: 'var(--paper)' }}>한태오: "저 먼저 퇴근할게요 ㅎㅎ"</div>
        </>
      )}
      <div class="abs" style={{ left: '109px', top: '60px', width: '140px', height: '146px', border: '3px dashed var(--cctv-3)', borderBottom: '0px', borderRadius: '70px 70px 0 0' }} />
      <PixelSprite sprite={facing ? GUARD_FRONT : GUARD_BACK} scale={facing ? 3 : 2} class={facing ? 'creep' : undefined} style={{ left: facing ? '167px' : '171px', top: facing ? '164px' : '178px', opacity: facing ? '1' : '0.75' }} />
      {dread && <PixelSprite sprite={GUARD_BACK} scale={2} style={{ left: '205px', top: '178px', opacity: '0.35' }} />}
      <div class="caption" style={{ top: '222px' }}>정문 없음 (06:00 전) · 인원 {dread ? 2 : 1}명 감지</div>
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
        <PixelSprite sprite={BALLOON} scale={2} class="sway" style={{ left: '168px', top: '130px' }} />
      ) : (
        <div class="abs" style={{ left: '172px', top: '146px', width: '4px', height: '4px', background: 'var(--pink)', boxShadow: '12px 0 0 0 var(--pink)' }} />
      )}
      <PixelSprite sprite={BALLOON} scale={2} class="sway" style={{ left: '56px', top: '72px', opacity: '0.55', filter: 'grayscale(0.6)' }} />
      <PixelSprite sprite={BALLOON} scale={2} class="sway" style={{ left: '84px', top: '56px', opacity: '0.55', filter: 'grayscale(0.6)', animationDelay: '-1.3s' }} />
      {!balloon && <PixelSprite sprite={BALLOON} scale={2} class="sway" style={{ left: '268px', top: '66px', opacity: '0.55', filter: 'grayscale(0.6)', animationDelay: '-0.6s' }} />}
    </>
  );
}

function Carousel({ smile, horse13, offer }: { smile: boolean; horse13: boolean; offer: boolean }) {
  return (
    <>
      {ground}
      <div class="abs" style={{ left: '59px', top: '50px', width: '240px', height: '60px', background: 'var(--cctv-2)', clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
      <div class="abs" style={{ left: '69px', top: '110px', width: '220px', height: '96px', boxShadow: 'inset 0 0 0 3px #225848' }} />
      <div class="abs" style={{ left: '95px', top: '140px', width: '26px', height: '40px', background: 'var(--cctv-3)' }} />
      <div class="abs" style={{ left: '235px', top: '140px', width: '26px', height: '40px', background: 'var(--cctv-3)' }} />
      <div class="abs" style={{ left: '176px', top: '110px', width: '6px', height: '96px', background: 'var(--cctv-3)' }} />
      {horse13 && <PixelSprite sprite={HORSE} scale={2} style={{ left: '112px', top: '150px' }} />}
      {smile && <PixelSprite sprite={MOONROO} scale={3} class="creep" style={{ left: '155px', top: '112px' }} />}
      {offer && (
        <>
          <PixelSprite sprite={MOONROO} scale={2} style={{ left: '232px', top: '150px' }} />
          <PixelSprite sprite={BATTERY} scale={3} class="sway" style={{ left: '210px', top: '160px' }} />
          <div class="caption" style={{ top: '40px', color: 'var(--paper)' }}>문루가 배터리를 내민다</div>
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

function Haunted({ kinds }: { kinds: string[] }) {
  return (
    <>
      {ground}
      <div class="abs" style={{ left: '70px', top: '70px', width: '218px', height: '136px', background: 'var(--cctv-2)', clipPath: 'polygon(0 30%, 50% 0, 100% 30%, 100% 100%, 0 100%)' }} />
      <div class="abs" style={{ left: '84px', top: '120px', width: '44px', height: '64px', background: '#0d2a24', boxShadow: 'inset 0 0 0 3px var(--cctv-3)' }} />
      {kinds.includes('mirror') ? (
        <PixelSprite sprite={GUARD_FRONT} scale={3} style={{ left: '94px', top: '128px', filter: 'saturate(0.6)' }} />
      ) : (
        <PixelSprite sprite={GUARD_BACK} scale={3} style={{ left: '94px', top: '128px', opacity: '0.35', filter: 'grayscale(1)' }} />
      )}
      <div class="abs" style={{ left: '232px', top: '128px', width: '36px', height: '78px', background: kinds.includes('staffdoor') ? '#e8f7c8' : '#0d2a24', boxShadow: 'inset 0 0 0 3px var(--cctv-3)' }} />
      <div class="abs" style={{ left: '226px', top: '114px', fontSize: '9px', color: 'var(--cctv-text)' }}>직원 전용</div>
      {kinds.includes('ghost') && <PixelSprite sprite={GHOST} scale={3} class="sway" style={{ left: '156px', top: '120px' }} />}
    </>
  );
}

function Ferris({ kinds }: { kinds: string[] }) {
  const fast = kinds.includes('wheelfast');
  return (
    <>
      {ground}
      <div class="abs" style={{ left: '104px', top: '30px', width: '150px', height: '150px', borderRadius: '50%', boxShadow: 'inset 0 0 0 4px var(--cctv-3)', animation: `spin ${fast ? '1.2s' : '40s'} linear infinite` }}>
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <div key={deg} class="abs" style={{ left: '71px', top: '0px', width: '8px', height: '75px', transformOrigin: '4px 75px', transform: `rotate(${deg}deg)` }}>
            <div class="abs" style={{ left: '-8px', top: '-8px', width: '24px', height: '16px', background: 'var(--cctv-2)', boxShadow: 'inset 0 0 0 2px var(--cctv-4)' }} />
          </div>
        ))}
      </div>
      <div class="abs" style={{ left: '176px', top: '105px', width: '6px', height: '110px', background: 'var(--cctv-3)' }} />
      {kinds.includes('topcar') && <div class="abs" style={{ left: '164px', top: '14px', width: '30px', height: '20px', background: 'var(--gold)', opacity: '0.7', boxShadow: '0 0 14px var(--gold)' }} />}
      {kinds.includes('passenger') && <PixelSprite sprite={GUARD_FRONT} scale={2} style={{ left: '240px', top: '92px' }} />}
      {fast && <div class="caption" style={{ top: '226px', color: 'var(--paper)' }}>회전 속도 이상 · 1바퀴 7초</div>}
    </>
  );
}

function Parade({ kinds }: { kinds: string[] }) {
  const marching = kinds.includes('parade');
  return (
    <>
      {ground}
      <div class="abs" style={{ left: '0px', right: '0px', top: '150px', height: '4px', background: 'var(--cctv-3)' }} />
      {marching && (
        <div class="abs march" style={{ left: '0px', top: '112px', display: 'flex', gap: '18px' }}>
          {[0, 1, 2, 3].map((i) => (
            <PixelSprite key={i} sprite={MOONROO} scale={2} />
          ))}
          {kinds.includes('knownface') && <PixelSprite sprite={TAEO} scale={3} />}
        </div>
      )}
      {!marching && kinds.includes('knownface') && <PixelSprite sprite={TAEO} scale={3} style={{ left: '168px', top: '110px' }} />}
      {marching && <div class="caption" style={{ top: '40px', color: '#c9a7ff', fontFamily: 'var(--pen)', fontSize: '20px' }}>♪ 즐거운 퍼레이드 ♪</div>}
    </>
  );
}

function Tunnel({ kinds }: { kinds: string[] }) {
  return (
    <>
      <div class="abs" style={{ left: '40px', top: '30px', width: '278px', height: '190px', background: '#0d2a24', borderRadius: '130px 130px 0 0', boxShadow: 'inset 0 0 0 4px var(--cctv-2)' }} />
      <div class="abs" style={{ left: '62px', top: '80px', width: '120px', fontSize: '9px', lineHeight: 1.6, color: 'var(--cctv-4)', opacity: kinds.includes('wallnames') ? '1' : '0.4' }}>
        김○○ 6일 · 박○○ 6일 · 이○○ 5일 · 최○○ 6일 · 정○○ 7일 · ████ 6일 · ██ ·
      </div>
      {kinds.includes('wallnames') && <div class="abs" style={{ left: '62px', top: '168px', fontSize: '10px', color: 'var(--paper)', textShadow: '0 0 8px var(--paper)' }}>맨 아래, 가장 오래된 글씨 ██</div>}
      <div class="abs" style={{ left: '232px', top: '110px', width: '44px', height: '96px', background: '#071512', boxShadow: 'inset 0 0 0 3px var(--cctv-3)' }} />
      {kinds.includes('tunneldoor') && <div class="abs" style={{ left: '252px', top: '110px', width: '4px', height: '96px', background: 'var(--gold)', boxShadow: '0 0 12px var(--gold)' }} />}
      {kinds.includes('whisper') && <div class="caption" style={{ top: '228px', color: 'var(--paper)' }}>"…수습생 님… 여기… 여기 있어요…"</div>}
    </>
  );
}
