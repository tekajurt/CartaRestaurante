declare module "better-sqlite3" {
  interface Database {
    prepare(sql: string): Statement;
    exec(sql: string): Database;
    pragma(pragma: string): any;
    close(): void;
  }

  interface Statement {
    run(...params: any[]): RunResult;
    get(...params: any[]): any;
    all(...params: any[]): any[];
  }

  interface RunResult {
    changes: number;
    lastID: number;
  }

  class Database {
    constructor(filename: string, options?: any);
    prepare(sql: string): Statement;
    exec(sql: string): Database;
    pragma(pragma: string): any;
    close(): void;
  }

  export default Database;
}
