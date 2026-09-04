(() => {
  const input = document.getElementById('photo-input');
  const uploadButton = document.getElementById('upload-button');
  const dropZone = document.getElementById('drop-zone');
  const result = document.getElementById('converter-result');
  const card = document.getElementById('converter');
  const status = document.getElementById('converter-status');
  const before = document.getElementById('before-canvas');
  const after = document.getElementById('after-canvas');
  const tryAnother = document.getElementById('try-another');
  const download = document.getElementById('download-result');

  if (!input || !before || !after) return;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const smoothstep = (a, b, value) => {
    const t = clamp((value - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = ((h % 360) + 360) % 360 / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r = 0, g = 0, b = 0;
    if (hp < 1) [r, g] = [c, x];
    else if (hp < 2) [r, g] = [x, c];
    else if (hp < 3) [g, b] = [c, x];
    else if (hp < 4) [g, b] = [x, c];
    else if (hp < 5) [r, b] = [x, c];
    else [r, b] = [c, x];
    const m = l - c / 2;
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
  }

  function colorize(source, target) {
    const sourceContext = source.getContext('2d', { willReadFrequently: true });
    const targetContext = target.getContext('2d');
    const frame = sourceContext.getImageData(0, 0, source.width, source.height);
    const pixels = frame.data;
    const width = source.width;
    const height = source.height;

    for (let i = 0; i < pixels.length; i += 4) {
      const pixel = i / 4;
      const x = (pixel % width) / width;
      const y = Math.floor(pixel / width) / height;
      const luminance = (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255;

      const faceDistance = Math.sqrt(Math.pow((x - .5) / .27, 2) + Math.pow((y - .39) / .31, 2));
      const faceShape = 1 - smoothstep(.72, 1.12, faceDistance);
      const skinTone = faceShape * smoothstep(.13, .28, luminance) * (1 - smoothstep(.82, .98, luminance));
      const hairShape = (1 - smoothstep(.48, .78, y)) * (1 - smoothstep(.55, 1.05, faceDistance));
      const hairTone = hairShape * (1 - smoothstep(.22, .5, luminance));
      const clothingTone = smoothstep(.57, .82, y) * (1 - smoothstep(.72, .92, luminance));

      const weights = [
        { weight: .16, hue: 205, saturation: .08 },
        { weight: skinTone * 1.7, hue: 27, saturation: .34 },
        { weight: hairTone * 1.15, hue: 24, saturation: .16 },
        { weight: clothingTone * 1.3, hue: 218, saturation: .43 }
      ];
      const total = weights.reduce((sum, item) => sum + item.weight, 0);
      const hueX = weights.reduce((sum, item) => sum + Math.cos(item.hue * Math.PI / 180) * item.weight, 0) / total;
      const hueY = weights.reduce((sum, item) => sum + Math.sin(item.hue * Math.PI / 180) * item.weight, 0) / total;
      const hue = Math.atan2(hueY, hueX) * 180 / Math.PI;
      const saturation = clamp(weights.reduce((sum, item) => sum + item.saturation * item.weight, 0) / total, 0, .46);
      const [r, g, b] = hslToRgb(hue, saturation, clamp(luminance * 1.01, .015, .985));

      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
    }

    targetContext.putImageData(frame, 0, 0);
  }

  async function processFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      status.textContent = 'Please choose a JPEG, PNG or WebP image.';
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      status.textContent = 'Please choose an image smaller than 15 MB.';
      return;
    }

    card.classList.add('is-working');
    status.textContent = '';
    try {
      const bitmap = await createImageBitmap(file);
      const maxSide = 720;
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      before.width = after.width = width;
      before.height = after.height = height;
      const context = before.getContext('2d', { willReadFrequently: true });
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);
      context.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
      await new Promise(resolve => requestAnimationFrame(resolve));
      colorize(before, after);
      dropZone.hidden = true;
      result.hidden = false;
      status.textContent = 'Color estimate complete. No image data left your browser.';
    } catch (error) {
      status.textContent = 'That image could not be processed. Please try another file.';
    } finally {
      card.classList.remove('is-working');
    }
  }

  uploadButton.addEventListener('click', () => input.click());
  input.addEventListener('change', () => processFile(input.files[0]));
  tryAnother.addEventListener('click', () => {
    input.value = '';
    result.hidden = true;
    dropZone.hidden = false;
    status.textContent = '';
    input.click();
  });
  download.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'isha-colorized-photo.png';
    link.href = after.toDataURL('image/png');
    link.click();
  });
  ['dragenter', 'dragover'].forEach(eventName => dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.add('is-dragging');
  }));
  ['dragleave', 'drop'].forEach(eventName => dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.remove('is-dragging');
  }));
  dropZone.addEventListener('drop', event => processFile(event.dataTransfer.files[0]));
})();
