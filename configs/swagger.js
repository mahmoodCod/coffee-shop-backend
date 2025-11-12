const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const configSwagger = (app) => {
  const swaggerDocument = swaggerJsDoc({
    swaggerDefinition: {
      openapi: "3.0.1",
      info: {
        title: "Coffee Shop API",
        description:
          "Coffee Shop e-commerce platform APIs with Node.js + Express.js + MongoDB",
        version: "1.0.0",
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}`,
        },
      ],
    },
    apis: ["./routes/**/*.js", "./server.js"],
  });

  const swagger = swaggerUi.setup(swaggerDocument, {});
  app.use("/api-docs", swaggerUi.serve, swagger);
};

module.exports = configSwagger;

