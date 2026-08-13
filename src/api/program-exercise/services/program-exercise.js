'use strict';

/**
 * program-exercise service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::program-exercise.program-exercise');
