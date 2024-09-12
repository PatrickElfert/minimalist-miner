import Fastify from 'fastify'
import translationRoutes from "./translationRoutes";

const fastify = Fastify({
    logger: true
})

fastify.register(translationRoutes)

const start = async () => {
    try {
        await fastify.listen({ port: 3000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()
