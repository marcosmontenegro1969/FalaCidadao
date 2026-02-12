// src/pages/DetalheDemanda.jsx

import { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { CITY_THEMES } from "../theme/cities";
import { getDemandas } from "../storage/demandasStorage";
import ImpactoColetivoBox from "../components/ImpactoColetivoBox";
import EvidenceGrid from "../components/EvidenceGrid";
import BackButton from "../components/BackButton";

const CURRENT_USER_ID = "cidadao_001";

function statusBadgeClass(status) {
  switch (status) {
    case "Em análise":
      return "bg-amber-500/10 text-amber-300 border border-amber-500/40";
    case "Em andamento":
      return "bg-sky-500/10 text-sky-300 border border-sky-500/40";
    case "Resolvido":
      return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40";
    default:
      return "bg-slate-500/10 text-slate-200 border border-slate-500/30";
  }
}

function tipoBadge(tipo) {
  switch (tipo) {
    case "sistema":
      return "bg-slate-500/10 text-slate-200 border border-slate-500/30";
    case "orgao":
      return "bg-fuchsia-500/10 text-fuchsia-200 border border-fuchsia-500/30";
    default:
      return "bg-slate-500/10 text-slate-200 border border-slate-500/30";
  }
}

function ModalFoto({ open, fotos, index, onClose, onPrev, onNext }) {
  if (!open) return null;

  const hasFotos = Array.isArray(fotos) && fotos.length > 0;
  const src = hasFotos ? fotos[index] : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização de foto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl rounded-2xl border border-borderSubtle bg-surface/90 backdrop-blur p-3 md:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="text-xs text-textsoft">
            Evidência {hasFotos ? index + 1 : 0} de{" "}
            {hasFotos ? fotos.length : 0}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-borderSubtle text-xs text-textmain bg-overlay hover:bg-overlayHover transition"
          >
            Fechar
          </button>
        </div>

        <div className="rounded-xl overflow-hidden border border-borderSubtle bg-overlay flex items-center justify-center min-h-[240px]">
          {src ? (
            <img
              src={src}
              alt={`Evidência ${index + 1}`}
              className="w-full h-full object-contain"
              loading="eager"
            />
          ) : (
            <div className="text-sm text-textmuted p-6">
              Nenhuma evidência fotográfica disponível.
            </div>
          )}
        </div>

        {hasFotos && fotos.length > 1 && (
          <div className="flex items-center justify-between gap-2 mt-3">
            <button
              type="button"
              onClick={onPrev}
              className="px-3 py-2 rounded-lg border border-borderSubtle text-xs text-textmain bg-overlay hover:bg-overlayHover transition"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={onNext}
              className="px-3 py-2 rounded-lg border border-borderSubtle text-xs text-textmain bg-overlay hover:bg-overlayHover transition"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetalheDemanda() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mantemos ThemeContext apenas para manter consistência global (se necessário).
  // Porém, a tela prioriza SEMPRE a cidade da demanda.
  useContext(ThemeContext);

  const [demandasBase, setDemandasBase] = useState([]);

  useEffect(() => {
    const load = () => setDemandasBase(getDemandas());
    load();

    window.addEventListener("falaCidadao:demandas_updated", load);
    return () =>
      window.removeEventListener("falaCidadao:demandas_updated", load);
  }, []);

  const demanda = useMemo(
    () => demandasBase.find((d) => d.id === id),
    [demandasBase, id]
  );

  // Impacto da demanda
  const confirmacoes = demanda?.impacto?.confirmacoes ?? 0;
  const ultimaConfirmacao = demanda?.impacto?.ultimaConfirmacao ?? null;

  // Modal de foto
  const [modalOpen, setModalOpen] = useState(false);
  const [fotoIndex, setFotoIndex] = useState(0);

  if (!demanda) {
    return (
      <section className="flex-1 w-full">
        <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Demanda não encontrada
          </h1>
          <p className="text-textsoft">
            Não localizamos a demanda{" "}
            <span className="text-textmain">{id}</span>.
          </p>
          <BackButton to="/" />
        </div>
      </section>
    );
  }

  const podeAnexar = demanda.userId === CURRENT_USER_ID;
  const cityTheme = CITY_THEMES[demanda.cidade] ?? CITY_THEMES.default;

  const orgaoExibicao = demanda.orgao?.nome
    ? demanda.orgao.nome
    : "Triagem Fala Cidadão (MVP)";

  const orgaoDetalhe = demanda.orgao?.email
    ? `Contato: ${demanda.orgao.email}`
    : "Sem encaminhamento automático nesta etapa do MVP.";

  const fotos = Array.isArray(demanda.fotos) ? demanda.fotos : [];

  const fotosPublicas = fotos.filter(
    (src) => typeof src === "string" && !src.startsWith("local:")
  );

  const anexosPendentes = fotos.filter(
    (src) => typeof src === "string" && src.startsWith("local:")
  );

  function openModalAt(idx) {
    setFotoIndex(idx);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function prevFoto() {
    if (!fotosPublicas.length) return;
    setFotoIndex((i) => (i - 1 + fotosPublicas.length) % fotosPublicas.length);
  }

  function nextFoto() {
    if (!fotosPublicas.length) return;
    setFotoIndex((i) => (i + 1) % fotosPublicas.length);
  }

  function enviarNovasFotos() {
    alert(
      "MVP: nesta etapa, apenas o autor pode anexar evidências. Em breve: envio com validação do moderador."
    );
  }

  return (
    <section className="flex-1 w-full">
      <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Header da página */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Detalhes da Demanda
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-full border border-borderSubtle bg-overlay text-textmain">
                {demanda.id}
              </span>

              <span
                className={`px-2 py-1 rounded-full ${statusBadgeClass(
                  demanda.status
                )}`}
              >
                {demanda.status}
              </span>

              <span className="px-2 py-1 rounded-full border border-surfaceLight text-textmuted">
                Cidade:{" "}
                <span className="text-textmain">
                  {cityTheme.cidadeShort ?? cityTheme.name}
                </span>
              </span>
            </div>
          </div>
<         BackButton to="/" />
        </div>

        {/* Card principal (resumo) */}
        <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 backdrop-blur-sm p-5 space-y-4">

          {/* Header do box */}
          <div className="flex flex-col gap-3">

            {/* Linha 1 — Título + Categoria + Código */}
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold shrink-0">
                Resumo da demanda
              </h2>

              <span className="px-2 py-1 rounded-full bg-overlay text-textmain border border-borderSubtle text-xs">
                {demanda.categoria}
              </span>
            </div>

            {/* Linha 2 — Localização */}
            <div className="text-textmuted text-sm space-y-1">
              <div>
                {demanda.bairro} · {cityTheme.cidadeShort ?? demanda.cidade}
              </div>

              {demanda.rua ? (
                <div className="text-xs text-textsoft">
                  Endereço: <span className="text-textmain">{demanda.rua}</span>
                </div>
              ) : null}

              {demanda.pontoReferencia ? (
                <div className="text-xs text-textsoft">
                  Ponto de referência:{" "}
                  <span className="text-textmain">{demanda.pontoReferencia}</span>
                </div>
              ) : null}
            </div>

          </div>

          {/* Descrição */}
          <p className="text-textmain leading-relaxed">
            {demanda.descricao}
          </p>
        </div>

        {/* Galeria (evidências) */}
        <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/15 p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Evidências</h2>
              <span className="text-xs text-textmuted">
                {fotosPublicas.length
                  ? `${fotosPublicas.length} foto(s)`
                  : "Sem fotos no MVP"}
              </span>
            </div>

            {podeAnexar ? (
              <button
                type="button"
                onClick={enviarNovasFotos}
                className="px-3 py-2 rounded-lg border border-surfaceLight text-xs text-textmain hover:bg-surfaceLight/40 transition"
              >
                Adicionar evidências
              </button>
            ) : (
              <span className="text-[11px] text-textmuted">
                (MVP) Só o autor pode anexar
              </span>
            )}
          </div>

          {fotosPublicas.length ? (
          <EvidenceGrid
            fotos={fotosPublicas}
            onClickFoto={openModalAt}
          />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-textmuted">
                Esta demanda não possui fotos publicadas no mock.
              </p>

              {anexosPendentes.length ? (
                <div className="rounded-xl border border-borderSubtle bg-overlay p-3">
                  <p className="text-xs text-textsoft mb-2">
                    Anexos enviados (pendentes de validação/publicação):
                  </p>

                  <ul className="space-y-1 text-xs text-textmuted">
                    {anexosPendentes.map((src, idx) => (
                      <li
                        key={`${src}-${idx}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          {src.replace("local:", "")}
                        </span>
                        <span className="px-2 py-0.5 rounded-full border border-borderSubtle bg-overlay text-textmuted">
                          Pendente
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-[11px] text-textmuted mt-2">
                    (MVP) Como estamos sem backend, estes anexos ficam
                    registrados como “local:” no LocalStorage.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Impacto Coletivo */}
        <ImpactoColetivoBox
          confirmacoes={confirmacoes}
          ultimaConfirmacao={ultimaConfirmacao}
        />

        {/* Histórico */}
        <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Histórico</h2>
          {Array.isArray(demanda.historico) && demanda.historico.length ? (
            <div className="space-y-3">
              {demanda.historico.map((h, idx) => (
                <div
                  key={`${h.data}-${idx}`}
                  className="rounded-xl border border-borderSubtle bg-overlay p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-textmuted">{h.data}</span>
                    {h.tipo && (
                      <span
                        className={`px-2 py-0.5 rounded-full ${tipoBadge(
                          h.tipo
                        )}`}
                      >
                        {h.tipo === "sistema" ? "Sistema" : "Responsável"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-textmain">{h.evento}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-textmuted">
              Sem eventos registrados no histórico ainda.
            </p>
          )}

          <p className="text-[11px] text-textmuted">
            Próximo passo (MVP): quando chegar uma resposta (por e-mail ou registro no sistema), ela entra no
            histórico e também no bloco de “Resposta do responsável”.
          </p>
        </div>

        {/* Responsável pelo atendimento */}
        <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/15 p-5 space-y-3">
          <h2 className="text-lg font-semibold">
            Responsável pelo atendimento
          </h2>

          <p className="text-sm text-textmain">
            {orgaoExibicao}
          </p>

          <p className="text-sm text-textsoft leading-relaxed">
            Este responsável é o destinatário das informações organizadas pelo Fala Cidadão para análise e eventual manifestação sobre a demanda registrada.
          </p>

          <p className="text-[11px] text-textmuted">
            {orgaoDetalhe}
          </p>
        </div>

        {/* Resposta do responsável */}
        <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 p-5 space-y-3">
          <h2 className="text-lg font-semibold">Resposta do responsável</h2>

          {Array.isArray(demanda.respostaOrgao) && demanda.respostaOrgao.length ? (
            <>
              <p className="text-sm text-textmuted">
                Abaixo estão registradas as manifestações recebidas do responsável pelo atendimento desta demanda.
              </p>

              <div className="space-y-3">
                {demanda.respostaOrgao.map((r, idx) => (
                  <div
                    key={`${r.data}-${idx}`}
                    className="rounded-xl border border-borderSubtle bg-overlay p-3 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-textmuted">{r.data}</span>

                      {r.protocolo ? (
                        <span className="px-2 py-0.5 rounded-full bg-overlay text-textmain border border-borderSubtle">
                          {r.protocolo}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full border border-borderSubtle bg-overlay text-textmuted">
                          Sem protocolo
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-textmain leading-relaxed">{r.mensagem}</p>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-textmuted">
                As respostas podem conter posicionamentos oficiais, prazos estimados, números de protocolo e atualizações de andamento.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-textmuted">
                Aguardando manifestação do responsável pelo atendimento.
              </p>

              <div className="rounded-xl border border-borderSubtle bg-overlay p-3 space-y-2">
                <p className="text-sm text-textsoft leading-relaxed">
                  Quando uma resposta é enviada por e-mail ou registrada pelo sistema, ela pode ser registrada aqui
                  com data e protocolo para manter transparência e histórico público.
                </p>

                <p className="text-[11px] text-textmuted">
                  Este MVP ainda não realiza o encaminhamento automático, mas a estrutura já está pronta para registrar e dar transparência às respostas.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de foto */}
      <ModalFoto
        open={modalOpen}
        fotos={fotosPublicas}
        index={fotoIndex}
        onClose={closeModal}
        onPrev={prevFoto}
        onNext={nextFoto}
      />
    </section>
  );
}
