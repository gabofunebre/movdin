import axios from "axios";
export const api = axios.create({ baseURL: "http://localhost:8000" });
export const getAccounts = () => api.get("/accounts").then(r=>r.data);
export const getBalances = () => api.get("/balances").then(r=>r.data);
export const getTxs = (p:{from_?:string; to?:string; account_id?:number}) =>
  api.get("/transactions",{ params:p }).then(r=>r.data);
export const createTx = (body:any) => api.post("/transactions", body).then(r=>r.data);
export const createAccount = (body:any)=> api.post("/accounts", body).then(r=>r.data);
