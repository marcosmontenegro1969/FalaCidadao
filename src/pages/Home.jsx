// src/pages/Home.jsx

import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDemandas } from "../storage/demandasStorage";
import { ThemeContext } from "../context/ThemeContext";
import { CITY_THEMES } from "../theme/cities";

import PulseButton from "../components/PulseButton";
import SecondaryActionButton from "../components/SecondaryActionButton";

function formatarResumoEngajamento(totalImpulsionamentos, totalAtualizacoes) {
  const impulsionamentoLabel =
    totalImpulsionamentos === 1 ? "impulsionamento" : "impulsionamentos";

  const atualizacaoLabel =
    totalAtualizacoes === 1 ? "atualização" : "atualizações";

  return `${totalImpulsionamentos} ${impulsionamentoLabel} • ${totalAtualizacoes} ${atualizacaoLabel}`;
}

export default function Home() {
  const navigate = useNavigate();
  const { city } = useContext(ThemeContext);
  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("falaCidadao.auth");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const theme = CITY_THEMES[city] ?? CITY_THEMES.default;
  const bgUrl = theme.backgroundImage ?? CITY_THEMES.default.backgroundImage;
  const [demandasHome, setDemandasHome] = useState([]);
  
  useEffect(() => {
    const data = getDemandas();
    setDemandasHome(data);
  }, []);

  const demandasResumo = useMemo(() => {
    const lista = [...demandasHome];

    return lista
      .filter((d) => {
        const cidadeDaDemanda = d.cidadeRelato || d.cidade;
        if (cidadeDaDemanda !== city) return false;
        if (d.status === "Resolvido") return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 2);
  }, [demandasHome, city]);

  return (
    <section
      className="bg-hero hero-wrapper flex-1 flex items-center"
      style={{ backgroundImage: `url('${bgUrl}')` }}
    >
      <div className="hero-wrapper-inner w-full max-w-5xl mx-auto px-4 py-16 md:py-20 grid md:grid-cols-[1.2fr,1fr] gap-10 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Projeto piloto · Cidades da Região Metropolitana
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Um canal simples para o cidadão falar sobre sua cidade — e o poder público responder.
          </h1>

          <p className="text-textsoft text-sm md:text-base leading-relaxed">
            Registre problemas onde eles acontecem, acompanhe o andamento das demandas e veja o que já foi resolvido
            na sua cidade — tudo em um painel transparente.
          </p>

          <div className="flex flex-wrap gap-3">
            {authUser ? (
              <PulseButton onClick={() => navigate("/registrar")} intense>
                Registrar um problema
              </PulseButton>
            ) : (
              <PulseButton onClick={() => navigate("/entrar")} intense>
                Entrar para registrar
              </PulseButton>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-borderSubtle bg-surfaceLight/80 backdrop-blur-sm p-4 space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">Demandas recentes</span>
            <span className="text-xs text-textmuted">Visualização pública</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-3">
              {demandasResumo.length === 0 ? (
                <div className="rounded-xl border border-borderSubtle bg-overlay p-3">
                  <p className="text-textmain">
                    Ainda não há demandas recentes para esta cidade.
                  </p>
                  <p className="text-xs text-textmuted mt-1">
                    Assim que novos registros aparecerem, eles serão exibidos aqui.
                  </p>
                </div>
              ) : (
                demandasResumo.map((d) => {
                  const bairroExibido = d.enderecoDetectado?.bairro || d.bairro || "";
                  const totalImpulsionamentos = Number(d.totalImpulsionamentos ?? d.impulsionamentos?.length ?? 0);
                  const totalAtualizacoes = Number(d.atualizacoes?.length ?? 0);
                  const statusBadge =
                    d.status === "Em análise"
                      ? "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                      : d.status === "Em andamento"
                      ? "bg-sky-500/10 text-sky-300 border border-sky-500/40"
                      : d.status === "Resolvido"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-500/10 text-slate-200 border border-slate-500/30";

                  return (
                    <div
                      key={d.id}
                      className="rounded-xl border border-borderSubtle bg-overlay p-3"
                    >
                      <div className="flex justify-between text-xs mb-1 gap-2">
                        <span className={`px-2 py-0.5 rounded-full ${statusBadge}`}>
                          {d.categoria}
                        </span>
                        <span className="text-textmuted truncate">
                          {bairroExibido || (d.cidadeRelatoLabel || d.cidadeRelato || d.cidade)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-textmuted font-medium">
                        {formatarResumoEngajamento(totalImpulsionamentos, totalAtualizacoes)}
                      </p>
                      <p className="text-textmain line-clamp-2">
                        {d.descricao}
                      </p>

                      <p className="text-xs text-textmuted mt-1">
                        Status: {d.status}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Ver todas as demandas */}
          <SecondaryActionButton
            className="w-full mt-3"
            onClick={() => navigate("/painel")}
          >
            Acompanhar demandas da cidade
          </SecondaryActionButton>
        </div>
      </div>
    </section>
  );
}
