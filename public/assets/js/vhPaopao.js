export default (element, options) => {
  document.querySelectorAll('.vh-paopao').forEach(item => setTimeout(() => item.remove()));
  const config = Object.assign({ radius: 10, density: 0.3, clearOffset: 0.2 }, options);
  let width, height, ctx, active = true;
  const canvas = document.createElement('canvas');
  const particles = [];
  // 初始化画布
  const initCanvas = () => {
    width = element.offsetWidth;
    height = element.offsetHeight;
    Object.assign(canvas.style, { top: '0', zIndex: '0', position: 'absolute', 'pointer-events': 'none' });
    element.append(canvas);
    // 不修改父元素 overflow，避免阻塞页面滚动（原实现会阻止滚轮滚动）
    canvas.width = width;
    canvas.height = height;
    canvas.classList.add('vh-paopao');
    ctx = canvas.getContext('2d');
  };

  // 粒子类
  class Particle {
    constructor() { this.reset() }
    reset() {
      this.x = Math.random() * width;
      this.y = height + 100 * Math.random();
      this.alpha = 0.1 + Math.random() * config.clearOffset;
      this.scale = 0.1 + 0.3 * Math.random();
      this.speed = Math.random();
      this.color = config.color === "random" ? `rgba(${Math.random() * 255 | 0},0,0,${Math.random().toFixed(2)})` : config.color;
    }
    draw() {
      if (this.alpha <= 0) this.reset();
      this.y -= this.speed;
      this.alpha -= 0.0005;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.scale * config.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
  // 初始化
  initCanvas();
  // 动画循环（当页面滚动超出气泡层时暂停绘制，防止产生拖尾/白柱）
  const animate = () => {
    if (!active) {
      // 在变为不活跃时清空画布一次，避免残留轨迹
      ctx && ctx.clearRect(0, 0, width, height);
      requestAnimationFrame(animate);
      return;
    }
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => p.draw());
    requestAnimationFrame(animate);
  };
  Array.from({ length: Math.max(1, width * config.density | 0) }, () => particles.push(new Particle()));
  animate();
  // 事件监听
  window.addEventListener('scroll', () => {
    const isActive = document.documentElement.scrollTop <= height;
    if (isActive && !active) {
      active = true;
    } else if (!isActive && active) {
      active = false;
      // 立即清除画布，确保没有残留
      ctx && ctx.clearRect(0, 0, width, height);
    }
  });
  window.addEventListener('resize', () => { width = element.clientWidth; height = element.clientHeight; canvas.width = width; canvas.height = height; });
};