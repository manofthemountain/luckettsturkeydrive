console.log("Turkey Drive Tracker script loaded!");

async function loadProgress() {
  const progressUrl = './data/progress.json';
  const repoOwner = 'manofthemountain';
  const repoName = 'luckettsturkeydrive';
  const filePath = 'data/progress.json';

  try {
    const response = await fetch(progressUrl);
    if (!response.ok) throw new Error('Progress file not found');
    const data = await response.json();

    const familiesFed = data.familiesFed;
    const goal = data.goal;
    const percent = Math.min((familiesFed / goal) * 100, 100);

    // --- Matching banner logic ---
    const banner = document.getElementById("matching-banner");
    const bannerText = document.getElementById("matching-text");
    const countdown = document.getElementById("countdown");

    if (banner && bannerText) {
      if (data.matchActive) {
        banner.style.display = "block";
        banner.classList.add("active");
        bannerText.textContent = data.matchMessage || "Matching donations active!";

        if (data.matchEnd && countdown) {
          const endTime = new Date(data.matchEnd).getTime();
          const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;
            if (distance <= 0) {
              clearInterval(timer);
              countdown.textContent = "⏰ Matching period has ended!";
              setTimeout(() => (banner.style.display = "none"), 4000);
              return;
            }
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            countdown.textContent = `Ends in ${h}h ${m}m`;
          }, 60000);
        }
      } else {
        banner.classList.remove("active");
        banner.style.display = "none";
      }
    }

    // --- Thermometer fill ---
    const thermo = document.getElementById("thermo-fill");
    const text = document.getElementById("progress-text");
    const updated = document.getElementById("last-updated");
    if (thermo) {
      thermo.style.height = percent + "%";
      thermo.classList.add("animate");
    }

    // --- Milestone scale ---
    const scale = document.getElementById("thermo-scale");
    if (scale) {
      const milestones = [0, 50, 100, 150, 200];
      scale.innerHTML = "";
      milestones.forEach(val => {
        const tick = document.createElement("div");
        tick.style.bottom = `${(val / goal) * 100}%`;
        tick.innerHTML = `<span>${val}</span>`;
        scale.appendChild(tick);
      });
    }

    // --- Progress text & celebration ---
    if (text) {
      let msg = `${familiesFed} / ${goal} Families Fed`;
      if (familiesFed >= 200) msg += " 🎉 GOAL REACHED!";
      else if (familiesFed >= 100) msg += " 🦃 Incredible progress!";
      else if (familiesFed >= 50) msg += " 🥳 Halfway there!";
      text.textContent = msg;
    }

    // --- Last updated date ---
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
          updated.textContent = `Last updated: ${lastUpdate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
      }
    } catch (err) {
      console.warn('Could not fetch last updated date:', err);
    }

    // --- Reach goals list ---
    const goalList = document.getElementById("reach-goal-list");
    if (goalList && data.reachGoals) {
      goalList.innerHTML = "";
      data.reachGoals.forEach(g => {
        const li = document.createElement("li");
        li.innerHTML = `${g.value <= familiesFed ? "✅" : "⬜️"} <strong>${g.value} Families:</strong> ${g.message}`;
        goalList.appendChild(li);
      });
    }

    // --- Confetti if full goal reached ---
    if (familiesFed >= goal) celebrateGoal();

  } catch (err) {
    console.error('Error loading progress:', err);
    document.getElementById("progress-text").textContent = "Unable to load progress.";
  }
}

function celebrateGoal() {
  const colors = ['#ffcc00', '#ff6666', '#66ccff', '#66ff99', '#ff9966'];
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '8px';
    confetti.style.height = '8px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.top = '-10px';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.opacity = Math.random();
    confetti.style.transition = 'top 3s ease-out, opacity 3s ease-out';
    document.body.appendChild(confetti);
    setTimeout(() => {
      confetti.style.top = '100vh';
      confetti.style.opacity = 0;
    }, 50 + Math.random() * 100);
    setTimeout(() => confetti.remove(), 4000);
  }
}

document.addEventListener('DOMContentLoaded', loadProgress);