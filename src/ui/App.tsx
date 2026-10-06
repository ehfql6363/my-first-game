// 임시 타이틀 화면. M1에서 밤 경비실 화면으로 교체한다.
export function App() {
  return (
    <main style={{ minHeight: '100vh', margin: 0, background: '#141a3a', color: '#efe6cf', display: 'grid', placeItems: 'center', fontFamily: 'monospace' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 32 }}>해피문 랜드</h1>
        <p style={{ color: '#c9c2e8' }}>개발 중 · 오늘 밤도 즐거운 근무 되세요</p>
      </div>
    </main>
  );
}
