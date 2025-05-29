'use strict';

/**
 * nursery router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::nursery.nursery', {
  config: {
    find: {
      auth: false, // Allow public access to nursery list
    },
    findOne: {
      auth: false, // Allow public access to individual nursery
    }
  }
});

const customRoutes = {
  routes: [
    {
      method: 'GET',
      path: '/nurseries/slug/:slug',
      handler: 'nursery.findBySlug',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/nurseries/slug/:slug/newsletters',
      handler: 'nursery.getNewsletters',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/nurseries/slug/:slug/gallery',
      handler: 'nursery.getGallery',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/nurseries/slug/:slug/events',
      handler: 'nursery.getEvents',
      config: {
        auth: false,
      },
    },
  ],
};

// Merge default routes with custom routes
module.exports = {
  routes: [
    ...defaultRouter.routes,
    ...customRoutes.routes,
  ],
};