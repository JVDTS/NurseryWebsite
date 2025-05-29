'use strict';

/**
 * nursery controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::nursery.nursery', ({ strapi }) => ({
  /**
   * Find content by nursery slug
   */
  async findBySlug(ctx) {
    const { slug } = ctx.params;
    
    try {
      // Find nursery by slug
      const nursery = await strapi.entityService.findMany('api::nursery.nursery', {
        filters: { slug: { $eq: slug } },
        populate: {
          heroImage: true,
          newsletters: {
            populate: {
              pdfUpload: true
            }
          },
          events: {
            populate: {
              featuredImage: true
            }
          },
          galleryImages: {
            populate: {
              image: true
            }
          }
        },
        publicationState: 'live'
      });

      if (!nursery || nursery.length === 0) {
        return ctx.notFound('Nursery not found');
      }

      ctx.body = {
        data: nursery[0]
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get newsletters for a specific nursery by slug
   */
  async getNewsletters(ctx) {
    const { slug } = ctx.params;
    
    try {
      const nursery = await strapi.entityService.findMany('api::nursery.nursery', {
        filters: { slug: { $eq: slug } },
        publicationState: 'live'
      });

      if (!nursery || nursery.length === 0) {
        return ctx.notFound('Nursery not found');
      }

      const newsletters = await strapi.entityService.findMany('api::newsletter.newsletter', {
        filters: { 
          nursery: { id: { $eq: nursery[0].id } }
        },
        populate: {
          pdfUpload: true
        },
        sort: { year: 'desc', month: 'desc' },
        publicationState: 'live'
      });

      ctx.body = {
        data: newsletters
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get gallery images for a specific nursery by slug
   */
  async getGallery(ctx) {
    const { slug } = ctx.params;
    const { category, featured } = ctx.query;
    
    try {
      const nursery = await strapi.entityService.findMany('api::nursery.nursery', {
        filters: { slug: { $eq: slug } },
        publicationState: 'live'
      });

      if (!nursery || nursery.length === 0) {
        return ctx.notFound('Nursery not found');
      }

      const filters = {
        nursery: { id: { $eq: nursery[0].id } }
      };

      if (category) {
        filters.category = { $eq: category };
      }

      if (featured === 'true') {
        filters.featured = { $eq: true };
      }

      const galleryImages = await strapi.entityService.findMany('api::gallery-image.gallery-image', {
        filters,
        populate: {
          image: true
        },
        sort: { sortOrder: 'asc', createdAt: 'desc' },
        publicationState: 'live'
      });

      ctx.body = {
        data: galleryImages
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  /**
   * Get events for a specific nursery by slug
   */
  async getEvents(ctx) {
    const { slug } = ctx.params;
    const { status, upcoming } = ctx.query;
    
    try {
      const nursery = await strapi.entityService.findMany('api::nursery.nursery', {
        filters: { slug: { $eq: slug } },
        publicationState: 'live'
      });

      if (!nursery || nursery.length === 0) {
        return ctx.notFound('Nursery not found');
      }

      const filters = {
        nursery: { id: { $eq: nursery[0].id } }
      };

      if (status) {
        filters.status = { $eq: status };
      }

      if (upcoming === 'true') {
        filters.date = { $gte: new Date().toISOString() };
      }

      const events = await strapi.entityService.findMany('api::event.event', {
        filters,
        populate: {
          featuredImage: true
        },
        sort: { date: 'asc' },
        publicationState: 'live'
      });

      ctx.body = {
        data: events
      };
    } catch (error) {
      ctx.throw(500, error);
    }
  }
}));