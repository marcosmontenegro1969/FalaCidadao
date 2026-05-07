// src/pages/PainelPublico.jsx

import { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CityContext } from "../context/CityContext";
import { useAppearance } from "../context/AppearanceContext.jsx";
import { CITY_THEMES } from "../theme/cities";
import { getDemandas } from "../storage/demandasStorage";
import { normalizarDemandas } from "../services/demandasActions";
import { CATEGORIAS_DEMANDAS_COM_TODAS } from "../constants/categoriasDemandas";
import PrimaryButton from "../components/PrimaryButton";
import BackButton from "../components/BackButton";


const STATUSES = [
  "Todos",
  "Em análise",
  "Encaminhada",
  "Resposta contestada",
  "Resolvida",
  "Encerrada",
];

const AUTH_KEY = "falaCidadao.auth";

const SCOPES_VALIDOS = ["minhas", "cidade", "todas"];

function getScopeFromSearch(search) {
  const params = new URLSearchParams(search);
  const aba = params.get("aba");

  return SCOPES_VALIDOS.includes(aba) ? aba : null;
}

const ORDENACOES_VALIDAS = ["recentes", "proximas"];

function getOrdenacaoFromSearch(search) {
  const params = new URLSearchParams(search);
  const ordem = params.get("ordem");

  return ORDENACOES_VALIDAS.includes(ordem) ? ordem : null;
}

function getAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      id: parsed.id || parsed.userId || parsed.email || null,
      nome: parsed.nome || parsed.name || parsed.displayName || null,
      email: parsed.email || null,
    };
  } catch {
    return null;
  }
}

