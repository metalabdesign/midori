// flow-typed signature: f79f47f89e73f15ebabe067df47b1e73
// flow-typed version: <<STUB>>/cookies_v0.7.1/flow_v0.66.0

/**
 * This is an autogenerated libdef stub for:
 *
 *   'cookies'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

declare module 'cookies' {
  import type {IncomingMessage, ServerResponse} from 'http';
  declare class Cookies {
    constructor(req: IncomingMessage, res: ServerResponse, options?: null | {
      secure?: boolean,
      keys: Array<string>,
    }): void;
    get(
      name: string,
      options?: {
        signed?: boolean,
      },
    ): ?string;
    set(
      name: string,
      value?: string,
      options?: {
        maxAge?: number,
        expires?: Date,
        path?: string,
        domain?: string,
        secure?: boolean,
        httpOnly?: boolean,
        sameSite?: boolean | 'strict' | 'lax',
        signed?: boolean,
        overwrite?: boolean,
      },
    ): void;
  }
  declare module.exports: Class<Cookies>;
}
