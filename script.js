console.log("🦃 Turkey Drive Tracker script loaded!");

// ========================= MAIN LOADER ========================= //
async function loadProgress() {
  const progressUrl = "./data/progress.json";
  const repoOwner = "manofthemountain";
  const repoName = "luckettsturkeydrive";
  const filePath = "data/progress.json";

  try {
    // --- Load JSON data --- //
    const response = await fetch(progressUrl);
    if (!response.ok) throw new Error("Progress file not found");
    const data = await response.json();

    const {
      familiesFed = 0,
      goal = 200,
      reachGoals = [],
      matchActive = false,
      matchMessage = "",
      matchEnd = "",
      driveEnd = "",
    } = data;

    // --- Check if the drive has ended --- //
    const now = new Date();
    const driveEnd = new Date(data.driveEnd);
    const now = new Date();

    if (driveEnd && now > driveEnd) {
      activatePostDriveMode(familiesFed, goal, data);
      return;
    }

    // --- Calculate main + stretch goals --- //
    const maxGoal = reachGoals.length
      ? Math.max(goal, ...reachGoals.map((g) => g.value))
      : goal;
    const percent = Math.min((familiesFed / maxGoal) * 100, 100);

    document
      .getElementById("thermo-outline")
      ?.setAttribute("data-maxgoal", maxGoal);

    /* ----------------- MATCHING BANNER ----------------- */
    handleMatchingBanner(matchActive, matchMessage, matchEnd);

    /* ----------------- THERMOMETER FILL ----------------- */
    const thermo = document.getElementById("thermo-fill");
    if (thermo) {
      thermo.style.height = `${percent}%`;
      thermo.classList.add("animate");

      // Color transitions by milestone
      if (familiesFed < goal * 0.5) {
        thermo.style.background = "linear-gradient(to top, #cc0000, #f28c28)";
      } else if (familiesFed < goal) {
        thermo.style.background = "linear-gradient(to top, #f28c28, #ffcc33)";
      } else {
        thermo.style.background = "linear-gradient(to top, #ffd700, #ffec8b)";
        thermo.style.boxShadow = "0 0 20px 5px rgba(255,215,0,0.6)";
        if (!thermo.classList.contains("stretch-celebrate")) {
          thermo.classList.add("stretch-celebrate");
          createSparkles();
        }
      }
    }

    /* ----------------- HEADER BADGE ----------------- */
    const goalHeader = document.querySelector("#tracker h2");
    if (goalHeader && familiesFed > goal && !goalHeader.querySelector(".stretch-badge")) {
      const badge = document.createElement("span");
      badge.className = "stretch-badge";
      badge.textContent = "🌟 Stretch Goals Active!";
      goalHeader.appendChild(badge);
    }

    /* ----------------- PROGRESS TEXT ----------------- */
    updateProgressText(familiesFed, goal);

    /* ----------------- SCALE MARKERS ----------------- */
    renderThermoScale(maxGoal);

    /* ----------------- COMMUNITY REACH GOALS ----------------- */
    renderReachGoals(reachGoals, familiesFed);

    /* ----------------- LAST UPDATED ----------------- */
    updateLastModified(repoOwner, repoName, filePath);

    /* ----------------- CELEBRATION ----------------- */
    if (familiesFed >= goal) celebrateGoal();

  } catch (err) {
    console.error("Error loading progress:", err);
    const text = document.getElementById("progress-text");
    if (text) text.textContent = "Unable to load progress.";
  }
}

// ========================= MATCHING BANNER ========================= //
function handleMatchingBanner(active, message, endTime) {
  const banner = document.getElementById("matching-banner");
  const text = document.getElementById("matching-text");
  const countdown = document.getElementById("countdown");
  if (!banner || !text) return;

  const hideBanner = () => {
    banner.classList.remove("active");
    setTimeout(() => (banner.style.display = "none"), 400);
  };

  if (active) {
    banner.style.display = "block";
    banner.classList.add("active");
    text.textContent = message || "Matching donations active!";

    if (endTime && countdown) {
      const end = new Date(endTime).getTime();
      const updateCountdown = () => {
        const diff = end - Date.now();
        if (diff <= 0) {
          countdown.textContent = "⏰ Matching period has ended!";
          hideBanner();
          return;
        }
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        countdown.textContent = `Ends in ${hours}h ${minutes}m`;
      };
      updateCountdown();
      setInterval(updateCountdown, 60000);
    }
  } else hideBanner();
}

// ========================= PROGRESS TEXT ========================= //
function updateProgressText(familiesFed, goal) {
  const text = document.getElementById("progress-text");
  if (!text) return;

  let msg = `${familiesFed} / ${goal} Families Fed`;
  if (familiesFed >= goal) msg += " 🎉 GOAL REACHED - Thank You, Lucketts!!";
  else if (familiesFed >= 100) msg += " 🦃 Incredible progress!";
  else if (familiesFed >= 50) msg += " 🥳 Halfway there!";
  text.textContent = msg;
}

