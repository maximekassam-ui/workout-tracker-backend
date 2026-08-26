"use strict";

/**
 * workout-exercise controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::workout-exercise.workout-exercise",
  ({ strapi }) => ({
    async update(ctx) {
      try {
        const user = ctx.state.user;

        const { id } = ctx.params;

        // console.log(user); info de l'utilisateur
        // console.log(id); lav67r2ahsqlhrput3wal6i1 => id du workout-exercise récupéré en params

        const methodWorkoutExercise = strapi.documents(
          "api::workout-exercise.workout-exercise",
        );

        const workoutExercise = await methodWorkoutExercise.findOne({
          documentId: id,
          populate: {
            workout: { populate: { user: true } },
          },
        });

        // console.log(workoutExercise); exo de la séance => populate séance et utilisateur

        if (workoutExercise && user.id === workoutExercise.workout.user.id) {
          const { execution_status } = ctx.request.body;

          //   console.log(execution_status); COMPLETED ou SKIPPED
          if (
            execution_status === "COMPLETED" ||
            execution_status === "SKIPPED"
          ) {
            if (workoutExercise.execution_status !== "PENDING") {
              ctx.response.status = 400;
              return { message: "Cet exercice est déjà terminé" };
            } else {
              const updatedWorkoutExercise = await methodWorkoutExercise.update(
                {
                  documentId: id,
                  data: {
                    execution_status,
                  },
                },
              );

              return updatedWorkoutExercise;
            }
          } else {
            ctx.response.status = 400;
            return { message: "execution_status invalide" };
          }
        } else {
          ctx.response.status = 403;
          return {
            message: "Vous n'êtes pas autorisé à modifier cet exercice",
          };
        }

        return "hello";
      } catch (error) {
        ctx.response.status = 500;
        return { message: error.message };
      }
    },
  }),
);
