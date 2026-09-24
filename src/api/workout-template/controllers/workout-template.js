"use strict";

/**
 * workout-template controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::workout-template.workout-template",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const userInfos = ctx.state.user;
        if (!userInfos) {
          return ctx.unauthorized(
            "Vous devez être connecté pour créer une séance.",
          );
        }

        const { data } = ctx.request.body;

        const { name, category, description, documentId } = data;

        const programMethod = strapi.documents("api::program.program");

        const program = await programMethod.findOne({
          documentId: documentId,
          populate: { user: true },
        });

        if (!program) {
          ctx.response.status = 404;
          return { message: "Ce programme n'existe pas" };
        }
        if (program.user) {
          if (program.user.documentId === userInfos.documentId) {
            const methodWorkoutTemplate = strapi.documents(
              "api::workout-template.workout-template",
            );

            const workoutTemplate = await methodWorkoutTemplate.create({
              data: {
                name: name,
                category: category,
                description: description,
                program: documentId,
              },
            });

            return workoutTemplate;
          } else {
            ctx.response.status = 403;
            return { message: "Ce programme ne vous appartient pas" };
          }
        } else {
          ctx.response.status = 403;
          return { message: "Cet utilisateur n'existe pas" };
        }
      } catch (error) {
        console.log(error);
      }
    },
  }),
);
