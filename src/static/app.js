document.addEventListener("DOMContentLoaded", () => {
  const exerciseList = document.getElementById("exercise-list");
  const exerciseForm = document.getElementById("exercise-form");
  const messageDiv = document.getElementById("message");
  const workoutCount = document.getElementById("workout-count");
  const avgDuration = document.getElementById("avg-duration");
  const totalCalories = document.getElementById("total-calories");
  const totalWorkoutMinutes = document.getElementById("total-workout-minutes");
  const refreshButton = document.getElementById("refresh-button");

  function showMessage(text, type = "success") {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    window.setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 4000);
  }

  function renderSummary(exercises) {
    const count = exercises.length;
    const totalMinutes = exercises.reduce((sum, entry) => sum + Number(entry.duration_minutes || 0), 0);
    const totalCaloriesBurned = exercises.reduce((sum, entry) => sum + Number(entry.calories_burned || 0), 0);
    const averageDuration = count ? Math.round(totalMinutes / count) : 0;

    workoutCount.textContent = String(count);
    avgDuration.textContent = `${averageDuration} min`;
    totalCalories.textContent = String(totalCaloriesBurned);
    totalWorkoutMinutes.textContent = String(totalMinutes);
  }

  function renderExercises(exercises) {
    if (!exercises.length) {
      exerciseList.innerHTML = "<p class='empty-state'>No workouts logged yet. Add your first training session.</p>";
      return;
    }

    const sortedExercises = [...exercises].sort((a, b) => new Date(b.date) - new Date(a.date));

    exerciseList.innerHTML = sortedExercises
      .map((entry) => {
        const distance = entry.distance_km != null ? `${entry.distance_km} km` : "—";
        const calories = entry.calories_burned != null ? `${entry.calories_burned} kcal` : "—";

        return `
          <article class="exercise-card">
            <div class="exercise-header">
              <div>
                <p class="exercise-date">${entry.date}</p>
                <h3>${entry.sport}</h3>
              </div>
              <span class="intensity intensity-${entry.intensity.toLowerCase()}">${entry.intensity}</span>
            </div>
            <div class="exercise-meta">
              <span>${entry.duration_minutes} min</span>
              <span>${distance}</span>
              <span>${calories}</span>
            </div>
            <p class="exercise-notes">${entry.notes || "No notes added."}</p>
          </article>
        `;
      })
      .join("");
  }

  async function fetchExercises() {
    try {
      const response = await fetch("/exercises");
      const exercises = await response.json();
      renderSummary(exercises);
      renderExercises(exercises);
    } catch (error) {
      exerciseList.innerHTML = "<p class='empty-state'>Unable to load workouts right now.</p>";
      console.error("Error fetching exercises:", error);
    }
  }

  exerciseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      date: document.getElementById("date").value,
      sport: document.getElementById("sport").value.trim(),
      duration_minutes: Number(document.getElementById("duration").value),
      distance_km: document.getElementById("distance").value ? Number(document.getElementById("distance").value) : null,
      calories_burned: document.getElementById("calories").value ? Number(document.getElementById("calories").value) : null,
      intensity: document.getElementById("intensity").value,
      notes: document.getElementById("notes").value.trim(),
    };

    try {
      const response = await fetch("/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Could not save workout.");
      }

      exerciseForm.reset();
      document.getElementById("intensity").value = "Moderate";
      showMessage(`${payload.sport} saved successfully!`, "success");
      await fetchExercises();
    } catch (error) {
      showMessage(error.message || "Failed to save workout.", "error");
      console.error("Error saving exercise:", error);
    }
  });

  refreshButton.addEventListener("click", fetchExercises);

  document.getElementById("date").valueAsDate = new Date();
  fetchExercises();
});
