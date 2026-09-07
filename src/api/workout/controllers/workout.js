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

                const newWorkoutExercises = [];

                for (const currentProgramExercise of existingProgramExercise) {
                  // console.log(currentProgramExercise);

                  const newWorkoutExercise = await workoutExercise.create({
                    data: {
                      order: currentProgramExercise.order ?? 0,
                      execution_status: "PENDING",
                      was_modified: false,
                      workout: newWorkout.documentId,
                      program_exercise: currentProgramExercise.documentId,
                      exercise: currentProgramExercise.exercise.documentId,
                    },
                  });

                  newWorkoutExercises.push(newWorkoutExercise);

                  // console.log(newWorkoutExercise);
                  const populateWorkoutExercise = await workoutExercise.findOne(
                    {
                      documentId: newWorkoutExercise.documentId,
                      populate: {
                        workout: true,
                        exercise: true,
                        program_exercise: true,
                      },
                    },
                  );

                  // console.log(populateWorkoutExercise);
                }
                return {
                  workout: newWorkout,
                  workoutExercises: newWorkoutExercises,
                };
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
    } catch (error) {
      ctx.response.status = 500;
      return { message: error.message };
    }
  },

  async update(ctx) {
    try {
      const user = ctx.state.user; //info de l'utilisateur
      const { id } = ctx.params; //id de la séancee
      const { workout_status } = ctx.request.body; //status de la séance

      const methodWorkout = strapi.documents("api::workout.workout");

      const workout = await methodWorkout.findOne({
        documentId: id,
        populate: { user: true },
      });

      // console.log(workout); infos de la séance

      if (workout && user.id === workout.user.id) {
        if (workout.workout_status === "in_progress") {
          if (workout_status === "completed") {
            const methodWorkoutExercise = strapi.documents(
              "api::workout-exercise.workout-exercise",
            );

            const workoutExercise = await methodWorkoutExercise.findMany({
              filters: {
                workout: {
                  id: {
                    $eq: workout.id,
                  },
                },
              },
            });

            // console.log(workoutExercise); tableau de chaque exercices associé a la séance
            for (const pendingWorkoutExercise of workoutExercise) {
              if (pendingWorkoutExercise.execution_status === "PENDING") {
                ctx.response.status = 409;
                return { message: "Veuillez finir tous les exercices" };
              }
            }
            const startedAt = new Date(workout.started_at);
            // console.log(startedAt.getTime());

            const duration = Math.floor(
              (new Date().getTime() - startedAt.getTime()) / 60000,
            );
            // console.log(duration);

            const newWorkout = await methodWorkout.update({
              documentId: id,
              data: {
                workout_status: "completed",
                completed_at: new Date(),
                duration: duration,
              },
            });

            return newWorkout;
          } else if (workout_status === "cancelled") {
            const startedAt = new Date(workout.started_at);
            // console.log(startedAt.getTime());

            const duration = Math.floor(
              (new Date().getTime() - startedAt.getTime()) / 60000,
            );
            // console.log(duration);
            const newWorkout = await methodWorkout.update({
              documentId: id,
              data: {
                workout_status: "cancelled",
                duration: duration,
              },
            });

            return newWorkout;
          }
        }
      } else {
        ctx.response.status = 404;
        return { message: "Séance introuvable" };
      }
    } catch (error) {
      ctx.response.status = 500;
      return { message: error.message };
    }
  },
  async current(ctx) {
    try {
      const user = ctx.state.user;

      const methodWorkout = strapi.documents("api::workout.workout");
      const methodWorkoutExercises = strapi.documents(
        "api::workout-exercise.workout-exercise",
      );

      const allWorkout = await methodWorkout.findMany({
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
        populate: {
          workout_exercises: { sort: { order: "asc" } },
        },
      });

      if (allWorkout.length === 0) {
        ctx.response.status = 404;
        return { message: "Vous n'avez pas de séance en cours" };
      } else {
        const currentWorkout = allWorkout[0];

        const allWorkoutExercises = currentWorkout.workout_exercises; //tous les exo de la séance en cours

        const arrayOfWorkoutExercises = [];

        for (const WorkoutExercises of allWorkoutExercises) {
          const newWorkoutExercise = await methodWorkoutExercises.findOne({
            documentId: WorkoutExercises.documentId,
            populate: { exercise: true, sets: true, program_exercise: true },
          });
          arrayOfWorkoutExercises.push(newWorkoutExercise);
        }

        const { workout_exercises, ...workout } = currentWorkout;
        let workoutExerciseInPending = null;
        // console.log(arrayOfWorkoutExercises); liste des exo de la séance en cours
        for (const pendingWorkoutExercise of arrayOfWorkoutExercises) {
          if (pendingWorkoutExercise.execution_status === "PENDING") {
            workoutExerciseInPending = pendingWorkoutExercise;
            break;
          }
        }

        const lastWorkoutEx = await methodWorkoutExercises.findMany({
          filters: {
            exercise: {
              id: {
                $eq: workoutExerciseInPending.exercise.id,
              },
            },
            workout: {
              workout_status: {
                $eq: "completed",
              },
            },
          },
          populate: {
            workout: true,
            sets: true,
          },
        });

        let previousSets = [];

        if (lastWorkoutEx.length > 0) {
          const lastWorkoutExercise = lastWorkoutEx.sort(
            (a, b) =>
              new Date(b.workout.completed_at) -
              new Date(a.workout.completed_at),
          )[0];

          console.log("DERNIERE SEANCE", lastWorkoutExercise);

          if (lastWorkoutExercise.sets) {
            previousSets = lastWorkoutExercise.sets;
          }
        }
        return {
          workout: workout,
          WorkoutExercises: arrayOfWorkoutExercises,
          pendingWorkoutExercise: workoutExerciseInPending,
          previousSets: previousSets,
        };
      }
    } catch (error) {
      ctx.response.status = 500;
      return { message: error.message };
    }
  },
}));
