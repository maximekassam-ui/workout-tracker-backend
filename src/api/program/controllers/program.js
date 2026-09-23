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
}));
