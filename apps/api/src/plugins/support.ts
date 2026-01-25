import fp from "fastify-plugin";

export type SupportPluginOptions = object;

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(
  async (fastify) => {
    fastify.decorate("someSupport", function () {
      return "hugs";
    });
  },
  {
    name: "support",
  },
);

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    someSupport(): string;
  }
}