function statusBadgeClass(status, appearance = "dark") {
  const isLight = appearance === "light";

  if (isLight) {
    switch (status) {
      case "Em análise":
        return "bg-amber-100 text-amber-800 border border-amber-400";
      case "Encaminhada":
        return "bg-sky-100 text-sky-800 border border-sky-400";
      case "Resposta contestada":
        return "bg-orange-100 text-orange-800 border border-orange-400";
      case "Resolvida":
        return "bg-emerald-100 text-emerald-800 border border-emerald-400";
      case "Encerrada":
        return "bg-violet-100 text-violet-800 border border-violet-400";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-400";
    }
  }

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

function categoryBadgeClass(appearance = "dark") {
  if (appearance === "light") {
    return "bg-white text-slate-800 border border-slate-300 shadow-sm";
  }

  return "bg-slate-950/80 text-slate-100 border border-white/10";
}

function formatarResumoEngajamento(totalReforcos, totalAtualizacoes) {
  const reforcoLabel = totalReforcos === 1 ? "reforço" : "reforços";

  const atualizacaoLabel =
    totalAtualizacoes === 1 ? "atualização" : "atualizações";

  return `${totalReforcos} ${reforcoLabel} • ${totalAtualizacoes} ${atualizacaoLabel}`;
}

export default function PainelPublico() {
  const navigate = useNavigate();
  const { city } = useContext(CityContext);
  const { appearance } = useAppearance();
  const isLight = appearance === "light";  
  const theme = CITY_THEMES[city] ?? CITY_THEMES.default;
  const location = useLocation();

  const initialScope =
    getScopeFromSearch(location.search) ||
    (location.state?.view === "todas" ? "todas" : "cidade");

  const [scope, setScope] = useState(initialScope); // "minhas" | "cidade" | "todas"
  const [categoria, setCategoria] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [demandasBase, setDemandasBase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordenacao, setOrdenacao] = useState(
  getOrdenacaoFromSearch(location.search) || "recentes"
);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  function alterarScope(nextScope) {
  if (!SCOPES_VALIDOS.includes(nextScope)) return;

  setScope(nextScope);

  const params = new URLSearchParams(location.search);
  params.set("aba", nextScope);

  navigate(
    {
      pathname: "/painel",
      search: `?${params.toString()}`,
    },
    { replace: true }
  );
}

  function alterarOrdenacao(nextOrdenacao) {
    if (!ORDENACOES_VALIDAS.includes(nextOrdenacao)) return;

    setOrdenacao(nextOrdenacao);

    const params = new URLSearchParams(location.search);
    params.set("aba", scope);
    params.set("ordem", nextOrdenacao);

    navigate(
      {
        pathname: "/painel",
        search: `?${params.toString()}`,
      },
      { replace: true }
    );
  }

  const authUser = getAuthUser();
  const currentUserId = authUser?.id || null;
  const isAutenticado = !!currentUserId;

  const panelBoxClass = isLight
    ? "rounded-2xl border border-slate-300/80 bg-white/75 p-4 space-y-4 shadow-sm shadow-slate-900/5"
    : "rounded-2xl border border-white/10 bg-surfaceLight/40 p-4 space-y-4 shadow-sm shadow-black/20";

  const segmentedGroupClass = isLight
    ? "inline-flex rounded-lg border border-slate-300 bg-white/70 overflow-hidden"
    : "inline-flex rounded-lg border border-white/10 bg-surface/60 overflow-hidden";

  const segmentedActiveClass = isLight
    ? "bg-primary/15 text-textmain font-semibold"
    : "bg-primary/20 text-white font-semibold";

  const segmentedInactiveClass = isLight
    ? "bg-transparent text-textmuted hover:bg-white/80"
    : "bg-transparent text-textmuted hover:bg-white/10";

  const demandCardClass = isLight
    ? "rounded-2xl border border-slate-300/80 bg-white/80 p-4 shadow-sm shadow-slate-900/5 transition hover:border-primary/40 hover:shadow-md"
    : "rounded-2xl border border-white/10 bg-surfaceLight/45 p-4 shadow-sm shadow-black/20 transition hover:border-primary/40 hover:bg-surfaceLight/60";

  const subtleButtonClass = isLight
    ? "px-3 py-2 rounded-lg border border-slate-300 bg-white/70 text-xs text-textmain hover:bg-white hover:border-primary/30 transition"
    : "px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-textmain hover:bg-white/10 hover:border-primary/30 transition";

  const emptyStateClass = isLight
    ? "rounded-2xl border border-slate-300/80 bg-white/80 p-6 shadow-sm shadow-slate-900/5"
    : "rounded-2xl border border-white/10 bg-surfaceLight/30 p-6";

  useEffect(() => {
    const load = () => {
      const data = normalizarDemandas(getDemandas());
      setDemandasBase(data);
      setLoading(false);
    };

    load();

    window.addEventListener("falaCidadao:demandas_updated", load);
    return () => window.removeEventListener("falaCidadao:demandas_updated", load);
  }, []);

  async function solicitarLocalizacaoUsuario() {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return null;
    }

    setLocationStatus("loading");

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setUserLocation(coords);
          setLocationStatus("granted");
          resolve(coords);
        },
        () => {
          setLocationStatus("denied");
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }

  useEffect(() => {
  if (ordenacao !== "proximas") return;
  if (userLocation) return;
  if (locationStatus !== "idle") return;

  solicitarLocalizacaoUsuario();
}, [ordenacao, userLocation, locationStatus]);

  const demandasFiltradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const cidadeDaDemanda = (d) => d.cidadeRelato || d.cidade;

    return demandasBase.filter((d) => {
      if (scope === "cidade" && cidadeDaDemanda(d) !== city) return false;

      if (scope === "minhas") {
        if (!isAutenticado) return false;

        const donoDaDemanda = d.autorId || d.userId || null;
        if (donoDaDemanda !== currentUserId) return false;
      }

      if (categoria !== "Todas" && d.categoria !== categoria) return false;
      if (status !== "Todos" && d.status !== status) return false;

      if (!q) return true;

      const haystack = `${d.id} ${d.bairro} ${d.categoria} ${d.descricao}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [scope, categoria, status, busca, city, demandasBase, isAutenticado, currentUserId]);
    function toRad(value) {
      return (value * Math.PI) / 180;
    }

    function calcDistanceInKm(lat1, lng1, lat2, lng2) {
      if (
        !Number.isFinite(lat1) ||
        !Number.isFinite(lng1) ||
        !Number.isFinite(lat2) ||
        !Number.isFinite(lng2)
      ) {
        return null;
      }

      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    
    const demandasExibidas = useMemo(() => {
      const lista = [...demandasFiltradas];

      const sortByRecentes = (a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      };

    const listaComDistancia =
      userLocation &&
      Number.isFinite(userLocation.lat) &&
      Number.isFinite(userLocation.lng)
        ? lista.map((d) => {
            const lat = d.enderecoDetectado?.lat ?? null;
            const lng = d.enderecoDetectado?.lng ?? null;

            return {
              ...d,
              _distanceKm: calcDistanceInKm(
                userLocation.lat,
                userLocation.lng,
                lat,
                lng
              ),
            };
          })
        : lista;

    if (ordenacao === "proximas" && userLocation) {
      return listaComDistancia.sort((a, b) => {
        const aHasDistance = a._distanceKm !== null;
        const bHasDistance = b._distanceKm !== null;

        if (aHasDistance && bHasDistance) {
          if (a._distanceKm !== b._distanceKm) {
            return a._distanceKm - b._distanceKm;
          }
          return sortByRecentes(a, b);
        }

        if (aHasDistance && !bHasDistance) return -1;
        if (!aHasDistance && bHasDistance) return 1;

        return sortByRecentes(a, b);
      });
    }

    return listaComDistancia.sort(sortByRecentes);
    }, [demandasFiltradas, ordenacao, userLocation]);

    function formatDistance(distanceKm) {
      if (!Number.isFinite(distanceKm)) return null;

      if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m de você`;
      }

      return `${distanceKm.toFixed(1).replace(".", ",")} km de você`;
    }

  function formatElapsedTime(createdAt) {
    const createdDate = new Date(createdAt);
    const now = new Date();

    if (Number.isNaN(createdDate.getTime())) return null;

    const diffMs = now.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "hoje";
    if (diffDays === 1) return "há 1 dia";
    if (diffDays < 30) return `há ${diffDays} dias`;

    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths === 1) return "há cerca de 1 mês";
    if (diffMonths < 12) return `há cerca de ${diffMonths} meses`;

    const diffYears = Math.floor(diffDays / 365);

    if (diffYears === 1) return "há cerca de 1 ano";
    return `há cerca de ${diffYears} anos`;
  }    
    
  return (
    <section className="flex-1 w-full">
      <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Cabeçalho */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold">Painel Público</h1>

            <span className="text-xs px-2 py-1 rounded-full border border-borderSubtle bg-overlay text-textsoft">
              {demandasExibidas.length} resultado(s)
            </span>
            
            <div className="flex flex-wrap items-center gap-2">
              <PrimaryButton onClick={() => navigate("/registrar")} intense>
                Registrar um problema
              </PrimaryButton>

              <BackButton to="/" />
            </div>

          </div>

          <p className="text-textsoft">
            Acompanhe as demandas registradas pela população e o andamento das respostas do poder público.
          </p>
        </div>

        {/* Barra de filtros */}
        <div className={panelBoxClass}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-textmuted">Visualização:</span>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-textmuted">Ordenar por:</span>

            <div className={segmentedGroupClass}>
                <button
                  type="button"
                  onClick={() => alterarOrdenacao("recentes")}
                  className={`px-3 py-2 text-sm transition ${
                    ordenacao === "recentes"
                      ? segmentedActiveClass
                      : segmentedInactiveClass
                  }`}
                >
                  Mais recentes
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    alterarOrdenacao("proximas");

                    if (!userLocation) {
                      await solicitarLocalizacaoUsuario();
                    }
                  }}
                  className={`px-3 py-2 text-sm transition ${
                    ordenacao === "proximas"
                      ? segmentedActiveClass
                      : segmentedInactiveClass
                  }`}
                >
                  Mais próximas
                </button>
              </div>

              <span className="text-[11px] text-textmuted">
                (MVP: proximidade usará sua localização no dispositivo.)
              </span>
            </div>
          </div>

          {ordenacao === "proximas" && locationStatus === "loading" && (
            <p className="text-[11px] text-textmuted">
              Obtendo sua localização...
            </p>
          )}

          {ordenacao === "proximas" && locationStatus === "denied" && (
            <p className="text-[11px] text-amber-300">
              Não foi possível acessar sua localização. Mantivemos a ordenação padrão.
            </p>
          )}

          {ordenacao === "proximas" && locationStatus === "unavailable" && (
            <p className="text-[11px] text-amber-300">
              Este dispositivo ou navegador não oferece suporte à geolocalização.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <div className={segmentedGroupClass}>
              <button
                type="button"
                onClick={() => alterarScope("minhas")}
                className={`px-3 py-2 text-sm transition ${
                  scope === "minhas"
                  ? "bg-primary/15 text-textmain font-semibold"
                  : "bg-transparent text-textmuted hover:bg-overlayHover"
                }`}
              >
                Suas demandas
              </button>

              <button
                type="button"
                onClick={() => alterarScope("cidade")}
                className={`px-3 py-2 text-sm transition ${
                  scope === "cidade"
                    ? segmentedActiveClass
                    : segmentedInactiveClass
                }`}
              >
                Nesta cidade
              </button>

              <button
                type="button"
                onClick={() => alterarScope("todas")}
                className={`px-3 py-2 text-sm transition ${
                  scope === "todas"
                    ? segmentedActiveClass
                    : segmentedInactiveClass
                }`}
              >
                Todas
              </button>
            </div>

            <span className="text-[11px] text-textmuted">
              {scope === "minhas" &&
                "Exibe apenas as demandas criadas pelo usuário autenticado."}

              {scope === "cidade" &&
                `Exibe as demandas da cidade em foco: ${
                  theme.cidadeShort ?? theme.cidade ?? city
                }.`}

              {scope === "todas" &&
                "Exibe demandas de todas as cidades cadastradas no Fala Cidadão."}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-textmuted">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-surface text-textmain border border-textmuted/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                {CATEGORIAS_DEMANDAS_COM_TODAS.map((c) => (
                  <option key={c} value={c} className="bg-surface text-textmain">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-textmuted">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-surface text-textmain border border-textmuted/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-surface text-textmain">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-textmuted">Buscar</label>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Ex.: Boa Viagem, buraco, iluminação..."
                className="w-full bg-surface text-textmain border border-textmuted/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                alterarScope("cidade");
                setCategoria("Todas");
                setStatus("Todos");
                setBusca("");
              }}
              className={subtleButtonClass}
            >
              Limpar filtros
            </button>
          </div>
        </div>

        {/* Lista (cards) */}
        {loading ? (
          <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 p-6">
            <p className="text-textsoft">Carregando demandas...</p>
          </div>
        ) : demandasExibidas.length === 0 ? (
          <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 p-6">
            <p className="text-textsoft">
              Nenhuma demanda encontrada com os filtros atuais. Tente ajustar categoria, status ou busca.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {demandasExibidas.map((d) => {
              const bairroExibido = d.enderecoDetectado?.bairro || d.bairro || "";
              const totalReforcos = Number(d.totalReforcos ?? d.reforcos?.length ?? 0);
              const totalAtualizacoes = Number(d.totalAtualizacoes ?? d.atualizacoes?.length ?? 0);
              return (
                <article
                  key={d.id}
                  className={demandCardClass}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${categoryBadgeClass(appearance)}`}>
                        {d.categoria}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadgeClass(d.status, appearance)}`}>
                        {d.status}
                      </span>
                      <span className="text-xs text-textmuted">
                        {bairroExibido} ·{" "}
                        {CITY_THEMES[d.cidadeRelato || d.cidade]?.cidadeShort ?? (d.cidadeRelato || d.cidade)}

                        {formatElapsedTime(d.createdAt) && (
                          <>
                            {" "}·{" "}
                            <span className="text-textmuted">
                              {formatElapsedTime(d.createdAt)}
                            </span>
                          </>
                        )}

                        {Number.isFinite(d._distanceKm) && (
                          <>
                            {" "}·{" "}
                            <span className="text-emerald-300/90">
                              {formatDistance(d._distanceKm)}
                            </span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="text-xs text-textmuted">
                      <span className="border border-borderSubtle bg-overlay px-2 py-0.5 rounded-full">
                        {d.id}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm text-textmuted font-medium">
                    {formatarResumoEngajamento(totalReforcos, totalAtualizacoes)}
                  </p>
                  <p className="mt-3 text-textmain">{d.descricao}</p>

                  {/* Rodapé do card: metadata + miniaturas + botão */}
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                    {/* ESQUERDA: data + (opcional) miniaturas */}
                    <div className="flex flex-wrap items-end gap-3">
                      <span className="text-xs text-textmuted">
                        Registrada em: {d.createdAt}
                        {(() => {
                          const donoDaDemanda = d.autorId || d.userId || null;
                          return isAutenticado && donoDaDemanda === currentUserId;
                        })() && (
                          <span className="ml-2 text-emerald-300/90">• sua demanda</span>
                        )}
                      </span>

                      {/* MINIATURAS (até 3), não clicáveis */}
                      {Array.isArray(d.fotos) && d.fotos.length > 0 && (
                        <div className="flex items-center gap-2">
                          {d.fotos.slice(0, 3).map((src, idx) => {
                            const isLocal = typeof src === "string" && src.startsWith("local:");

                            return isLocal ? (
                              <div
                                key={`${d.id}-foto-${idx}`}
                                className="h-14 w-14 rounded-md border border-borderSubtle bg-overlay flex items-center justify-center text-[10px] text-textmuted px-1 text-center"
                                title={src.replace("local:", "")}
                              >
                                Anexo
                              </div>
                            ) : (
                              <img
                                key={`${d.id}-foto-${idx}`}
                                src={src}
                                alt={`Evidência ${idx + 1} da demanda ${d.id}`}
                                className="h-14 w-14 rounded-md object-cover border border-borderSubtle"
                                loading="lazy"
                                draggable={false}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* DIREITA: CTA */}
                    <button
                      type="button"
                      className={subtleButtonClass}
                      onClick={() => navigate(`/painel/${d.id}?aba=${scope}&ordem=${ordenacao}`)}
                    >
                      Ver detalhes
                    </button>
                  </div>
                </article>
              );
          })}
          </div>
        )}
      </div>
    </section>
  );
}
