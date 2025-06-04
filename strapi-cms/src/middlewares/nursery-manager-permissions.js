/**
 * Middleware to enforce nursery-specific permissions for NurseryManager role
 */

'use strict';

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const { user } = ctx.state;
    
    // Skip middleware if user is not authenticated or is a super admin
    if (!user || user.role?.type === 'super_admin') {
      return next();
    }

    // Apply restrictions for NurseryManager role
    if (user.role?.type === 'nursery_manager') {
      const userNurseryId = user.assignedNursery?.id;
      
      if (!userNurseryId) {
        return ctx.forbidden('No nursery assigned to user');
      }

      // Extract content type from the request
      const contentType = ctx.request.url.split('/')[3]; // /api/content-types/...
      
      // Apply nursery-specific filtering for protected content types
      if (['newsletters', 'gallery-images', 'events'].includes(contentType)) {
        
        // For GET requests, filter by nursery
        if (ctx.request.method === 'GET') {
          ctx.query.filters = {
            ...ctx.query.filters,
            nursery: { id: { $eq: userNurseryId } }
          };
        }
        
        // For POST/PUT requests, ensure nursery field matches user's assigned nursery
        if (['POST', 'PUT'].includes(ctx.request.method)) {
          if (ctx.request.body.data) {
            // Enforce nursery assignment
            ctx.request.body.data.nursery = userNurseryId;
            
            // If trying to modify existing content, verify ownership
            if (ctx.request.method === 'PUT') {
              const entityId = ctx.params.id;
              const entity = await strapi.entityService.findOne(
                `api::${contentType.slice(0, -1)}.${contentType.slice(0, -1)}`,
                entityId,
                { populate: ['nursery'] }
              );
              
              if (entity?.nursery?.id !== userNurseryId) {
                return ctx.forbidden('Access denied to this content');
              }
            }
          }
        }
        
        // For DELETE requests, verify ownership
        if (ctx.request.method === 'DELETE') {
          const entityId = ctx.params.id;
          const entity = await strapi.entityService.findOne(
            `api::${contentType.slice(0, -1)}.${contentType.slice(0, -1)}`,
            entityId,
            { populate: ['nursery'] }
          );
          
          if (entity?.nursery?.id !== userNurseryId) {
            return ctx.forbidden('Access denied to this content');
          }
        }
      }
      
      // Restrict nursery access - users can only view their assigned nursery
      if (contentType === 'nurseries') {
        if (ctx.request.method === 'GET' && !ctx.params.id) {
          // Filter list to only show assigned nursery
          ctx.query.filters = {
            ...ctx.query.filters,
            id: { $eq: userNurseryId }
          };
        } else if (ctx.params.id && parseInt(ctx.params.id) !== userNurseryId) {
          return ctx.forbidden('Access denied to this nursery');
        }
        
        // Prevent creation/modification of nurseries
        if (['POST', 'PUT', 'DELETE'].includes(ctx.request.method)) {
          return ctx.forbidden('Nursery modification not allowed');
        }
      }
    }

    await next();
  };
};