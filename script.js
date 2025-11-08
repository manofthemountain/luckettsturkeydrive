console.log("Turkey Drive Tracker script loaded!");

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

    const { familiesFed, goal, reachGoals = [], matchActive, matchMessage, matchEnd } = data;

    // --- Calculate main + stretch goals --- //
    const maxGoal =
      reachGoals.length > 0
        ? Math.max(goal, ...reachGoals.map((g) => g.value))
        : goal;
    const percent = Math.min((familiesFed / maxGoal) * 100, 100);

    document
      .getElementById("thermo-outline")
      ?.setAttribute("data-maxgoal", `${maxGoal}`);

    /* ----------------- MATCHING BANNER ----------------- */
    handleMatchingBanner(matchActive, matchMessage, matchEnd);

    /* ----------------- THERMOMETER FILL ----------------- */
    const thermo = document.getElementById("thermo-fill");
    if (thermo) {
      thermo.style.height = `${percent}%`;
      thermo.classList.add("animate");

      if (familiesFed < goal * 0.5) {
        thermo.style.background = "linear-gradient(to top, #cc0000, #f28c28)";
      } else if (familiesFed < goal) {
        thermo.style.background = "linear-gradient(to top, #f28c28, #ffcc33)";
      } else {
        // Stretch goal glow
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
    document.getElementById("progress-text").textContent = "Unable to load progress.";
  }
}

// ========================= MATCHING BANNER ========================= //
function handleMatchingBanner(active, message, endTime) {
  const banner = document.getElementById("matching-banner");
  const text = document.getElementById("matching-text");
  const countdown = document.getElementById("countdown");

  if (!banner || !text) return;

  if (active) {
    banner.style.display = "block";
    banner.classList.add("active");
    text.textContent = message || "Matching donations active!";

    if (endTime && countdown) {
      const end = new Date(endTime).getTime();

      function updateCountdown() {
        const now = Date.now();
        const diff = end - now;

        if (diff <= 0) {
          countdown.textContent = "⏰ Matching period has ended!";
          banner.classList.remove("active");
          setTimeout(() => (banner.style.display = "none"), 4000);
          return;
        }

        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        countdown.textContent = `Ends in ${hours}h ${minutes}m`;
      }

      updateCountdown();
      setInterval(updateCountdown, 60000);
    }
  } else {
    banner.classList.remove("active");
    banner.style.display = "none";
  }
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

  const step = Math.round(maxGoal / 4 / 10) * 10;
  const milestones = [0, step, step * 2, step * 3, maxGoal];
  scale.innerHTML = "";

  milestones.forEach((val) => {
    const tick = document.createElement("div");
    tick.className = "thermo-tick";
    const pct = Math.min((val / maxGoal) * 100, 100);
    tick.style.bottom = `${pct}%`;
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
      if (localStorage.getItem(key) !== "true") {
        showStretchToast(`🎯 ${g.value} Families Fed — ${g.message}`);
        localStorage.setItem(key, "true");
      }
    }

    goalList.appendChild(li);
  });
}

// ---------- Stretch Goal Toast ----------
function showStretchToast(message) {
  const toast = document.createElement("div");
  toast.className = "stretch-toast";
  toast.textContent = message;

  const tracker = document.getElementById("tracker");
  tracker.appendChild(toast);

  setTimeout(() => toast.classList.add("visible"), 100);
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
  } catch {
    console.warn("Could not fetch last updated date.");
  }
}

// ========================= CELEBRATION EFFECTS ========================= //
function celebrateGoal() {
  const colors = ["#ffcc00", "#ff6666", "#66ccff", "#66ff99", "#ff9966"];
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.width = "8px";
    confetti.style.height = "8px";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.top = "-10px";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.opacity = Math.random();
    confetti.style.transition = "top 3s ease-out, opacity 3s ease-out";
    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.style.top = "100vh";
      confetti.style.opacity = 0;
    }, 50 + Math.random() * 100);
    setTimeout(() => confetti.remove(), 4000);
  }
}

function createSparkles() {
  for (let i = 0; i < 40; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = `${50 + (Math.random() - 0.5) * 40}%`;
    sparkle.style.top = `${70 - Math.random() * 60}%`;
    document.getElementById("thermo-outline").appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 3000);
  }
}

// ========================= INIT ========================= //
document.addEventListener("DOMContentLoaded", loadProgress);