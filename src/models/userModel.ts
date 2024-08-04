import { Client } from "@elastic/elasticsearch";
import { client } from "../configs/elasticsearchConfig";

export interface iUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  access_token: string;
}

export type iUserInfo = Pick<iUser, "name" | "email" | "role">;
/**
 * Base class to handle ElasticSearch interaction
 */
export abstract class UserAbstract {
  protected client = client;

  setClient(client: Client) {
    this.client = client;
    return this;
  }
  protected async createUser(user: iUser): Promise<any> {
    return await this.client.index({
      index: "users",
      id: user.id,
      document: user,
    });
  }

  async getUserById(id: string, source?: string[]): Promise<iUser | undefined> {
    const result = await this.client.get({
      index: "users",
      id,
      _source: source,
    });
    return result._source as iUser;
  }

  async searchUser(matchParams: {}, source?: string[]): Promise<iUserInfo[]> {
    const { hits } = await this.client.search({
      index: "users",
      body: {
        query: {
          match: matchParams,
        },
      },
      _source: source,
    });
    return hits.hits.map((hit: any) => hit._source as iUserInfo);
  }

  protected async searchUserField(
    matchParams: {},
    source?: string[]
  ): Promise<iUserInfo[]> {
    const { hits } = await this.client.search({
      index: "users",
      body: {
        query: {
          match_phrase: matchParams,
        },
      },
      _source: source,
    });
    return hits.hits.map((hit: any) => hit._source as iUserInfo);
  }

  protected async updateUser(
    id: string,
    userData: Partial<iUser>
  ): Promise<void> {
    await this.client.update({
      index: "users",
      id,
      doc: userData,
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete({ index: "users", id });
  }
}
