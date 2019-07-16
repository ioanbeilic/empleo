import { defaultLimit, defaultPage, PaginatedResponse, PaginationOptions } from 'empleo-nestjs-common';
import { Server } from 'http';
import querystring from 'querystring';
import supertest, { Response, Test } from 'supertest';

export interface IdentifierOptions {
  identifier: any;
}

export type Payload = string | object | undefined;

export interface PayloadOptions<T extends Payload = undefined> {
  payload: T;
}

export interface ApiOptions {
  server: Server;
  endpoint?: string;
  token?: string;
}

export class Api<ResponseBody, CreatePayload extends Payload = undefined, UpdatePayload extends Payload = CreatePayload> {
  protected server: Server;
  protected endpoint: string;
  protected token: string | undefined;

  constructor({ server, endpoint = '/', token }: ApiOptions) {
    this.server = server;
    this.endpoint = endpoint.replace(/\/+$/, '');
    this.token = token;
  }

  private get hasToken() {
    return typeof this.token === 'string';
  }

  getClient() {
    return supertest(this.server);
  }

  create({ payload }: PayloadOptions<CreatePayload>): TypedTest<ResponseBody, CreatePayload> {
    return this.post(this.uri({})).send(payload);
  }

  find({ page = defaultPage, limit = defaultLimit }: PaginationOptions = {}): TypedTest<PaginatedResponse<ResponseBody>> {
    return this.get(this.uri({ query: { page, limit } }));
  }

  findOne<T extends IdentifierOptions>({ identifier }: T): TypedTest<ResponseBody> {
    return this.get(this.uri({ path: identifier }));
  }

  removeOne<T extends IdentifierOptions>({ identifier }: T): TypedTest {
    return this.delete(this.uri({ path: identifier }));
  }

  updateOne<T extends IdentifierOptions & PayloadOptions<UpdatePayload>>(options: T): TypedTest<ResponseBody, UpdatePayload> {
    return this.patch(this.uri({ path: options.identifier })).send(options.payload);
  }

  overrideOne<T extends IdentifierOptions & PayloadOptions<CreatePayload>>(options: T): TypedTest<ResponseBody, CreatePayload> {
    return this.put(this.uri({ path: options.identifier })).send(options.payload);
  }

  protected post(uri: string) {
    return this.callMethod({ uri, method: 'post' });
  }

  protected get(uri: string) {
    return this.callMethod({ uri, method: 'get' });
  }

  protected delete(uri: string) {
    return this.callMethod({ uri, method: 'delete' });
  }

  protected patch(uri: string) {
    return this.callMethod({ uri, method: 'patch' });
  }

  protected put(uri: string) {
    return this.callMethod({ uri, method: 'put' });
  }

  protected head(uri: string) {
    return this.callMethod({ uri, method: 'head' });
  }

  protected uri({ path, query, absolute = false }: { path?: string | number; query?: object; absolute?: boolean }): string {
    const uriQuery = querystring.stringify(query);

    path = path ? String(path).replace(/^\/+|\/+$/g, '') : '';

    const uri = absolute ? '' : this.endpoint;

    return path ? `${uri}/${path}?${uriQuery}` : `${uri}?${uriQuery}`;
  }

  private callMethod({ method, uri }: { method: 'post' | 'get' | 'delete' | 'put' | 'patch' | 'head'; uri: string }): TypedTest<any, any> {
    let client = this.getClient()[method](uri) as TypedTest;

    if (this.hasToken) {
      client = client.set('Authorization', `Bearer ${this.token}`);
    }

    client.body = function(this: TypedTest) {
      return this.then(response => response.body);
    };

    client.expectJson = function(this: TypedTest, statusCode: number) {
      return this.expect(statusCode).expect('content-type', /application\/json/);
    };

    return client;
  }
}

export interface TypedResponse<Body> extends Response {
  body: Body;
}

export interface TypedTest<ResponseBody = void, RequestPayload extends Payload = undefined> extends Test {
  send(data?: RequestPayload): this;

  then<TResult1, TResult2 = never>(
    onFulfilled?: ((value: TypedResponse<ResponseBody>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onRejected?: ((reason: Error) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2>;

  body(): Promise<ResponseBody>;

  expectJson(statusCode: number): TypedTest<ResponseBody, RequestPayload>;
}
