// CCTV 화면 한 대. 배경은 CSS 도형, 이상 현상과 인물은 도트 스프라이트.
import { PixelSprite } from './PixelSprite';
import { BALLOON, GUARD_BACK, HORSE, MOONROO, TAEO } from './sprites';

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
          {cameraId === 'gate' && <Gate taeo={kinds.includes('taeo')} dread={dread} />}
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
      <div class="osd br">{dread ? '신호 없음' : '신호 약함'}</div>
    </div>
  );
}

const ground = <div class="abs" style={{ left: '0px', right: '0px', bottom: '0px', height: '64px', background: 'var(--cctv-1)' }} />;

function Gate({ taeo, dread }: { taeo: boolean; dread: boolean }) {
  return (
    <>
      {ground}
      {taeo && (
        <>
          <PixelSprite sprite={TAEO} scale={3} style={{ left: '128px', top: '158px' }} />
          <div class="caption" style={{ top: '40px', color: 'var(--paper)' }}>한태오: "저 먼저 퇴근할게요 ㅎㅎ"</div>
        </>
      )}
      <div class="abs" style={{ left: '109px', top: '60px', width: '140px', height: '146px', border: '3px dashed var(--cctv-3)', borderBottom: '0px', borderRadius: '70px 70px 0 0' }} />
      <PixelSprite sprite={GUARD_BACK} scale={2} style={{ left: '171px', top: '178px', opacity: '0.75' }} />
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

function Carousel({ smile, horse13 }: { smile: boolean; horse13: boolean }) {
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
