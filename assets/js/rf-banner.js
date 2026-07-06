/* ============================================================
   RINCÓN DE FREDDY — animación del banner (anime.js)
   Anima la imagen de fachada y el título "Rincón de Freddy"
   justo debajo del header, usando https://animejs.com/
   ============================================================ */
(function () {
  function runBannerAnimation() {
    if (typeof anime === 'undefined') return;

    var banner = document.getElementById('rf-banner');
    if (!banner) return;

    var words = banner.querySelectorAll('.rf-banner-word');
    var sub = banner.querySelector('.rf-banner-sub');
    var img = document.getElementById('rf-banner-img');

    var timeline = anime.timeline({
      easing: 'easeOutExpo',
    });

    timeline
      .add({
        targets: img,
        opacity: [0, 1],
        scale: [1.12, 1],
        duration: 1400,
      })
      .add({
        targets: words,
        opacity: [0, 1],
        translateY: [28, 0],
        delay: anime.stagger(120),
        duration: 900,
      }, '-=900')
      .add({
        targets: sub,
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 700,
      }, '-=400');

    // Suave efecto parallax de la imagen del banner al hacer scroll.
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var rect = banner.getBoundingClientRect();
        var progress = Math.min(Math.max((0 - rect.top) / (rect.height || 1), 0), 1);
        anime.set(img, { translateY: progress * 40 });
        ticking = false;
      });
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBannerAnimation);
  } else {
    runBannerAnimation();
  }
})();
