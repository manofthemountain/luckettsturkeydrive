console.log("Turkey Drive Tracker script loaded!");

async function loadProgress() {
  const progressUrl = 'https://manofthemountain.github.io/luckettsturkeydrive/data/progress.json';
  const repoOwner = 'manofthemountain';
  const repoName = 'luckettsturkeydrive';
  const filePath = 'data/progress.json';

  try {
    // 1️⃣ Fetch progress data
    const response = await fetch(progressUrl);
    if (!response.ok) throw new Error('Progress file not found');
    const data = await response.json();

    const familiesFed = data.familiesFed;
    const goal = data.goal;
    const percent = Math.min((familiesFed / goal) * 100, 100);

    // 2️⃣ Update progress bar and text
    const fill = document.getElementById("progress-fill");
    const text = document.getElementById("progress-text");
    const updated = document.getElementById("last-updated");

    fill.style.width = "0%"; // start from 0 for animation
    text.textContent = "Loading progress...";

    // Animate bar fill
    setTimeout(() => {
      fill.style.width = percent + "%";
    }, 100);

    text.textContent = `${familiesFed} / ${goal} Families Fed`;

    // 3️⃣ Get the last commit date via GitHub API (wrapped for CORS safety)
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
          updated.textContent = `Last updated: ${formatted}`;
        } else {
          updated.textContent = 'Last updated: unavailable';
        }
      } else {
        updated.textContent = 'Last updated: unavailable';
      }
    } catch (err) {
      console.warn('Could not fetch last updated date:', err);
      updated.textContent = '';
    }

    // 4️⃣ Optional fun animation or confetti when goal reached
    if (familiesFed >= goal) {
      celebrateGoal();
    }

  } catch (err) {
    console.error('Error loading progress:', err);
    document.getElementById("progress-text").textContent = "Unable to load progress.";
  }
}

// 🎉 Simple confetti animation
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