// src/pages/ComoFunciona.jsx

import PulseButton from "../components/PulseButton";
import SecondaryActionButton from "../components/SecondaryActionButton";
import { useNavigate } from "react-router-dom";

export default function ComoFunciona() {

  const navigate = useNavigate();
  
  return (
    <section className="flex-1 w-full">
      <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-10 md:space-y-12">
        {/* HERO institucional */}
        <header className="rounded-2xl border border-borderSubtle bg-surfaceLight/20 p-6 md:p-8 space-y-4">
          <p className="text-lg text-accent font-medium">
            Entenda como sua participação gera Impacto Coletivo
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold">
            Como funciona o Fala Cidadão
          </h1>

          <p className="text-textsoft max-w-3xl leading-relaxed">
            O Fala Cidadão é uma plataforma criada para organizar problemas urbanos
            que impactam a rotina da população e dar visibilidade coletiva a essas
            situações. Mais do que registrar reclamações individuais, o sistema fortalece
            demandas por meio da participação da comunidade e do acompanhamento
            transparente das respostas.
          </p>

          <p className="text-lg font-medium leading-relaxed">
            O Fala Cidadão não organiza reclamações isoladas. Ele organiza <span className="text-textmain font-semibold">Impacto Coletivo</span>.
            <span className="text-textmain"> O objetivo é transformar experiências dispersas em prioridade pública rastreável.</span>
          </p>
        </header>

        {/* Fluxo de funcionamento */}
         <section className="space-y-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl font-semibold">
              Fluxo de funcionamento
            </h2>

            <p className="text-sm text-textmuted">
              Uma visão direta do ciclo completo: do registro à resposta.
            </p>
          </div>

          {/* Etapa 01 */}
          <div className="rounded-2xl border border-sky-400/30 bg-surfaceLight/20 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-sky-400">01</span>
              <h3 className="text-lg font-semibold">Escolha da cidade</h3>
            </div>

            <p className="text-sm text-textsoft leading-relaxed">
              O cidadão seleciona a cidade em que deseja visualizar ou registrar
              demandas. Todas as informações exibidas no sistema respeitam o
              contexto da cidade escolhida.
            </p>
          </div>

          {/* Etapa 02 */}
          <div className="rounded-2xl border border-sky-400/30 bg-surfaceLight/20 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-sky-400">02</span>
              <h3 className="text-lg font-semibold">Registro do problema</h3>
            </div>

            <p className="text-sm text-textsoft leading-relaxed">
              O cidadão descreve o problema, informa a localização e adiciona
              evidências visuais quando disponíveis.
            </p>

            <p className="text-sm text-textsoft leading-relaxed">
              Antes de criar uma nova demanda, o sistema verifica se já existe um
              problema semelhante, evitando duplicidade e fortalecendo registros
              já existentes.
            </p>
          </div>

          {/* Etapa 03 */}
          <div className="rounded-2xl border border-emerald-400/30 bg-surfaceLight/20 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-emerald-400">03</span>
              <h3 className="text-lg font-semibold">Validação coletiva</h3>
            </div>

            <p className="text-sm text-textsoft leading-relaxed">
              Outros cidadãos podem confirmar que o mesmo problema também afeta sua
              rotina.
            </p>

            <p className="text-sm text-textsoft leading-relaxed">
              Cada confirmação representa um reforço público da demanda, indicando
              que o problema não é isolado.
            </p>
          </div>

          {/* Etapa 04 */}
          <div className="rounded-2xl border border-emerald-400/30 bg-surfaceLight/20 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-emerald-400">04</span>
              <h3 className="text-lg font-semibold">Impacto Coletivo</h3>
            </div>

            <p className="text-sm text-textsoft leading-relaxed">
              O sistema consolida as confirmações em um indicador chamado{" "}
              <span className="font-medium text-textmain">Impacto Coletivo</span>.
            </p>

            <p className="text-sm text-textsoft leading-relaxed">
              Esse indicador expressa o grau de prioridade da demanda e orienta
              sua visibilidade, organização e acompanhamento dentro do sistema.
            </p>
          </div>

          {/* Etapa 05 */}
          <div className="rounded-2xl border border-amber-500/30 bg-surfaceLight/20 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-amber-400">05</span>
              <h3 className="text-lg font-semibold">Acompanhamento e resposta</h3>
            </div>

            <p className="text-sm text-textsoft leading-relaxed">
              Cada demanda possui histórico público, identificação do responsável
              pelo atendimento e espaço para registro das manifestações recebidas.
            </p>

            <p className="text-sm text-textsoft leading-relaxed">
              Quando uma demanda é encaminhada, o contato ocorre{" "}
              <span className="font-medium text-amber-300">em nome do Fala Cidadão</span>,
              sempre referenciando o cidadão — ou grupo de cidadãos — que registrou e
              confirmou o problema. Essa abordagem permite que o sistema acompanhe cada manifestação,
              registre respostas e mantenha transparência e rastreabilidade ao longo
              do tempo.
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
          <div className="rounded-2xl border border-borderSubtle bg-surfaceLight/10 p-5 space-y-3">
            <h3 className="text-lg font-semibold">Quem pode responder às demandas</h3>

            <p className="text-sm text-textsoft leading-relaxed">
              As demandas registradas no Fala Cidadão podem ser direcionadas a órgãos
              públicos, concessionárias de serviços, empresas prestadoras de serviço
              ou entidades responsáveis por questões urbanas, ambientais e de
              infraestrutura.
            </p>

            <p className="text-sm text-textsoft leading-relaxed">
              Sempre que a atuação — ou ausência dela — impactar a rotina da população.
            </p>
          </div>

          {/* Sobre o MVP */}
          <div className="rounded-2xl border border-borderSubtle bg-surfaceLight/5 p-5 space-y-3">
            <h3 className="text-lg font-semibold">Sobre o estágio atual do sistema</h3>

            <p className="text-sm text-textsoft leading-relaxed">
              O Fala Cidadão está em fase de MVP (Produto Mínimo Viável).
            </p>

            <p className="text-sm text-textsoft leading-relaxed">
              Nesta etapa, o foco está em organizar informações, validar o fluxo do
              sistema, fortalecer a participação coletiva e garantir clareza e
              transparência.
            </p>

            <p className="text-[12px] text-textmuted">
              Funcionalidades mais avançadas fazem parte da visão futura e serão
              implementadas de forma gradual.
            </p>
          </div>
        </section>
        {/* CTA de continuidade */}
        <section className="rounded-2xl border border-surfaceLight bg-surfaceLight/15 p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-semibold">
            Próximo passo
          </h2>

          <p className="text-sm text-textsoft max-w-2xl">
            Agora que você entende como o Fala Cidadão funciona, escolha como deseja
            participar.
          </p>

          <div className="flex flex-wrap gap-4">
            <PulseButton onClick={() => navigate("/registrar")} intense>
              Registrar um problema
            </PulseButton>

            <SecondaryActionButton onClick={() => navigate("/painel")}>
              Acompanhar demandas da cidade
            </SecondaryActionButton>
          </div>
        </section>
      </div>
    </section>
  );
}
