// src/components/DevLocalStoragePanel.jsx

import { useMemo, useState } from "react";
import { resetDemandasMock } from "../storage/demandasStorage";

const LOCAL_STORAGE_LIMIT_BYTES = 5 * 1024 * 1024; // referência aproximada: 5 MB

function calcularUsoLocalStorage() {
  let totalBytes = 0;

  for (let i = 0; i < localStorage.length; i += 1) {
    const chave = localStorage.key(i);
    const valor = localStorage.getItem(chave) || "";

    totalBytes += new Blob([chave]).size;
    totalBytes += new Blob([valor]).size;
  }

  return totalBytes;
}

function formatarBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default function DevLocalStoragePanel() {
  const [aberto, setAberto] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);

  const uso = useMemo(() => {
    const bytesUsados = calcularUsoLocalStorage();
    const percentual = (bytesUsados / LOCAL_STORAGE_LIMIT_BYTES) * 100;

    return {
      bytesUsados,
      percentual,
      textoUso: formatarBytes(bytesUsados),
      textoLimite: formatarBytes(LOCAL_STORAGE_LIMIT_BYTES),
    };
  }, [atualizacao]);

  function restaurarEstadoInicial() {
    const ok = window.confirm(
      "Restaurar estado inicial do protótipo?\n\n" +
        "- Demandas mockadas serão restauradas;\n" +
        "- O usuário será desconectado;\n" +
        "- As preferências do usuário serão mantidas."
    );

    if (!ok) return;

    resetDemandasMock();
    localStorage.removeItem("falaCidadao.auth");

    setAtualizacao((valorAtual) => valorAtual + 1);

    window.location.reload();
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] print:hidden">
      {aberto && (
        <div className="mb-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-xl">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold">Ferramentas de desenvolvimento</p>
              <p className="mt-1 text-xs text-slate-500">
                Visível apenas durante o desenvolvimento.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAberto(false)}
              className="
                inline-flex h-7 w-7 items-center justify-center rounded-full
                border border-slate-200 bg-white text-slate-400 shadow-sm
                transition
                hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700
                focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
              "              
              title="Fechar"
              aria-label="Fechar painel de desenvolvimento"
            >
              ×
            </button>
          </div>

          <div className="mb-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              LocalStorage
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {uso.textoUso} / {uso.textoLimite}
            </p>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-700"
                style={{
                  width: `${Math.min(uso.percentual, 100)}%`,
                }}
              />
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {uso.percentual.toFixed(2)}% usado
            </p>
          </div>

          <button
            type="button"
            onClick={restaurarEstadoInicial}
            className="w-full rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            Restaurar estado inicial
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setAberto((valorAtual) => !valorAtual)}
        className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-slate-800"
        title={`LocalStorage: ${uso.percentual.toFixed(2)}% usado`}
        >
        <span>Dev</span>
        <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[11px]">
            {uso.percentual.toFixed(2)}%
        </span>
      </button>
    </div>
  );
}