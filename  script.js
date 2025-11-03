console.log("Script loaded!");

async function loadProgress() {
  try {
    const response = await fetch('https://manofthemountain.github.io/luckettsturkeydrive/data/progress.json');
    if (!response.ok) throw new Error('Progress file not found');

    const data = await response.json();
    console.log("Loaded data:", data);

    const familiesFed = data.familiesFed;
    const goal = data.goal;
    const percent = Math.min((familiesFed / goal) * 100, 100);

    const fill = document.getElementById("progress-fill");
    const text = document.getElementById("progress-text");

    fill.style.width = percent + "%";
    text.textContent = `${familiesFed} / ${goal} Families Fed`;

  } catch (err) {
    console.error('Error:', err);
    document.getElementById("progress-text").textContent = "Unable to load progress.";
  }
}

document.addEventListener('DOMContentLoaded', loadProgress);