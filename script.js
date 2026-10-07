console.log("🦃 Turkey Drive Tracker loaded!");

const CONFIG_URL = "./data/campaign.json";
const REPO_OWNER = "manofthemountain";
const REPO_NAME = "luckettsturkeydrive";
const CONFIG_PATH = "data/campaign.json";

async function loadCampaign() {
  try {
    const response = await fetch(CONFIG_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Campaign configuration not found");
    const data = await response.json();

    applyCampaignBranding(data);

    const now = new Date();
    const launch = new Date(data.launchDate);
    const end = new Date(data.endDate);

    if (data.endDate && now > end) {
      activatePostDriveMode(data);
      return;
    }

    if (data.launchDate && now < launch) {
      activatePreLaunchMode(data, launch);
      return;
    }

    activateLiveDriveMode(data);
  } catch (err) {
    console.error("Error loading campaign:", err);
    const text = document.getElementById("progress-text");
    if (text) text.textContent = "Unable to load Turkey Drive information.";
  }
}

function applyCampaignBranding(data) {
  const year = data.year || new Date().getFullYear();
  const org = data.organization || "Lucketts Elementary PTA";
  const name = data.campaignName || "Turkey Drive";
  const title = `${org} ${name} ${year}`;

  document.title = title;
  setText("site-title", title);
  setText("beneficiary", data.beneficiary ? `Benefiting the ${data.beneficiary}` : "");
  setText("footer-tags", `#Lucketts #ThankfulTogether #TurkeyDrive${year}`);

  const metaDescription = `Help make Thanksgiving brighter for local families! Every $${data.dollarsPerFamily || 10} donation helps feed a family.`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = metaDescription;
}

function activateLiveDriveMode(data) {
  const familiesFed = Number(data.familiesFed || 0);
  const goal = Number(data.goal || 200);
  const reachGoals = Array.isArray(data.reachGoals) ? data.reachGoals : [];
  const dollars = Number(data.dollarsPerFamily || 10);

  setText("drive-message", data.driveMessage || "");
  setText("campaign-dates", `${formatDate(data.launchDate)} – ${formatDate(data.endDate)}`);
  setText("donation-copy", `💛 Every $${dollars} donation helps feed a local family.`);
  setText("donate-button", `Donate $${dollars}`);
  setText("tracker-heading", `Goal: ${goal} Families Fed`);

  const link = document.getElementById("donate-link");
  if (link && data.donationUrl) link.href = data.donationUrl;

  renderPreviousImpact(data.previousYearImpact);
  handleMatchingBanner(data.matching?.active, data.matching?.message, data.matching?.endDate);

  const maxGoal = reachGoals.length ? Math.max(goal, ...reachGoals.map(g => Number(g.value || 0))) : goal;
  const percent = Math.min((familiesFed / maxGoal) * 100, 100);
  const outline = document.getElementById("thermo-outline");
  if (outline) outline.setAttribute("data-maxgoal", maxGoal);

  const thermo = document.getElementById("thermo-fill");
  if (thermo) {
    thermo.style.height = `${percent}%`;
    thermo.classList.add("animate");
    if (familiesFed < goal * 0.5) thermo.style.background = "linear-gradient(to top, #cc0000, #f28c28)";
    else if (familiesFed < goal) thermo.style.background = "linear-gradient(to top, #f28c28, #ffcc33)";
    else {
      thermo.style.background = "linear-gradient(to top, #ffd700, #ffec8b)";
      thermo.style.boxShadow = "0 0 20px 5px rgba(255,215,0,0.6)";
      createSparkles();
    }
  }

  const goalHeader = document.querySelector("#tracker h2");
  if (goalHeader && familiesFed > goal && !goalHeader.querySelector(".stretch-badge")) {
    const badge = document.createElement("span");
    badge.className = "stretch-badge";
    badge.textContent = "🌟 Stretch Goals Active!";
    goalHeader.appendChild(badge);
  }

  updateProgressText(familiesFed, goal);
  renderThermoScale(maxGoal);
  renderReachGoals(reachGoals, familiesFed);
  updateLastModified(REPO_OWNER, REPO_NAME, CONFIG_PATH);
  if (familiesFed >= goal) celebrateGoal();
}

function activatePreLaunchMode(data, launch) {
  document.body.classList.add("pre-launch");
  setText("drive-message", data.preLaunchMessage || `${data.campaignName || "Turkey Drive"} begins ${formatDate(data.launchDate)}.`);
  setText("campaign-dates", `Campaign: ${formatDate(data.launchDate)} – ${formatDate(data.endDate)}`);
  renderPreviousImpact(data.previousYearImpact);

  const donate = document.getElementById("donate");
  const tracker = document.getElementById("tracker");
  const goals = document.getElementById("reach-goals");
  if (donate) donate.style.display = "none";
  if (tracker) tracker.style.display = "none";
  if (goals) goals.style.display = "none";
  handleMatchingBanner(false, "", "");
}

function activatePostDriveMode(data) {
  const main = document.querySelector("main");
  if (!main) return;
  const familiesFed = Number(data.familiesFed || 0);
  const nextYear = Number(data.year || new Date().getFullYear()) + 1;
  const message = data.postDriveMessage || `Because of your generosity, we fed ${familiesFed} families this Thanksgiving.`;
  const photo = data.postDrivePhoto
    ? `<div class="thankyou-photo"><img src="${escapeHtml(data.postDrivePhoto)}" alt="Turkey Drive celebration" class="end-photo"></div>`
    : "";

  main.innerHTML = `
    <section id="thankyou-mode">
      <h2 class="end-title">🦃 Thank You, Lucketts! 🧡</h2>
      <p class="end-message">${escapeHtml(message)}</p>
      <p class="final-total"><strong>${familiesFed}</strong> families supported</p>
      ${photo}
      <p class="end-tagline">Together, we made Thanksgiving brighter for our community.</p>
      <div class="end-footer"><p>🍂 See You in ${nextYear}! 🍂</p></div>
    </section>`;

  document.body.classList.add("post-drive");
  handleMatchingBanner(false, "", "");
  celebrateGoalLong();
}

function renderPreviousImpact(impact) {
  const section = document.getElementById("previous-impact");
  const text = document.getElementById("previous-impact-text");
  if (!section || !text || !impact?.show) return;
  text.textContent = `Last year, Lucketts helped provide Thanksgiving turkeys to ${impact.familiesFed} families. 🧡`;
  section.style.display = "block";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "";
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
        day: "numeric"
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
      zIndex: 9999
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
function celebrateGoalLong() {
  const colors = ["#ffcc00", "#ff6666", "#66ccff", "#66ff99", "#ff9966"];

  for (let i = 0; i < 180; i++) {
    const confetti = document.createElement("div");
    Object.assign(confetti.style, {
      position: "fixed",
      width: "8px",
      height: "8px",
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      top: "-20px",
      left: Math.random() * 100 + "vw",
      opacity: Math.random(),
      transition: "top 6.5s ease-out, opacity 6.5s ease-out",
      zIndex: 9999
    });
    document.body.appendChild(confetti);

    // Start fall
    setTimeout(() => {
      confetti.style.top = "110vh";
      confetti.style.opacity = 0;
    }, 50 + Math.random() * 300);

    // Remove after animation
    setTimeout(() => confetti.remove(), 7500);
  }
}

// ========================= INIT ========================= //
document.addEventListener("DOMContentLoaded", loadCampaign);
