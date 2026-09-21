(function () {
  'use strict';

  var root = document.querySelector('[data-ba-carousel]');
  if (!root) return;

  var slides = root.querySelectorAll('[data-ba-slide]');
  var dots = root.querySelectorAll('[data-ba-dot]');
  var prev = root.querySelector('[data-ba-prev]');
  var next = root.querySelector('[data-ba-next]');
  var index = 0;
  var total = slides.length;

  function show(i) {
    index = (i + total) % total;
    slides.forEach(function (slide, n) {
      slide.classList.toggle('is-active', n === index);
      slide.setAttribute('aria-hidden', n === index ? 'false' : 'true');
    });
    dots.forEach(function (dot, n) {
      dot.classList.toggle('is-active', n === index);
      dot.setAttribute('aria-selected', n === index ? 'true' : 'false');
    });
  }

  if (prev) prev.addEventListener('click', function () { show(index - 1); });
  if (next) next.addEventListener('click', function () { show(index + 1); });
  dots.forEach(function (dot, n) {
    dot.addEventListener('click', function () { show(n); });
  });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  show(0);
})();
