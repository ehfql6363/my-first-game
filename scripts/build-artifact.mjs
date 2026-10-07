// dist/ 빌드 결과를 아티팩트로 올릴 수 있는 HTML 한 파일로 합친다.
// 아티팩트는 문서 뼈대(<html>, <head>, <body>)를 스스로 감싸므로 본문 조각만 만든다.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';

const assets = readdirSync('dist/assets');
const read = (ext) => assets.filter((f) => f.endsWith(ext)).map((f) => readFileSync(`dist/assets/${f}`, 'utf8')).join('\n');
const css = read('.css');
const js = read('.js');
if (js.includes('</script')) throw new Error('JS 안에 </script 문자열이 있어 한 파일로 합칠 수 없습니다.');

const html = `<title>해피문 랜드</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&family=Nanum+Pen+Script&family=Silkscreen&display=swap">
<style>${css}</style>
<div id="app"></div>
<script type="module">${js}</script>
`;
mkdirSync('dist-artifact', { recursive: true });
writeFileSync('dist-artifact/happymoon-land.html', html);
console.log(`dist-artifact/happymoon-land.html (${(html.length / 1024).toFixed(1)} KB)`);
