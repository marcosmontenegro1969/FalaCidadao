// src/pages/Home.jsx

import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDemandas } from "../storage/demandasStorage";
import { ThemeContext } from "../context/ThemeContext";
import { CITY_THEMES } from "../theme/cities";

import PrimaryButton from "../components/PrimaryButton";
import SecondaryActionButton from "../components/SecondaryActionButton";
import CameraCaptureModal from "../components/CameraCaptureModal";
import { fileToDataUrl } from "../utils/fileToDataUrl";
import DicaCidadaCard from "../components/DicaCidadaCard";

const PRE_LOGIN_DRAFT_KEY = "falaCidadao.preLoginDraft";

function formatarResumoEngajamento(totalReforcos, totalAtualizacoes) {
  const reforcoLabel = totalReforcos === 1 ? "reforço" : "reforços";

  const atualizacaoLabel =
    totalAtualizacoes === 1 ? "atualização" : "atualizações";

  return `${totalReforcos} ${reforcoLabel} • ${totalAtualizacoes} ${atualizacaoLabel}`;
}



function statusBadgeClass(status) {
  switch (status) {
    case "Em análise":
      return "bg-amber-500/10 text-amber-300 border border-amber-500/40";
    case "Encaminhada":
      return "bg-sky-500/10 text-sky-300 border border-sky-500/40";
    case "Resposta contestada":
      return "bg-orange-500/10 text-orange-300 border border-orange-500/40";
    case "Resolvida":
      return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40";
    case "Encerrada":
      return "bg-violet-500/10 text-violet-300 border border-violet-500/40";
    default:
      return "bg-slate-500/10 text-slate-200 border border-slate-500/30";
  }
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
  const [preLoginCameraOpen, setPreLoginCameraOpen] = useState(false);
  const [preLoginDraftReady, setPreLoginDraftReady] = useState(false);
  
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

  async function handlePreLoginCapture({ file, meta }) {
    try {
      const fotoDataUrl = await fileToDataUrl(file);

      const draft = {
        origem: "captura_pre_login",
        createdAt: new Date().toISOString(),
        foto: {
          dataUrl: fotoDataUrl,
          name: file.name || "captura-pre-login.jpg",
          type: file.type || "image/jpeg",
          size: file.size || null,
          lastModified: file.lastModified || Date.now(),
        },
        meta: {
          key:
            meta.key ||
            `${file.name || "captura"}__${file.size || 0}__${
              file.lastModified || Date.now()
            }`,
          name: meta.name || file.name || "captura-pre-login.jpg",
          size: meta.size || file.size || null,
          lastModified: meta.lastModified || file.lastModified || Date.now(),
          lat: meta.lat,
          lng: meta.lng,
          takenAt:
            meta?.takenAt instanceof Date
              ? meta.takenAt.toISOString()
              : meta?.takenAt || new Date().toISOString(),
          source: meta.source || "browser_capture",
          accuracy: meta.accuracy ?? null,
        },
        localRelato: {
          lat: meta.lat,
          lng: meta.lng,
          source: meta.source || "browser_capture",
        },
      };

      sessionStorage.setItem(PRE_LOGIN_DRAFT_KEY, JSON.stringify(draft));

      setPreLoginCameraOpen(false);
      setPreLoginDraftReady(true);
    } catch (error) {
      console.error(error);
      setPreLoginCameraOpen(false);
      alert("Não foi possível salvar a foto capturada. Tente novamente.");
    }
  }

  return (
    <>
      <section
        className="bg-hero hero-wrapper home-hero home-theme-dark flex-1 flex items-center text-white"
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

            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              Registre problemas onde eles acontecem, acompanhe o andamento das demandas e veja o que já foi resolvido
              na sua cidade — tudo em um painel transparente.
            </p>

            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                onClick={() => {
                  if (authUser) {
                    navigate("/registrar");
                    return;
                  }

                  setPreLoginCameraOpen(true);
                }}
                intense
              >
                Registrar um problema
              </PrimaryButton>
            </div>
            <DicaCidadaCard />
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-sm p-4 space-y-4 text-sm text-white shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between">
              <span className="font-medium">Demandas recentes</span>
              <span className="text-xs text-slate-300">Visualização pública</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-3">
                {demandasResumo.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-white">
                    Ainda não há demandas recentes para esta cidade.
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Assim que novos registros aparecerem, eles serão exibidos aqui.
                  </p>
                </div>
                ) : (
                  demandasResumo.map((d) => {
                    const bairroExibido = d.enderecoDetectado?.bairro || d.bairro || "";
                    const totalReforcos = Number(d.totalReforcos ?? d.reforcos?.length ?? 0);
                    const totalAtualizacoes = Number(d.totalAtualizacoes ?? d.atualizacoes?.length ?? 0);
                    const statusBadge = statusBadgeClass(d.status);

                    return (
                        <div
                          key={d.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/painel/${d.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              navigate(`/painel/${d.id}`);
                            }
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-white/10 hover:border-accent/40 transition"
                          title="Ver detalhes da demanda"
                        >
                        <div className="flex items-center justify-between text-xs mb-1 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-slate-300 truncate">
                              {d.categoria}
                            </span>

                            <span className="text-[11px] text-slate-400 truncate">
                              {d.id}
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge}`}>
                            {d.status}
                          </span>

                          <span className="text-slate-400 truncate">
                            {bairroExibido || (d.cidadeRelatoLabel || d.cidadeRelato || d.cidade)}
                          </span>
                        </div>                      
                        <p className="text-xs sm:text-sm text-slate-300 font-medium">
                          {formatarResumoEngajamento(totalReforcos, totalAtualizacoes)}
                        </p>
                        <p className="text-white line-clamp-2">
                          {d.descricao}
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

      {preLoginDraftReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-surfaceLight bg-surface p-5 shadow-xl space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-textmain">
                Foto capturada
              </h2>

              <p className="text-sm text-textsoft leading-relaxed">
                Foto capturada. Agora entre no Fala Cidadão para concluir o registro e enviar ao responsável.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <PrimaryButton
                onClick={() => navigate("/entrar?redirect=/registrar&draft=prelogin")}
                intense
              >
                Entrar para continuar
              </PrimaryButton>

              <SecondaryActionButton
                onClick={() => {
                  sessionStorage.removeItem(PRE_LOGIN_DRAFT_KEY);
                  setPreLoginDraftReady(false);
                }}
              >
                Cancelar
              </SecondaryActionButton>
            </div>
          </div>
        </div>
      )}

      <CameraCaptureModal
        open={preLoginCameraOpen}
        onClose={() => setPreLoginCameraOpen(false)}
        onCapture={handlePreLoginCapture}
        showToast={() => {}}
      />
    </>
  );
}