console.log("Script loaded!");
async function loadProgress() {
  try {
    const response = await fetch('./data/progress.json');
    if (!response.ok) throw new Error('Progress file not found');

    const data = await response.json();
    const familiesFed = data.familiesFed;
    const goal = data.goal;
    const percent = Math.min((familiesFed / goal) * 100, 100);

    // Update progress bar and text
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