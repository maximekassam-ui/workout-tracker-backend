"use strict";

/**
 * set controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::set.set", ({ strapi }) => ({
  async create(ctx) {
    try {
      const user = ctx.state.user; // information de l'utilisateur //

      const {
        workoutExerciseId,
        set_number,
        reps,
        load,
        duration,
        distance,
        completed,
      } = ctx.request.body;

      if (user) {
        if (workoutExerciseId) {
          const methodeWorkoutExercise = strapi.documents(
            "api::workout-exercise.workout-exercise",
          );

          //   console.log(workoutExerciseId); (id de l'exo de la séance)

          const workoutExercise = await methodeWorkoutExercise.findOne({
            documentId: workoutExerciseId,
            populate: {
              workout: {
                populate: {
                  user: true,
                },
              },
            },
          });

          //   console.log(workoutExercise); populate avec workout et son utilisateur

          if (user.id === workoutExercise.workout.user.id) {
            const methodeSet = strapi.documents("api::set.set");

            const set = await methodeSet.create({
              data: {
                set_number,
                reps,
                load,
                duration,
                distance,
                completed,
                workout_exercice: workoutExercise.documentId,
              },
            });

            return set;
          } else {
            ctx.response.status = 403;
            return {
              message: "Vous n'êtes pas autorisé à modifier cette séance",
            };
          }
        } else {
          ctx.response.status = 400;
          return { message: "workoutExerciseId est requis" };
        }
      }

      return "hello";
    } catch (error) {
      ctx.response.status = 500;
      return { message: error.message };
    }
  },
}));
