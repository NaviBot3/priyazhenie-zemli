/* ========================================================
   СМЕШАРИКИ. СПОРТ — «ПРИТЯЖЕНИЕ ЗЕМЛИ» — интерактив
   ======================================================== */

// ---------- 1. ПРОГРЕСС-БАР СКРОЛЛА ----------
const progressBar = document.getElementById("progressBar");
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = percent + "%";
});

// ---------- 2. КУРСОР-БЛИК ----------
const cursorGlow = document.getElementById("cursorGlow");
document.addEventListener("mousemove", (e) => {
  cursorGlow.style.left = e.clientX + "px";
  cursorGlow.style.top = e.clientY + "px";
});

// ---------- 3. ГЕНЕРАЦИЯ ЗВЁЗД В HERO ----------
const starsContainer = document.getElementById("stars");
const STAR_COUNT = 90;
if (starsContainer) {
  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement("span");
    star.classList.add("star");
    const size = Math.random() * 2.5 + 1;
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 4 + "s";
    star.style.animationDuration = 2.5 + Math.random() * 4 + "s";
    starsContainer.appendChild(star);
  }
}

// ---------- 4. АНИМАЦИЯ ПОЯВЛЕНИЯ ----------
const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealItems.forEach((item) => revealObserver.observe(item));

// ---------- 5. СЧЁТЧИКИ В HERO ----------
const statNums = document.querySelectorAll(".stat__num");
let countersStarted = false;

function animateCounters() {
  if (countersStarted) return;
  const hero = document.getElementById("hero");
  if(!hero) return;
  const rect = hero.getBoundingClientRect();
  if (rect.bottom < window.innerHeight * 0.4) return;

  countersStarted = true;
  statNums.forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}
window.addEventListener("scroll", animateCounters);
window.addEventListener("load", () => setTimeout(animateCounters, 400));

// ---------- 6. ИНТЕРАКТИВ: «ПОДНИМИ ШТАНГУ» ----------
const liftBtn = document.getElementById("liftBtn");
const liftBarbell = document.getElementById("liftBarbell");
const liftProgress = document.getElementById("liftProgress");
const liftResult = document.getElementById("liftResult");

let liftHold = 0, liftInterval = null, isHolding = false, liftDone = false;
const HOLD_SPEED = 0.9, MAX_PLATE_TRAVEL = 140;

function startLift() {
  if (liftDone) return;
  isHolding = true;
  clearInterval(liftInterval);
  liftInterval = setInterval(() => {
    if (!isHolding) return;
    liftHold += HOLD_SPEED;
    if (liftHold > 100) liftHold = 100;
    updateLiftVisual();
    if (liftHold >= 100) {
      liftDone = true; isHolding = false; clearInterval(liftInterval);
      liftResult.textContent = "🏆 Штанга взята! «Плато» преодолено. Как у Копатыча!";
      liftBtn.textContent = "ГОТОВО"; liftBtn.disabled = true;
      liftBtn.style.opacity = "0.6"; liftBtn.style.cursor = "default";
    }
  }, 20);
}

function stopLift() {
  isHolding = false; clearInterval(liftInterval);
  if (liftDone) return;
  const fallInterval = setInterval(() => {
    if (isHolding || liftDone) { clearInterval(fallInterval); return; }
    liftHold -= 2.5;
    if (liftHold <= 0) {
      liftHold = 0; clearInterval(fallInterval);
      liftResult.textContent = "Притяжение земли сильнее… Попробуй ещё раз!";
    }
    updateLiftVisual();
  }, 20);
}

function updateLiftVisual() {
  liftProgress.style.width = liftHold + "%";
  const offset = (liftHold / 100) * MAX_PLATE_TRAVEL;
  liftBarbell.style.transform = `translateY(${-offset}px)`;
  if (isHolding && liftHold > 10 && liftHold < 95) {
    liftBarbell.style.transform += ` rotate(${(Math.random() - 0.5) * 2}deg)`;
  }
  if (!liftDone) {
    if (liftHold >= 80) liftResult.textContent = "Ещё чуть-чуть… не сдавайся!";
    else if (liftHold >= 50) liftResult.textContent = "Половина пути! Как Карыч!";
    else if (liftHold >= 20) liftResult.textContent = "Мышцы привыкают… продолжай!";
  }
}

