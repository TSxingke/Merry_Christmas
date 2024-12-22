(function (window) {
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  const FRAME_RATE = 60;
  const PARTICLE_NUM = 1800;
  const RADIUS = Math.PI * 2;
  const CANVASWIDTH = window.innerWidth;
  const CANVASHEIGHT = 160;
  const CANVASID = 'canvas';

  let texts = ['DEAR XIN', 'LOOK UP AT THE', 'STARRY SKY', 'ARE YOU', 'LOOKING AT THE', 'SAME STAR', 'WITH ME ?',
    '2024', 'MERRY CHRISTMAS!!!', 'AND', 'I MISS YOU'];

  let canvas,
    ctx,
    particles = [],
    quiver = true,
    text = texts[0],
    textIndex = 0,
    textSize = 38;

  function draw() {
    ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.textBaseline = 'middle';
    ctx.fontWeight = 'bold';
    ctx.textRendering = 'optimizeLegibility';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.font = textSize + 'px "Microsoft YaHei", SimHei, "Avenir", "Helvetica Neue", Arial, sans-serif';

    const textWidth = ctx.measureText(text).width;
    const x = (CANVASWIDTH - textWidth) * 0.5;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillText(text, x, CANVASHEIGHT * 0.5);
    ctx.shadowBlur = 0;
    ctx.strokeText(text, x, CANVASHEIGHT * 0.5);

    let imgData = ctx.getImageData(0, 0, CANVASWIDTH, CANVASHEIGHT);
    ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);

    for (let i = 0, l = particles.length; i < l; i++) {
      let p = particles[i];
      p.inText = false;
    }
    particleText(imgData);

    window.requestAnimationFrame(draw);
  }

  function particleText(imgData) {
    var pxls = [];
    for (var w = CANVASWIDTH; w > 0; w -= 3) {
      for (var h = 0; h < CANVASHEIGHT; h += 3) {
        var index = (w + h * (CANVASWIDTH)) * 4;
        if (imgData.data[index] > 1) {
          pxls.push([w, h]);
        }
      }
    }

    var count = pxls.length;
    var j = parseInt((particles.length - pxls.length) / 2, 10);
    j = j < 0 ? 0 : j;

    for (var i = 0; i < pxls.length && j < particles.length; i++, j++) {
      try {
        var p = particles[j],
          X,
          Y;

        if (quiver) {
          X = (pxls[i - 1][0]) - (p.px + Math.random() * 5);
          Y = (pxls[i - 1][1]) - (p.py + Math.random() * 5);
        } else {
          X = (pxls[i - 1][0]) - p.px;
          Y = (pxls[i - 1][1]) - p.py;
        }
        var T = Math.sqrt(X * X + Y * Y);
        var A = Math.atan2(Y, X);
        var C = Math.cos(A);
        var S = Math.sin(A);
        p.x = p.px + C * T * p.delta;
        p.y = p.py + S * T * p.delta;
        p.px = p.x;
        p.py = p.y;
        p.inText = true;
        p.fadeIn();
        p.draw(ctx);
      } catch (e) { }
    }
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (!p.inText) {
        p.fadeOut();

        var X = p.mx - p.px;
        var Y = p.my - p.py;
        var T = Math.sqrt(X * X + Y * Y);
        var A = Math.atan2(Y, X);
        var C = Math.cos(A);
        var S = Math.sin(A);

        p.x = p.px + C * T * p.delta / 2;
        p.y = p.py + S * T * p.delta / 2;
        p.px = p.x;
        p.py = p.y;

        p.draw(ctx);
      }
    }
  }

  function setDimensions() {
    canvas.width = CANVASWIDTH;
    canvas.height = CANVASHEIGHT;
  }

  function event() {
    document.addEventListener('click', function (e) {
      textIndex++;
      if (textIndex >= texts.length) {
        textIndex--;
        return;
      }
      text = texts[textIndex];
    }, false);

    document.addEventListener('touchstart', function (e) {
      textIndex++;
      if (textIndex >= texts.length) {
        textIndex--;
        return;
      }
      text = texts[textIndex];
    }, false);
  }

  function init() {
    canvas = document.getElementById(CANVASID);
    if (canvas === null || !canvas.getContext) {
      return;
    }
    ctx = canvas.getContext('2d');
    setDimensions();
    event();

    for (var i = 0; i < PARTICLE_NUM; i++) {
      particles[i] = new Particle(canvas);
    }

    draw();
  }

  class Particle {
    constructor(canvas) {
      let spread = canvas.height;
      let size = Math.random() * 0.9;
      this.delta = 0.06;
      this.x = 0;
      this.y = 0;
      this.px = Math.random() * canvas.width;
      this.py = (canvas.height * 0.5) + ((Math.random() - 0.5) * spread);
      this.mx = this.px;
      this.my = this.py;
      this.size = size;
      this.inText = false;
      this.opacity = 0;
      this.fadeInRate = 0.005;
      this.fadeOutRate = 0.015;
      this.opacityTresh = 0.98;
      this.fadingOut = true;
      this.fadingIn = true;
    }
    fadeIn() {
      this.fadingIn = this.opacity > this.opacityTresh ? false : true;
      if (this.fadingIn) {
        this.opacity += this.fadeInRate;
      } else {
        this.opacity = 1;
      }
    }
    fadeOut() {
      this.fadingOut = this.opacity < 0 ? false : true;
      if (this.fadingOut) {
        this.opacity -= this.fadeOutRate;
        if (this.opacity < 0) {
          this.opacity = 0;
        }
      } else {
        this.opacity = 0;
      }
    }
    draw(ctx) {
      ctx.fillStyle = `rgba(255, 255, 200, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 1, 0, RADIUS, true);
      ctx.closePath();
      ctx.fill();
      
      if (this.opacity > 0.5) {
        ctx.shadowColor = 'rgba(255, 255, 200, 0.5)';
        ctx.shadowBlur = 2;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  function playAudio() {
    const audio = document.querySelector('audio');
    audio.volume = 0.5;
    audio.play().catch(function(error) {
      console.log("Audio play failed:", error);
    });
  }

  document.addEventListener('click', function() {
    playAudio();
  }, { once: true });

  window.addEventListener('load', init);
  window.addEventListener('resize', setDimensions);

})(window); 