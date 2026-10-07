"use strict";

/**
 * program controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::program.program", ({ strapi }) => ({
  async create(ctx) {
    try {
      const userInfos = ctx.state.user;
      if (!userInfos) {
        return ctx.unauthorized("Vous devez être connécté");
      }
      const { name, description, is_active } = ctx.request.body.data;

      const newProgram = await strapi.documents("api::program.program").create({
        data: { name, description, is_active, user: userInfos.documentId },
      });

      return newProgram;
    } catch (error) {
      console.log(error);
      return ctx.internalServerError("Erreur lors de la création du programme");
    }
  },
  async findOne(ctx) {
    try {
      const userInfos = ctx.state.user;
      const documentId = ctx.params.id;

      console.log(documentId);

      const program = await strapi.documents("api::program.program").findOne({
        documentId: documentId,
        populate: {
          user: true,
          workout_templates: { populate: ["program_exercises"] },
        },
      });

      if (program && program.user) {
        if (userInfos.documentId === program.user.documentId) {
          return program;
        } else {
          ctx.response.status = 403;

          return { message: "Vous n'êtes pas le propriétaire de ce programme" };
        }
      } else {
        ctx.response.status = 404;
        return { message: "programme introuvable" };
      }
    } catch (error) {
      console.log(error);
    }
  },
}));
