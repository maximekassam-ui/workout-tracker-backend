'use strict';

/**
 * exercise-muscle service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::exercise-muscle.exercise-muscle');
