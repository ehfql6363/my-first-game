// 효과음. 음원 파일 없이 Web Audio로 합성한다 (아티팩트 한 파일 배포 유지).
// 브라우저 정책상 첫 터치 이후에만 소리가 난다. 소리를 낼 수 없는 환경이면 조용히 넘어간다.

export type Cue = 'switch' | 'card' | 'success' | 'tick' | 'appear' | 'knock' | 'capsule' | 'gold' | 'clear' | 'laugh';

const KEY = 'happymoon-land/muted';
let ctx: AudioContext | null = null;
let hum: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
let muted = readMuted();

function readMuted(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(KEY, value ? '1' : '0');
  } catch {
    // 저장이 막혀 있어도 이번 접속 동안은 유지
  }
  if (value) stopHum();
}

function audio(): AudioContext | null {
  if (muted) return null;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(c: AudioContext, freq: number, dur: number, type: OscillatorType, gain: number, at = 0, slideTo?: number) {
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function noise(c: AudioContext, dur: number, gain: number, freq: number, at = 0) {
  const t = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur);
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t);
}

export function play(cue: Cue): void {
  const c = audio();
  if (!c) return;
  try {
    switch (cue) {
      case 'switch':
        noise(c, 0.09, 0.18, 2200);
        break;
      case 'card':
        tone(c, 660, 0.06, 'square', 0.05);
        break;
      case 'success':
        tone(c, 523, 0.1, 'triangle', 0.12);
        tone(c, 784, 0.16, 'triangle', 0.12, 0.09);
        break;
      case 'tick':
        tone(c, 1250, 0.03, 'sine', 0.06);
        tone(c, 70, 0.18, 'sine', 0.2, 0, 45);
        break;
      case 'appear':
        // 음이 조금씩 어긋난 오르골
        [988, 931, 784, 741, 659].forEach((f, i) => tone(c, f, 0.5, 'triangle', 0.06, i * 0.18));
        break;
      case 'knock':
        [0, 0.35, 0.7].forEach((at) => tone(c, 95, 0.16, 'sine', 0.5, at, 50));
        break;
      case 'laugh':
        [420, 380, 440, 360, 460].forEach((f, i) => tone(c, f, 0.07, 'square', 0.035, i * 0.07));
        break;
      case 'capsule':
        [0, 0.08, 0.16, 0.26].forEach((at) => noise(c, 0.05, 0.2, 3200, at));
        tone(c, 1318, 0.4, 'sine', 0.1, 0.4);
        break;
      case 'gold':
        [523, 659, 784, 1046].forEach((f, i) => tone(c, f, 0.35, 'triangle', 0.1, 0.45 + i * 0.1));
        break;
      case 'clear':
        [523, 659, 784].forEach((f, i) => tone(c, f, 0.4, 'sine', 0.1, i * 0.15));
        break;
    }
  } catch {
    // 소리 실패는 게임 진행에 영향을 주지 않는다
  }
}

/** 경비실의 낮은 웅웅거림 (밤 동안) */
export function startHum(): void {
  const c = audio();
  if (!c || hum) return;
  try {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, 2);
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    const gain = c.createGain();
    gain.gain.value = 0.035;
    src.connect(filter).connect(gain).connect(c.destination);
    src.start();
    hum = { src, gain };
  } catch {
    hum = null;
  }
}

export function stopHum(): void {
  try {
    hum?.src.stop();
  } catch {
    // 이미 멈춤
  }
  hum = null;
}
