import {FastifyInstance} from "fastify";

async function translationRoutes (fastify: FastifyInstance) {
    fastify.get('/', async (request, reply) => {
        return { hello: 'world' }
    })
}

export default translationRoutes;
