declare module "https://sql.js.org/dist/sql-wasm.js" {
  import type initSqlJs from "sql.js";
  const initSqlJsExport: typeof initSqlJs;
  export default initSqlJsExport;
}
