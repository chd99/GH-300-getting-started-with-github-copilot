"""
Sport Exercise Tracker API

A lightweight dashboard for logging and reviewing daily sporting activities.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from pathlib import Path

app = FastAPI(
    title="Sport Exercise Tracker",
    description="Track daily training sessions and review workout trends"
)

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=current_dir / "static"), name="static")

# Keep the legacy activity-based data so older routes remain usable.
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    }
}

exercise_log = [
    {
        "id": 1,
        "date": "2026-09-30",
        "sport": "Running",
        "duration_minutes": 38,
        "distance_km": 6.2,
        "calories_burned": 420,
        "intensity": "Moderate",
        "notes": "Steady pace with a strong finish."
    },
    {
        "id": 2,
        "date": "2026-09-30",
        "sport": "Cycling",
        "duration_minutes": 52,
        "distance_km": 18.4,
        "calories_burned": 610,
        "intensity": "High",
        "notes": "Hill repeats on the outdoor route."
    },
    {
        "id": 3,
        "date": "2026-10-01",
        "sport": "Strength Training",
        "duration_minutes": 46,
        "distance_km": None,
        "calories_burned": 380,
        "intensity": "Moderate",
        "notes": "Upper-body and core session."
    },
    {
        "id": 4,
        "date": "2026-10-01",
        "sport": "Swimming",
        "duration_minutes": 34,
        "distance_km": 1.1,
        "calories_burned": 330,
        "intensity": "Low",
        "notes": "Recovery swim with relaxed pacing."
    },
]


class ExerciseEntry(BaseModel):
    date: str
    sport: str = Field(..., min_length=2)
    duration_minutes: int = Field(..., gt=0)
    distance_km: float | None = None
    calories_burned: int | None = None
    intensity: str = "Moderate"
    notes: str = ""


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return activities


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Legacy signup endpoint retained for compatibility."""
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    activity = activities[activity_name]
    if email in activity["participants"]:
        raise HTTPException(status_code=400, detail="Student is already signed up")

    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}


@app.get("/exercises")
def get_exercises():
    return exercise_log


@app.post("/exercises", status_code=201)
def add_exercise(entry: ExerciseEntry):
    exercise = {
        "id": max((item["id"] for item in exercise_log), default=0) + 1,
        "date": entry.date,
        "sport": entry.sport,
        "duration_minutes": entry.duration_minutes,
        "distance_km": entry.distance_km,
        "calories_burned": entry.calories_burned,
        "intensity": entry.intensity,
        "notes": entry.notes,
    }
    exercise_log.append(exercise)
    return exercise
