async function loadProgress() {
  const progressUrl = './data/progress.json';
  const repoOwner = 'manofthemountain';
  const repoName = 'luckettsturkeydrive';
  const filePath = 'data/progress.json';

  try {
    // Load progress data
    const response = await fetch(progressUrl);
    if (!response.ok) throw new Error('Progress JSON not found');
    const data = await response.json();

    const familiesFed = data.familiesFed;
    const goal = data.goal;
    const percent = Math.min((familiesFed / goal) * 100, 100);

    document.getElementById("progress-fill").style.width = percent + "%";
    document.getElementById("progress-text").textContent = `${familiesFed} / ${goal} Families Fed`;

    // Show fallback "Last updated" in case API fails
    document.getElementById("last-updated").textContent = "Last updated: checking...";

    // Try GitHub API (CORS-safe JSON response)
    const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://api.github.com/repos/${repoOwner}/${repoName}/commits?path=${filePath}&page=1&per_page=1`
    )}`;

    const commitResponse = await fetch(apiUrl);
    if (commitResponse.ok) {
      const wrapped = await commitResponse.json();
      const commits = JSON.parse(wrapped.contents);
      if (Array.isArray(commits) && commits.length > 0) {
        const lastUpdate = new Date(commits[0].commit.committer.date);
        const formatted = lastUpdate.toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        document.getElementById("last-updated").textContent = `Last updated: ${formatted}`;
      } else {
        document.getElementById("last-updated").textContent = `Last updated: unavailable`;
      }
    } else {
      document.getElementById("last-updated").textContent = `Last updated: unavailable`;
    }

    // Optional fun confetti
    if (familiesFed >= goal) {
      document.body.style.backgroundColor = "#fff0d9";
      alert("🎉 Goal reached! 200 families fed — thank you, Lucketts!");
    }

  } catch (error) {
    console.error("Error loading progress:", error);
    document.getElementById("progress-text").textContent = "Unable to load progress.";
    document.getElementById("last-updated").textContent = "";
  }
}

loadProgress();