console.log("Turkey Drive Tracker script loaded!");

// Main loader
async function loadProgress() {
  const progressUrl = './data/progress.json';
  const repoOwner = 'manofthemountain';
  const repoName = 'luckettsturkeydrive';
  const filePath = 'data/progress.json';

  try {
    // Fetch JSON progress
    const response = await fetch(progressUrl);
    if (!response.ok) throw new Error('Progress file not found');
    const data = await response.json();

    const { familiesFed, goal, reachGoals } = data;

    // Determine the true maximum (stretch goal if available)
    const maxGoal = (Array.isArray(reachGoals) && reachGoals.length > 0)
      ? Math.max(goal, ...reachGoals.map(g => g.value))
      : goal;

    // Compute fill percentage relative to the top stretch goal
    const percent = Math.min((familiesFed / maxGoal) * 100, 100);

    document.getElementById("thermo-outline").setAttribute("data-maxgoal", `${maxGoal}`);

    /* ----------------- MATCHING BANNER ----------------- */
    const banner = document.getElementById("matching-banner");
    const bannerText = document.getElementById("matching-text");
    const countdown = document.getElementById("countdown");

    if (banner && bannerText) {
      if (data.matchActive) {
        banner.style.display = "block";
        banner.classList.add("active");
        bannerText.textContent = data.matchMessage || "Matching donations active!";

        // Countdown timer (updates every minute)
        if (data.matchEnd && countdown) {
          const endTime = new Date(data.matchEnd).getTime();

          function updateCountdown() {
            const now = Date.now();
            const distance = endTime - now;

            if (distance <= 0) {
              countdown.textContent = "⏰ Matching period has ended!";
              banner.classList.remove("active");
              setTimeout(() => (banner.style.display = "none"), 4000);
              return;
            }

            const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((distance / (1000 * 60)) % 60);
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

    /* ----------------- THERMOMETER FILL ----------------- */
    const thermo = document.getElementById("thermo-fill");
    if (thermo) {
      thermo.style.height = percent + "%";
      thermo.classList.add("animate");
    }

    /* ----------------- PROGRESS TEXT ----------------- */
    const text = document.getElementById("progress-text");
    if (text) {
      let msg = `${familiesFed} / ${goal} Families Fed`;
      if (familiesFed >= goal) msg += " 🎉 GOAL REACHED - Thank You, Lucketts!!";
      else if (familiesFed >= 100) msg += " 🦃 Incredible progress!";
      else if (familiesFed >= 50) msg += " 🥳 Halfway there!";
      text.textContent = msg;
    }

    /* ----------------- THERMOMETER SCALE (Fixed Layout) ----------------- */
    const scale = document.getElementById("thermo-scale");
    if (scale) {
      const step = Math.ceil(maxGoal / 4); // auto-adjust tick spacing
      const milestones = [0, step, step * 2, step * 3, maxGoal];
      scale.innerHTML = "";

      milestones.forEach((val) => {
        const tick = document.createElement("div");
        tick.className = "thermo-tick";
        const pct = Math.min((val / goal) * 100, 100);
        tick.style.bottom = `${pct}%`;
        tick.innerHTML = `<span>${val}</span>`;
        scale.appendChild(tick);
      });
    }

    /* ----------------- COMMUNITY REACH GOALS ----------------- */
    const goalList = document.getElementById("goal-list");
    if (goalList && Array.isArray(reachGoals)) {
      goalList.innerHTML = "";

      reachGoals.forEach(g => {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.disabled = true;

        const label = document.createElement("label");
        label.textContent = ` ${g.value} Families Fed — ${g.message}`;

        const goalReached = familiesFed >= g.value;
        checkbox.checked = goalReached;

        li.appendChild(checkbox);
        li.appendChild(label);

        if (goalReached) {
          li.classList.add("goal-reached");
          li.style.opacity = 0;
          li.style.transform = "scale(0.9)";
          setTimeout(() => {
            li.style.transition = "all 0.5s ease";
            li.style.opacity = 1;
            li.style.transform = "scale(1)";
          }, 100);
        }

        goalList.appendChild(li);
      });
    }

    /* ----------------- LAST UPDATED DATE ----------------- */
    const updated = document.getElementById("last-updated");
    if (updated) {
      const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://api.github.com/repos/${repoOwner}/${repoName}/commits?path=${filePath}&page=1&per_page=1`
      )}`;

      try {
        const commitResponse = await fetch(apiUrl);
        if (commitResponse.ok) {
          const wrapped = await commitResponse.json();
          const commits = JSON.parse(wrapped.contents);
          if (Array.isArray(commits) && commits.length > 0) {
            const lastUpdate = new Date(commits[0].commit.committer.date);
            updated.textContent = `Last updated: ${lastUpdate.toLocaleDateString('en-US', {
              month: 'short', day: 'numeric'
            })}`;
          }
        }
      } catch (err) {
        console.warn("Could not fetch last updated date:", err);
      }
    }

    /* ----------------- CONFETTI CELEBRATION ----------------- */
    if (familiesFed >= goal) celebrateGoal();

  } catch (err) {
    console.error("Error loading progress:", err);
    const text = document.getElementById("progress-text");
    if (text) text.textContent = "Unable to load progress.";
  }
}

/* ----------------- CONFETTI EFFECT ----------------- */
function celebrateGoal() {
  const colors = ['#ffcc00', '#ff6666', '#66ccff', '#66ff99', '#ff9966'];

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

/* ----------------- INIT ----------------- */
document.addEventListener("DOMContentLoaded", loadProgress);