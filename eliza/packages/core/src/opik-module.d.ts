declare module 'opik' {
  export class Opik {
    constructor(config?: {
      apiKey?: string;
      projectName?: string;
      workspaceName?: string;
    });
    trace(opts: { name: string; input?: Record<string, unknown> }): {
      update(u: { output?: Record<string, unknown> }): unknown;
      end(): unknown;
    };
  }
}
