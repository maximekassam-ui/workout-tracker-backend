module.exports = {
  routes: [
    { method: "GET", path: "/workouts/current", handler: "workout.current" },
    { method: "GET", path: "/workouts/history", handler: "workout.history" },
  ],
};
