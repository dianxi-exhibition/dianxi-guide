const audio = document.querySelector("#narration");
const controls = document.querySelector("#player-controls");
const playToggle = document.querySelector("#play-toggle");
const seek = document.querySelector("#seek");
const elapsed = document.querySelector("#elapsed");
const duration = document.querySelector("#duration");
const error = document.querySelector("#player-error");

function readableTime(seconds) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = String(wholeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function updateTimeline() {
  const hasDuration = Number.isFinite(audio.duration) && audio.duration > 0;
  const position = audio.currentTime;
  elapsed.textContent = readableTime(position);
  duration.textContent = hasDuration ? readableTime(audio.duration) : "—";
  seek.disabled = !hasDuration;
  seek.max = hasDuration ? String(audio.duration) : "1";
  seek.value = String(position);
  seek.style.setProperty("--progress", hasDuration ? `${position / audio.duration * 100}%` : "0%");
  seek.setAttribute("aria-valuetext", `${elapsed.textContent} / ${duration.textContent}`);
}

function updatePlayButton() {
  const playing = !audio.paused && !audio.ended;
  playToggle.dataset.state = playing ? "playing" : "paused";
  playToggle.setAttribute("aria-label", playing ? "暂停讲解" : "播放讲解");
}

playToggle.addEventListener("click", async () => {
  if (!audio.paused && !audio.ended) {
    audio.pause();
    return;
  }

  error.hidden = true;
  if (audio.error) audio.load();
  try {
    await audio.play();
  } catch (playbackError) {
    if (playbackError.name !== "AbortError") error.hidden = false;
    updatePlayButton();
  }
});

seek.addEventListener("input", () => {
  audio.currentTime = seek.valueAsNumber;
  updateTimeline();
});

for (const event of ["loadedmetadata", "durationchange", "timeupdate", "seeked", "emptied"]) {
  audio.addEventListener(event, updateTimeline);
}
for (const event of ["play", "pause", "ended"]) {
  audio.addEventListener(event, updatePlayButton);
}
audio.addEventListener("error", () => {
  error.hidden = false;
  updatePlayButton();
});

updateTimeline();
updatePlayButton();
audio.hidden = true;
controls.hidden = false;
