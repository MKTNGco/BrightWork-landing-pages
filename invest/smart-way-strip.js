document.querySelectorAll('.sws-card[data-href]').forEach(function (card) {
  card.addEventListener('click', function (e) {
    if (e.target.closest('a')) return;
    window.location.href = card.dataset.href;
  });
});
