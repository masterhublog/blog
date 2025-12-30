import vhPaopaoInit from '../../public/assets/js/vhPaopao.js';
let layerHeight = 0;
export default async () => {
  // 调用，优先选择 paopao-layer，其次回退到 main
  const target = document.querySelector('.paopao-layer') || document.querySelector('main.main');
  if (!target) return;
  setTimeout(() => {
    const h = (target as HTMLElement).clientHeight || 0;
    if (layerHeight == h) return;
    layerHeight = h;
    // 更柔和的气泡颜色，覆盖整体页面背景
    vhPaopaoInit(target, { radius: 10, density: 0.18, color: "rgba(255,255,255,0.16)", clearOffset: 0.99 });
  }, 688);
}