import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    client: '@hey-api/client-fetch',
    input: '../backend/swagger-spec.json',
    output: 'api',
    plugins: ['@tanstack/react-query']
});
