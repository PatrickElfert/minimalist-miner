"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function translationRoutes(fastify) {
    fastify.get('/', async (request, reply) => {
        return { hello: 'world' };
    });
}
exports.default = translationRoutes;
