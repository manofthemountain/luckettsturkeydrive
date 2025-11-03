async function loadProgress() {
  const progressUrl = 'data/progress.json';
  const repoOwner = 'manofthemountain';       // ← Change this
  const repoName = 'luckettsturkeydrive';         // ← Change this
  const filePath = 'data/progress.json';

  try {
    // Load progress numbers
    const response = await fetch(progressUrl);
    const data = await response.json();
    const familiesFed = data.familiesFed;
    const goal = data.goal;
    const percent = (familiesFed / goal) * 100;

    document.getElementById("progress-fill").style.width = percent + "%";
    document.getElementById("progress-text").textContent = `${familiesFed} / ${goal} Families Fed`;

    // Fetch last updated date using GitHub API
    const commitResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits?path=${filePath}&page=1&per_page=1`);
    const commits = await commitResponse.json();
    if (commits && commits.length > 0) {
      const lastUpdate = new Date(commits[0].commit.committer.date);
      const formatted = lastUpdate.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
      document.getElementById("last-updated").textContent = `Last updated: ${formatted}`;
    }

    // Optional: fun confetti when goal is met
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