// ========================= THERMOMETER SCALE ========================= //
function renderThermoScale(maxGoal) {
  const scale = document.getElementById("thermo-scale");
  if (!scale) return;

  const step = Math.ceil(maxGoal / 4 / 10) * 10;
  const milestones = [0, step, step * 2, step * 3, maxGoal];
  scale.innerHTML = "";

  milestones.forEach((val) => {
    const tick = document.createElement("div");
    tick.className = "thermo-tick";
    tick.style.bottom = `${Math.min((val / maxGoal) * 100, 100)}%`;
    tick.innerHTML = `<span>${val}</span>`;
    scale.appendChild(tick);
  });
}

// ========================= REACH GOALS + TOASTS ========================= //
function renderReachGoals(goals, familiesFed) {
  const goalList = document.getElementById("goal-list");
  if (!goalList || !Array.isArray(goals)) return;

  goalList.innerHTML = "";
  goals.forEach((g) => {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.disabled = true;

    const label = document.createElement("label");
    label.textContent = ` ${g.value} Families Fed — ${g.message}`;

    const reached = familiesFed >= g.value;
    checkbox.checked = reached;
    li.appendChild(checkbox);
    li.appendChild(label);

    if (reached) {
      li.classList.add("goal-reached");
      li.style.opacity = 0;
      li.style.transform = "scale(0.9)";
      setTimeout(() => {
        li.style.transition = "all 0.5s ease";
        li.style.opacity = 1;
        li.style.transform = "scale(1)";
      }, 100);

      // Toast for newly unlocked stretch goals
      const key = `goal_${g.value}`;
      if (!localStorage.getItem(key)) {
        showStretchToast(`🎯 ${g.value} Families Fed — ${g.message}`);
        localStorage.setItem(key, "true");
      }
    }

    goalList.appendChild(li);
  });
}

// ---------- Stretch Goal Toast ----------
function showStretchToast(message) {
  const tracker = document.getElementById("tracker");
  if (!tracker) return;

  const toast = document.createElement("div");
  toast.className = "stretch-toast";
  toast.textContent = message;

  tracker.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("visible"));
  setTimeout(() => toast.classList.remove("visible"), 4000);
  setTimeout(() => toast.remove(), 4500);
}

// ========================= GITHUB LAST UPDATED ========================= //
async function updateLastModified(repoOwner, repoName, filePath) {
  const updated = document.getElementById("last-updated");
  if (!updated) return;

  const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
    `https://api.github.com/repos/${repoOwner}/${repoName}/commits?path=${filePath}&page=1&per_page=1`
  )}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return;
    const wrapped = await res.json();
    const commits = JSON.parse(wrapped.contents);
    if (Array.isArray(commits) && commits.length > 0) {
      const last = new Date(commits[0].commit.committer.date);
      updated.textContent = `Last updated: ${last.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    }
  } catch (err) {
    console.warn("⚠️ Could not fetch last updated date.", err);
  }
}

// ========================= CELEBRATION EFFECTS ========================= //
function celebrateGoal() {
  const colors = ["#ffcc00", "#ff6666", "#66ccff", "#66ff99", "#ff9966"];
  for (let i = 0; i < 120; i++) {
    const confetti = document.createElement("div");
    Object.assign(confetti.style, {
      position: "fixed",
      width: "8px",
      height: "8px",
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      top: "-10px",
      left: Math.random() * 100 + "vw",
      opacity: Math.random(),
      transition: "top 3s ease-out, opacity 3s ease-out",
      zIndex: 9999,
    });
    document.body.appendChild(confetti);
    setTimeout(() => {
      confetti.style.top = "100vh";
      confetti.style.opacity = 0;
    }, 50 + Math.random() * 100);
    setTimeout(() => confetti.remove(), 3500);
  }
}

function createSparkles() {
  const outline = document.getElementById("thermo-outline");
  if (!outline) return;
  for (let i = 0; i < 30; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = `${50 + (Math.random() - 0.5) * 40}%`;
    sparkle.style.top = `${70 - Math.random() * 60}%`;
    outline.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 2500);
  }
}

// ========================= POST-DRIVE MODE ========================= //
function activatePostDriveMode(familiesFed, goal, data = {}) {
  const { driveMessage, drivePhoto } = data;
  const main = document.querySelector("main");
  if (!main) return;

  const photoSection = drivePhoto
    ? `<div class="thankyou-photo">
         <img src="${drivePhoto}" alt="Turkey Drive Celebration">
       </div>`
    : "";

  const messageText =
    driveMessage ||
    `Because of your generosity, we fed <strong>${familiesFed}</strong> families this Thanksgiving.`;

  main.innerHTML = `
    <section id="thankyou-mode">
      <h2>🦃 Thank You, Lucketts! 🧡</h2>
      <p>${messageText}</p>
      ${photoSection}
      <div id="thankyou-thermo">
        <div class="confetti-bg"></div>
        <p class="tagline">Together, we made Thanksgiving brighter for our community.</p>
      </div>
      <a href="https://luckettselementarypta.givebacks.com/" target="_blank">
        <button>View the 2025 Drive Results</button>
      </a>
    </section>
  `;

  document.body.classList.add("post-drive");
  celebrateGoal();
}

// ========================= INIT ========================= //
document.addEventListener("DOMContentLoaded", loadProgress);