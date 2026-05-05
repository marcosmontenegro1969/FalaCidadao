// src/pages/ComoFunciona.jsx

import PrimaryButton from "../components/PrimaryButton";
import SecondaryActionButton from "../components/SecondaryActionButton";
import { useNavigate } from "react-router-dom";
import { useAppearance } from "../context/AppearanceContext.jsx";

export default function ComoFunciona() {
  const navigate = useNavigate();

  const { appearance } = useAppearance();
  const isLight = appearance === "light";

  const heroCardClass = isLight
    ? "rounded-2xl border border-slate-300/80 bg-white/80 p-6 md:p-8 space-y-4 shadow-sm shadow-slate-900/5"
    : "rounded-2xl border border-white/10 bg-surfaceLight/20 p-6 md:p-8 space-y-4 shadow-sm shadow-black/20";

  const stepCardClass = isLight
    ? "rounded-2xl border border-slate-300/80 bg-white/80 p-5 space-y-3 shadow-sm shadow-slate-900/5"
    : "rounded-2xl border border-white/10 bg-surfaceLight/20 p-5 space-y-3 shadow-sm shadow-black/20";

  const infoCardClass = isLight
    ? "rounded-2xl border border-slate-300/80 bg-white/80 p-5 space-y-3 shadow-sm shadow-slate-900/5"
    : "rounded-2xl border border-white/10 bg-surfaceLight/15 p-5 space-y-3 shadow-sm shadow-black/20";

  const ctaCardClass = isLight
    ? "rounded-2xl border border-slate-300/80 bg-white/85 p-6 md:p-8 space-y-4 shadow-sm shadow-slate-900/5"
    : "rounded-2xl border border-white/10 bg-surfaceLight/15 p-6 md:p-8 space-y-4 shadow-sm shadow-black/20";

  const blueStepNumberClass = isLight
    ? "text-2xl font-semibold text-sky-700"
    : "text-2xl font-semibold text-sky-400";

  const greenStepNumberClass = isLight
    ? "text-2xl font-semibold text-emerald-700"
    : "text-2xl font-semibold text-emerald-400";

  const amberStepNumberClass = isLight
    ? "text-2xl font-semibold text-amber-700"
    : "text-2xl font-semibold text-amber-400";

  const amberInlineTextClass = isLight
    ? "font-medium text-amber-700"
    : "font-medium text-amber-300";

  return (
    <section className="flex-1 w-full">
      <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-10 md:space-y-12">
        {/* HERO institucional */}
        <header className={heroCardClass}>
          <p className="text-lg text-accent font-medium">
            Entenda como sua participação gera Impacto Coletivo
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold">
            Como funciona o Fala Cidadão
          </h1>

          <p className="text-textsoft max-w-3xl leading-relaxed">
            O Fala Cidadão é uma plataforma para registrar, organizar e acompanhar
            problemas urbanos que afetam a rotina da população. Em vez de tratar
            cada reclamação como um caso isolado, o sistema conecta evidências,
            localização, recorrência e reforço coletivo.
          </p>

          <p className="text-lg font-medium leading-relaxed">
            O objetivo é transformar relatos dispersos em{" "}
            <span className="text-textmain font-semibold">
              prioridade pública visível, organizada e rastreável
            </span>.
          </p>
        </header>

        {/* Fluxo de funcionamento */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl font-semibold">Fluxo de funcionamento</h2>

            <p className="text-sm text-textmuted">
              Uma visão direta do ciclo completo: do registro à resposta.
            </p>
          </div>

          {/* Etapa 01 */}
          <div className={stepCardClass}>
            <div className="flex items-center gap-3">
              <span className={blueStepNumberClass}>01</span>
              <h3 className="text-lg font-semibold">Escolha da cidade</h3>
            </div>

            <p className="text-sm text-textsoft leading-relaxed">
              O cidadão seleciona a cidade em que deseja visualizar ou registrar
              demandas. Todas as informações exibidas no sistema respeitam o
              contexto da cidade escolhida.
            </p>
          </div>

          {/* Etapa 02 */}
          <div className={stepCardClass}>
            <div className="flex items-center gap-3">
              <span className={blueStepNumberClass}>02</span>
              <h3 className="text-lg font-semibold">Registro com evidência</h3>
            </div>

            <p className="text-sm text-textsoft leading-relaxed">
              O cidadão registra o problema a partir de fotos tiradas no local.
              O sistema utiliza essas evidências para identificar a localização
              do relato e iniciar a análise do caso. Antes de criar uma nova demanda, o sistema verifica se já existe
              um problema semelhante, reduzindo duplicidade e fortalecendo
              registros já existentes.
            </p>
          </div>

          {/* Etapa 03 */}
          <div className={stepCardClass}>
            <div className="flex items-center gap-3">
              <span className={greenStepNumberClass}>03</span>
              <h3 className="text-lg font-semibold">Reforço coletivo</h3>
            </div>

            <p className="text-sm text-textsoft leading-relaxed">
              Outros cidadãos podem reforçar uma demanda já registrada quando
              aquele mesmo problema também afeta sua rotina.
              Cada reforço mostra que a situação não é isolada e amplia a força
              pública daquela ocorrência dentro do sistema.
            </p>
          </div>

          {/* Etapa 04 */}
          <div className={stepCardClass}>
            <div className="flex items-center gap-3">
              <span className={greenStepNumberClass}>04</span>
              <h3 className="text-lg font-semibold">Impacto Coletivo</h3>
            </div>

            <p className="text-sm text-textsoft leading-relaxed">
              O sistema consolida os reforços em um indicador chamado{" "}
              <span className="font-medium text-textmain">Impacto Coletivo</span>.
              Esse indicador expressa o grau de prioridade da demanda e orienta
              sua visibilidade, organização e acompanhamento dentro da plataforma.
            </p>
          </div>

          {/* Etapa 05 */}
          <div className={stepCardClass}>
            <div className="flex items-center gap-3">
              <span className={amberStepNumberClass}>05</span>
              <h3 className="text-lg font-semibold">Acompanhamento e resposta</h3>
            </div>

            <p className="text-sm text-textsoft leading-relaxed">
              Cada demanda reúne informações públicas do caso, seu andamento
              dentro da plataforma e os registros de encaminhamento e retorno
              recebidos.
              Quando uma demanda é encaminhada, o contato ocorre{" "}
              <span className={amberInlineTextClass}>
                em nome do Fala Cidadão
              </span>
              , sempre referenciando o cidadão — ou grupo de cidadãos — ligado
              àquele problema. Isso permite organizar respostas e manter
              rastreabilidade ao longo do tempo.
            </p>
          </div>
        </section>

        {/* Informações institucionais */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl font-semibold">
              Informações institucionais
            </h2>

            <p className="text-sm text-textmuted">
              Contexto, escopo e transparência sobre o estágio do sistema.
            </p>
          </div>

          {/* Quem pode responder */}
          <div className={infoCardClass}>
            <h3 className="text-lg font-semibold">
              Quem pode responder às demandas
            </h3>

            <p className="text-sm text-textsoft leading-relaxed">
              As demandas registradas no Fala Cidadão podem ser direcionadas a
              órgãos públicos, concessionárias, autarquias, empresas contratadas
              pelo poder público ou outras entidades responsáveis por questões
              urbanas, ambientais e de infraestrutura.
              Sempre que sua atuação — ou ausência dela — impactar a rotina da
              população.
            </p>
          </div>

          {/* Sobre o MVP */}
          <div className={infoCardClass}>
            <h3 className="text-lg font-semibold">
              Sobre o estágio atual do sistema
            </h3>

            <p className="text-sm text-textsoft leading-relaxed">
              O Fala Cidadão está em fase de MVP (Produto Mínimo Viável).
            </p>

            <p className="text-sm text-textsoft leading-relaxed">
              Nesta etapa, o foco está em validar o fluxo principal da
              plataforma, organizar informações, fortalecer a participação
              coletiva e garantir clareza sobre o acompanhamento das demandas.
            </p>

            <p className="text-[12px] text-textmuted">
              Funcionalidades mais avançadas fazem parte da visão futura e serão
              implementadas de forma gradual, incluindo recursos de apoio inteligente
              para ajudar o cidadão a organizar melhor seu relato.
            </p>
          </div>
        </section>

        {/* CTA de continuidade */}
        <section className={ctaCardClass}>
          <h2 className="text-xl font-semibold">Próximo passo</h2>

          <p className="text-sm text-textsoft max-w-2xl">
            Agora que você entende como o Fala Cidadão funciona, escolha como
            deseja participar.
          </p>

          <div className="flex flex-wrap gap-4">
            <PrimaryButton onClick={() => navigate("/registrar")} intense>
              Registrar um problema
            </PrimaryButton>

            <SecondaryActionButton onClick={() => navigate("/painel")}>
              Acompanhar demandas da cidade
            </SecondaryActionButton>
          </div>
        </section>
      </div>
    </section>
  );
}