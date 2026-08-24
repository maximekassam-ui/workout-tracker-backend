"use strict";

/**
 * workout controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::workout.workout", ({ strapi }) => ({
  async create(ctx) {
    try {
    } catch (error) {
      ctx.response.status = 500;
      return { message: error.message };
    }
  },
}));
