import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccounts, getBalances, getTxs, createTx } from "./lib/api";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Filters = { from_?: string; to?: string; account_id?: number };
const schema = z.object({
  date: z.string(),
  description: z.string().optional(),
  amount: z.preprocess(Number, z.number()),
  notes: z.string().optional(),
  account_id: z.preprocess(Number, z.number()),
});
type TxForm = z.infer<typeof schema>;

export default function App() {
  const [filters, setFilters] = useState<Filters>({});
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
  const { data: balances = {} } = useQuery({ queryKey: ["balances"], queryFn: getBalances });
  const { data: txs = [] } = useQuery({
    queryKey: ["txs", filters],
    queryFn: () => getTxs(filters),
  });

  const { register, handleSubmit, reset } = useForm<TxForm>();

  const onSubmit = handleSubmit(async (data) => {
    const parsed = schema.parse(data);
    await createTx(parsed);
    qc.invalidateQueries({ queryKey: ["txs"] });
    qc.invalidateQueries({ queryKey: ["balances"] });
    reset();
    setShowForm(false);
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">movdin</h1>

      <div>
        <h2 className="font-semibold">Cuentas</h2>
        <ul>
          {accounts.map((a: any) => (
            <li key={a.id} className="flex justify-between">
              <span>{a.name}</span>
              <span>{balances[a.name]?.toFixed(2) ?? "0.00"}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Filtros</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="date"
            className="border p-1"
            value={filters.from_ ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, from_: e.target.value }))}
          />
          <input
            type="date"
            className="border p-1"
            value={filters.to ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          />
          <select
            className="border p-1"
            value={filters.account_id ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, account_id: e.target.value ? Number(e.target.value) : undefined }))
            }
          >
            <option value="">Todas</option>
            {accounts.map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="bg-blue-500 text-white px-2"
            onClick={() => setShowForm(true)}
          >
            + Movimiento
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="border p-2 space-y-2 max-w-md">
          <input className="border p-1 w-full" type="date" {...register("date")} />
          <input className="border p-1 w-full" placeholder="Descripción" {...register("description")} />
          <input className="border p-1 w-full" type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
          <select className="border p-1 w-full" {...register("account_id", { valueAsNumber: true })}>
            {accounts.map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <input className="border p-1 w-full" placeholder="Notas" {...register("notes")} />
          <div className="flex gap-2">
            <button className="bg-green-500 text-white px-2" type="submit">
              Guardar
            </button>
            <button
              className="bg-gray-300 px-2"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div>
        <h2 className="font-semibold">Movimientos</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-1">Fecha</th>
              <th className="p-1">Descripción</th>
              <th className="p-1">Monto</th>
              <th className="p-1">Cuenta</th>
              <th className="p-1">Notas</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="p-1">{t.date}</td>
                <td className="p-1">{t.description}</td>
                <td className={`p-1 ${t.amount >= 0 ? "text-green-600" : "text-red-600"}`}>{t.amount}</td>
                <td className="p-1">{accounts.find((a: any) => a.id === t.account_id)?.name}</td>
                <td className="p-1">{t.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
