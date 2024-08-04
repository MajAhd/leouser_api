import { Client } from "@elastic/elasticsearch";

export const client = new Client({
  node: process.env.ELASTIC_NODE || "http://localhost:9200",
  // Elastic Authentication is disabled for development
  // auth: {
  //   apiKey: {
  //     id: "elastic",
  //     api_key: "api_key",
  //   },
  // },
});

export const initElastic = async () => {
  try {
    await client.ping();

    const exists = await client.indices.exists({ index: "users" });
    if (!exists) {
      await client.indices.create({ index: "users" });
    }
    console.info(`
      > Elasticsearch indexes Initialized successfully      
     `);
  } catch (error) {
    console.error("Elasticsearch initializing error:", error);
  }
};
