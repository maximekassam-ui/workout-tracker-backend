"use strict";

/**
 * workout controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::workout.workout", ({ strapi }) => ({
  async create(ctx) {
    try {
      const user = ctx.state.user;
      // console.log(user);

      if (user) {
        const { workoutTemplateId } = ctx.request.body;
        // console.log(workoutTemplateId);

        if (workoutTemplateId) {
          const workout = strapi.documents("api::workout.workout");
          // console.log(workout);

          const existingWorkouts = await workout.findMany({
            filters: {
              user: {
                id: {
                  $eq: user.id,
                },
              },
              workout_status: {
                $eq: "in_progress",
              },
            },
          });

          // console.log(existingWorkouts);

          if (existingWorkouts.length > 0) {
            ctx.response.status = 409;
            return { message: "Une séance est déjà en cours" };
          } else {
            const workoutTemplate = strapi.documents(
              "api::workout-template.workout-template",
            );

            console.log("ID envoyé :", workoutTemplateId);

            // const existingWorkoutTemplate =
            //   await workoutTemplate.findOne(workoutTemplateId);

            const existingWorkoutTemplate = await workoutTemplate.findOne({
              documentId: workoutTemplateId,
            });

            // console.log("Template :", existingWorkoutTemplate);

            if (existingWorkoutTemplate) {
              const programExercise = strapi.documents(
                "api::program-exercise.program-exercise",
              );

              const existingProgramExercise = await programExercise.findMany({
                filters: {
                  workout_template: {
                    id: {
                      $eq: existingWorkoutTemplate.id,
                    },
                  },
                },
                populate: {
                  exercise: true,
                },
              });

              // console.log("existingProgramExercise");

              if (existingProgramExercise.length === 0) {
                ctx.response.status = 400;
                return { message: "Aucun exercice dans ce WorkoutTemplate" };
              } else {
                const newWorkout = await workout.create({
                  data: {
                    user: user.id,
                    workout_template: workoutTemplateId,
                    workout_status: "in_progress",
                    started_at: new Date(),
                  },
                });
                // console.log(newWorkout);

                const workoutExercise = strapi.documents(
                  "api::workout-exercise.workout-exercise",
                );

                for (const currentProgramExercise of existingProgramExercise) {
                  // console.log(currentProgramExercise);

                  const newWorkoutExercise = await workoutExercise.create({
                    data: {
                      order: programExercise.order ?? 0,
                      execution_status: "PENDING",
                      was_modified: false,
                      workout: newWorkout.documentId,
                      program_exercise: programExercise.documentId,
                      exercise: currentProgramExercise.exercise.documentId,
                    },
                  });

                  console.log(newWorkoutExercise);
                }
              }
            }
          }
        } else {
          ctx.response.status = 400;
          return { message: "workoutTemplateId est requis" };
        }
      } else {
        ctx.response.status = 401;
        return { message: "Utilisateur non authentifié" };
      }

      return "hello";
    } catch (error) {
      ctx.response.status = 500;
      return { message: error.message };
    }
  },
}));
