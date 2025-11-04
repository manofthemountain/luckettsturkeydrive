console.log("Turkey Drive Tracker script loaded!");

async function loadProgress() {
  const progressUrl = './data/progress.json';
  const repoOwner = 'manofthemountain';
  const repoName = 'luckettsturkeydrive';
  const filePath = 'data/progress.json';

  try {
    // 1️⃣ Fetch progress data from JSON
    const response = await fetch(progressUrl);
    if (!response.ok) throw new Error('Progress file not found');
    const data = await response.json();

    const familiesFed = data.familiesFed;
    const goal = data.goal;
    const percent = Math.min((familiesFed / goal) * 100, 100);
    
    const banner = document.getElementById("matching-banner");
    const bannerText = document.getElementById("matching-text");

      // --- Countdown timer for match end ---
      const countdown = document.getElementById("countdown");

      if (data.matchActive && data.matchEnd && countdown) {
        const endTime = new Date(data.matchEnd).getTime();

        function updateCountdown() {
          const now = new Date().getTime();
          const distance = endTime - now;

          if (distance <= 0) {
            countdown.textContent = "⏰ Matching period has ended!";
            clearInterval(timer);

            // Fade out banner after short delay
            setTimeout(() => {
              banner.classList.remove("active");
              banner.style.transition = "opacity 0.8s ease";
              banner.style.opacity = 0;
              setTimeout(() => (banner.style.display = "none"), 800);
            }, 3000);
            return;
          }

          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          countdown.textContent = `Matching ends in ${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        updateCountdown();                // Run immediately
        const timer = setInterval(updateCountdown, 1000); // Update every second
      } else if (countdown) {
        countdown.textContent = "";
      }

    // 2️⃣ Update progress bar (horizontal) and thermometer (vertical)
    const fill = document.getElementById("progress-fill");
    const text = document.getElementById("progress-text");
    const thermo = document.getElementById("thermo-fill");
    const updated = document.getElementById("last-updated");

    if (fill) fill.style.width = percent + "%";
    if (thermo) {
      thermo.style.height = percent + "%";
      thermo.classList.add("animate");
}
    if (text) text.textContent = `${familiesFed} / ${goal} Families Fed`;

    // 3️⃣ Get the latest commit date for "Last Updated"
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
          const formatted = lastUpdate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          });
          if (updated) updated.textContent = `Last updated: ${formatted}`;
        } else {
          if (updated) updated.textContent = `Last updated: unavailable`;
        }
      } else {
        if (updated) updated.textContent = `Last updated: unavailable`;
      }
    } catch (err) {
      console.warn('Could not fetch last updated date:', err);
      if (updated) updated.textContent = '';
    }

    // 4️⃣ Trigger celebration if goal reached
    if (familiesFed >= goal) {
      celebrateGoal();
    }

  } catch (err) {
    console.error('Error loading progress:', err);
    const text = document.getElementById("progress-text");
    if (text) text.textContent = "Unable to load progress.";
  }
}

// 🎉 Confetti celebration
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
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.transition = 'top 3s ease-out, opacity 3s ease-out';
    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.style.top = '100vh';
      confetti.style.opacity = 0;
    }, 50 + Math.random() * 100);

    setTimeout(() => {
      confetti.remove();
    }, 4000);
  }

  alert("🎉 Goal reached! 200 families fed — thank you, Lucketts!");
}

document.addEventListener('DOMContentLoaded', loadProgress);