if(liftBtn) {
  liftBtn.addEventListener("mousedown", startLift);
  liftBtn.addEventListener("mouseup", stopLift);
  liftBtn.addEventListener("mouseleave", () => { if (isHolding) stopLift(); });
  liftBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startLift(); }, { passive: false });
  liftBtn.addEventListener("touchend", (e) => { e.preventDefault(); stopLift(); }, { passive: false });
  liftBtn.addEventListener("keydown", (e) => { if (e.code === "Space") { e.preventDefault(); startLift(); } });
  liftBtn.addEventListener("keyup", (e) => { if (e.code === "Space") { e.preventDefault(); stopLift(); } });
}

// ---------- 7. ОТЗЫВЫ (КОММЕНТАРИИ) ----------
const reviewForm = document.getElementById("reviewForm");
const reviewsList = document.getElementById("reviewsList");

let savedReviews = JSON.parse(localStorage.getItem("smReviewList")) || [];

function renderReviews() {
  const firstReview = reviewsList.firstElementChild;
  reviewsList.innerHTML = "";
  if (firstReview) reviewsList.appendChild(firstReview);

  savedReviews.forEach(review => {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-card__header">
        <span class="review-card__name">${review.name}</span>
        <span class="review-card__date">${review.date}</span>
      </div>
      <p class="review-card__text">${review.text}</p>
    `;
    reviewsList.appendChild(card);
  });
}

if(reviewForm) {
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reviewName").value.trim();
    const text = document.getElementById("reviewText").value.trim();
    if(name && text) {
      const now = new Date();
      const dateStr = now.toLocaleDateString("ru-RU");
      const newReview = { name, text, date: dateStr };
      savedReviews.unshift(newReview);
      localStorage.setItem("smReviewList", JSON.stringify(savedReviews));
      reviewForm.reset();
      renderReviews();
    }
  });
}
if(reviewsList) renderReviews();

// ---------- 8. ЭКСКЛЮЗИВ: ПУТЬ КАРЫЧА ----------
let day = 1, progress = 0, isPlateau = false, isDone = false;
let hasCucumber = false; // Флаг: найден ли секретный огурец

const trainBtn = document.getElementById("trainBtn");
const resetBtn = document.getElementById("resetBtn");
const journeyFill = document.getElementById("journeyFill");
const journeyMsg = document.getElementById("journeyMsg");
const dayCount = document.getElementById("dayCount");
const weightCount = document.getElementById("weightCount");
const journeyBox = document.querySelector(".journey__box");

if (trainBtn) {
  trainBtn.addEventListener("click", () => {
    if (isDone) return;

    // Если уперлись в плато
    if (isPlateau) {
      if (hasCucumber) {
        // Победа благодаря огурцу
        progress = 100; 
        isPlateau = false;
        isDone = true;
        journeyFill.style.width = "100%";
        journeyMsg.innerHTML = "🔥 Секретный огурец дал сил! «Плато» пробито! Упорство победило.";
        journeyMsg.style.color = "var(--accent-3)";
        weightCount.textContent = "104";
        trainBtn.style.display = "none";
        resetBtn.style.display = "inline-block";
        journeyBox.style.borderColor = "var(--accent-3)";
      } else {
        // Без огурца плато не пробить
        journeyMsg.innerHTML = "❌ Плато не пробить... Говорят, у Копатыча есть секретный огурец силы. Кликни по нему в разделе «Герои».";
        journeyMsg.style.color = "#ff3333";
        journeyBox.classList.add("shake");
        setTimeout(() => journeyBox.classList.remove("shake"), 400);
      }
      return;
    }

    // Обычная тренировка (до 70%)
    if (progress < 70) {
      day++;
      // УМЕНЬШИЛИ ПРИРОСТ (теперь дни идут дольше)
      progress += Math.floor(Math.random() * 3) + 2; // +2..4% за клик
      
      if (progress >= 70) {
        progress = 70;
        isPlateau = true;
        trainBtn.textContent = "ПРЕОДОЛЕТЬ ПЛАТО";
        trainBtn.style.background = "linear-gradient(120deg, #ff3333, #ff6b35)"; 
        journeyMsg.innerHTML = "⚠️ Уперся в «плато»! Два года застоя. Нажми, чтобы попробовать пробить.";
        journeyMsg.style.color = "#ff3333";
        journeyBox.classList.add("shake");
        setTimeout(() => journeyBox.classList.remove("shake"), 400);
      } else {
        journeyMsg.textContent = "С каждым днем штанга кажется легче. Мышцы привыкают!";
        journeyMsg.style.color = "#fff";
      }
      
      dayCount.textContent = day;
      journeyFill.style.width = progress + "%";
      weightCount.textContent = Math.floor(2 + (progress * 1.5));
    }
  });

  resetBtn.addEventListener("click", () => {
    day = 1; progress = 0; isPlateau = false; isDone = false;
    hasCucumber = false; // Сбрасываем огурец при перезапуске
    dayCount.textContent = day;
    weightCount.textContent = "2";
    journeyFill.style.width = "0%";
    journeyMsg.textContent = "Каждый день — маленький шаг к силе.";
    journeyMsg.style.color = "#fff";
    trainBtn.textContent = "ТРЕНИРОВАТЬСЯ";
    trainBtn.style.background = "linear-gradient(120deg, var(--accent-3), var(--accent))";
    trainBtn.style.display = "inline-block";
    resetBtn.style.display = "none";
    journeyBox.style.borderColor = "var(--border)";
    
    // Восстанавливаем возможность найти огурец при перезапуске
    if (secretKopatych) secretKopatych.style.pointerEvents = "auto";
  });
}

// ---------- 9. ПАСХАЛКА: СЕКРЕТНЫЙ ОГУРЧИК (ТОЛЬКО ОДИН) ----------
const secretKopatych = document.getElementById("secretKopatych");
let clicks = 0;
if (secretKopatych) {
  secretKopatych.addEventListener("click", (e) => {
    if (hasCucumber) return; // Если уже найден - игнорируем

    clicks++;
    if (clicks === 5) {
      hasCucumber = true; 
      secretKopatych.style.pointerEvents = "none"; // Защита от спама

      // Получаем координаты Копатыча для анимации
      const rect = secretKopatych.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;

      // Создаем ОДИН огурец
      const cuke = document.createElement("div");
      cuke.className = "cucumber-pop";
      cuke.textContent = "🥒";
      cuke.style.left = startX + "px";
      cuke.style.top = startY + "px";
      document.body.appendChild(cuke);
      
      // Удаляем через 2.6 секунды
      setTimeout(() => cuke.remove(), 2600);

      // Выводим сообщение (тост)
      const toast = document.createElement("div");
      toast.innerHTML = "🥒 Секрет силы найден! Теперь ты можешь преодолеть «плато»!";
      toast.style.cssText = "position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); background: var(--accent-3); color: #000; padding: 16px 32px; border-radius: 50px; font-weight: bold; font-family: var(--font-display); z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: toastSlide 0.5s ease;";
      document.body.appendChild(toast);
      
      setTimeout(() => { toast.style.opacity = "0"; }, 3000);
      setTimeout(() => { toast.remove(); }, 3500);
      
      if (isPlateau && journeyMsg) {
        journeyMsg.innerHTML = "✅ Секрет найден! Жми «ПРЕОДОЛЕТЬ ПЛАТО»!";
        journeyMsg.style.color = "var(--accent-3)";
      }
      
      clicks = 0; 
    }
    setTimeout(() => { clicks = 0; }, 2000); 
  });
}

// ---------- 10. ЭКСКЛЮЗИВ: ПАДАЮЩИЕ ЗВЕЗДЫ (ГРАВИТАЦИЯ) ----------
let scrollVelocity = 0;
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  scrollVelocity = window.scrollY - lastScrollY;
  lastScrollY = window.scrollY;
});

function createFallingStar() {
  if (Math.abs(scrollVelocity) > 5) { 
    const star = document.createElement("div");
    star.className = "falling-star";
    star.style.left = Math.random() * 100 + "vw";
    star.style.top = "-10px";
    const speed = Math.min(Math.abs(scrollVelocity) * 0.05, 2) + 0.5; 
    star.style.animationDuration = speed + "s";
    document.body.appendChild(star);
    setTimeout(() => star.remove(), speed * 1000);
  }
  requestAnimationFrame(createFallingStar);
}
createFallingStar();

// ---------- 11. КОНСОЛЬНЫЙ ПРИВЕТ ----------
console.log(
  "%c🏋️ Притяжение земли — Смешарики. Спорт",
  "font-size:18px; font-weight:bold; color:#ffb703; background:#0a0a12; padding:8px 16px; border-radius:8px;"
);