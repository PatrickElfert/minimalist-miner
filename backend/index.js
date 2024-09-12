"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const translationRoutes_1 = __importDefault(require("./translationRoutes"));
const fastify = (0, fastify_1.default)({
    logger: true
});
fastify.register(translationRoutes_1.default);
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
