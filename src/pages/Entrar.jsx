// src/pages/Entrar.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { XMarkIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

const AUTH_KEY = "falaCidadao.auth";
const LOGIN_PREFS_KEY = "falaCidadao.loginProviders";
const DEFAULT_PREFS_ICON_CLASS = "h-4 w-4";
const MAX_SOCIAL_PROVIDERS = 3;
const DEFAULT_PROVIDER_IDS = ["google", "facebook", "microsoft"];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function GoogleIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.194 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.962 3.038l5.657-5.657C34.047 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.001 12 24 12c3.059 0 5.842 1.154 7.962 3.038l5.657-5.657C34.047 6.053 29.268 4 24 4c-7.682 0-14.35 4.329-17.694 10.691z" />
      <path fill="#4CAF50" d="M24 44c5.093 0 9.79-1.957 13.326-5.144l-6.152-5.206C29.146 35.252 26.71 36 24 36c-5.169 0-9.613-3.314-11.277-7.946l-6.52 5.024C9.503 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.195-2.234 4.043-4.129 5.35l.003-.002 6.152 5.206C36.9 39.35 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.093 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.492 0-1.956.93-1.956 1.887v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.093 24 18.1 24 12.073z"
      />
    </svg>
  );
}

function MicrosoftIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1V1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13V1z" />
      <path fill="#00A4EF" d="M1 13h10v10H1V13z" />
      <path fill="#FFB900" d="M13 13h10v10H13V13z" />
    </svg>
  );
}

function AppleIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.417 2.13-1.25 2.97-.902.902-1.944 1.422-3.022 1.34-.139-1.095.403-2.257 1.18-3.034.85-.868 2.223-1.492 3.092-1.276zM20.74 17.46c-.486 1.123-.72 1.625-1.345 2.622-.874 1.337-2.101 3.005-3.63 3.022-1.354.017-1.702-.885-3.543-.875-1.84.009-2.223.894-3.577.877-1.529-.017-2.692-1.52-3.568-2.858-2.44-3.724-2.7-8.095-1.19-10.42 1.076-1.65 2.77-2.614 4.36-2.614 1.617 0 2.632.893 3.97.893 1.3 0 2.093-.893 3.966-.893 1.415 0 2.91.772 3.984 2.102-3.499 1.919-2.932 6.916.573 8.144z"
      />
    </svg>
  );
}

function InstagramIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="igGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="35%" stopColor="#FA7E1E" />
          <stop offset="60%" stopColor="#D62976" />
          <stop offset="85%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#igGradient)" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="white" />
    </svg>
  );
}

function XIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
    </svg>
  );
}

const PROVIDERS = {
  google: {
    id: "google",
    label: "Google",
    description: "Mais rápido para Gmail e Android",
    Icon: GoogleIcon,
    prefsIconClass: "h-5 w-5",
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    description: "Boa opção para público amplo",
    Icon: FacebookIcon,
    prefsIconClass: "h-5 w-5",
  },
  microsoft: {
    id: "microsoft",
    label: "Microsoft",
    description: "Outlook, Hotmail e conta escolar",
    Icon: MicrosoftIcon,
    prefsIconClass: "h-4 w-4",
  },
  apple: {
    id: "apple",
    label: "Apple",
    description: "Boa opção para iPhone e iCloud",
    Icon: AppleIcon,
    prefsIconClass: "h-5 w-5",
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    description: "Popular para acesso rápido no celular",
    Icon: InstagramIcon,
    prefsIconClass: "h-6 w-6",
  },
  x: {
    id: "x",
    label: "X (Twitter)",
    description: "Boa opção para quem usa rede social com frequência",
    Icon: XIcon,
    prefsIconClass: "h-4 w-4",
  },
};

function getRedirectSeguro() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");

  return redirect && redirect.startsWith("/") && !redirect.startsWith("//")
    ? redirect
    : "/";
}

function loadProviderPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOGIN_PREFS_KEY));

    if (!Array.isArray(saved)) return DEFAULT_PROVIDER_IDS;

    const validSaved = saved.filter((id) => PROVIDERS[id]);

    return validSaved.length > 0
      ? validSaved.slice(0, MAX_SOCIAL_PROVIDERS)
      : DEFAULT_PROVIDER_IDS;
  } catch {
    return DEFAULT_PROVIDER_IDS;
  }
}

export default function Entrar() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("Usuário Padrão");
  const [email, setEmail] = useState("usuario@falacidadao.com");
  const [erro, setErro] = useState("");
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [selectedProviderIds, setSelectedProviderIds] = useState(DEFAULT_PROVIDER_IDS);

  const nomeRef = useRef(null);
  const emailRef = useRef(null);
  const submitRef = useRef(null);

  const emailOk = useMemo(() => isValidEmail(email.trim()), [email]);

  const selectedProviders = selectedProviderIds
    .map((id) => PROVIDERS[id])
    .filter(Boolean);

  useEffect(() => {
    setSelectedProviderIds(loadProviderPreferences());
  }, []);

  useEffect(() => {
    if (!showEmailLogin) return;

    setTimeout(() => {
      nomeRef.current?.focus();
      nomeRef.current?.select();
    }, 50);
  }, [showEmailLogin]);

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  function finishLogin(payload) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    window.location.href = getRedirectSeguro();
  }

  function handleSocialLogin(provider) {
    setErro("");

    const providerLabel = PROVIDERS[provider]?.label || "Login social";

    const payload = {
      nome: "Usuário Padrão",
      email: `usuario.${provider}@falacidadao.com`,
      role: "cidadao",
      provider,
      authMode: "social-simulado",
      loggedAt: new Date().toISOString(),
    };

    finishLogin(payload);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const emailLimpo = email.trim().toLowerCase();
    const nomeLimpo = nome.trim();

    if (!emailLimpo) {
      setErro("Informe seu email pra liberar sua entrada 🙂");
      return;
    }

    if (!isValidEmail(emailLimpo)) {
      setErro("Esse email parece inválido. Pode informar novamente?");
      return;
    }

    const payload = {
      nome: nomeLimpo || "Cidadão",
      email: emailLimpo,
      role: "cidadao",
      provider: "email",
      authMode: "email-simulado",
      loggedAt: new Date().toISOString(),
    };

    finishLogin(payload);
  }

  function toggleProvider(providerId) {
    setSelectedProviderIds((current) => {
      const alreadySelected = current.includes(providerId);

      if (alreadySelected) {
        const next = current.filter((id) => id !== providerId);

        if (next.length === 0) {
          setErro("Escolha pelo menos uma opção de login social.");
          return current;
        }

        setErro("");
        localStorage.setItem(LOGIN_PREFS_KEY, JSON.stringify(next));
        return next;
      }

      if (current.length >= MAX_SOCIAL_PROVIDERS) {
        setErro("Você pode deixar até 3 opções sociais visíveis na tela.");
        return current;
      }

      const next = [...current, providerId];

      setErro("");
      localStorage.setItem(LOGIN_PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function resetPreferences() {
    setErro("");
    setSelectedProviderIds(DEFAULT_PROVIDER_IDS);
    localStorage.setItem(LOGIN_PREFS_KEY, JSON.stringify(DEFAULT_PROVIDER_IDS));
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;
      handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <section className="flex-1 w-full">
      <div className="w-full max-w-2xl mx-auto px-4 py-10 space-y-6">
        <header className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Acesso rápido
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold">
                Entre no Fala Cidadão
              </h1>
              <p className="text-textsoft">
                Use uma conta que você já tem. É mais rápido e evita criar senha.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-1 inline-flex items-center justify-center rounded-lg border border-surfaceLight p-2 text-textmuted hover:bg-surfaceLight/60 hover:text-textmain transition"
              title="Voltar"
              aria-label="Voltar"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="rounded-3xl border border-primary/30 bg-surfaceLight/25 backdrop-blur-sm p-5 md:p-6 space-y-5 shadow-xl shadow-black/10">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">
              Escolha como quer entrar
            </h2>
            <p className="text-sm text-textsoft">
              Recomendado para registrar e acompanhar suas demandas com menos etapas.
            </p>
          </div>

          <div className="space-y-3">
            {selectedProviders.map((provider, index) => {
              const Icon = provider.Icon;
              const isMain = index === 0;

              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleSocialLogin(provider.id)}
                  className={[
                    "w-full rounded-2xl border px-4 py-4 text-left transition active:scale-[0.99]",
                    isMain
                      ? "border-primary/50 bg-primary text-white hover:opacity-95"
                      : "border-surfaceLight bg-surface hover:bg-surfaceLight/60",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        isMain ? "bg-white text-textmain" : "bg-surfaceLight",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </span>

                    <span className="min-w-0">
                      <span className="block font-semibold">
                        Continuar com {provider.label}
                      </span>
                      <span
                        className={[
                          "block text-xs",
                          isMain ? "text-white/80" : "text-textmuted",
                        ].join(" ")}
                      >
                        {provider.description}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-surfaceLight pt-4">
            <button
              type="button"
              onClick={() => setShowEmailLogin((current) => !current)}
              className="text-sm font-semibold text-textsoft hover:text-textmain hover:underline transition"
            >
              {showEmailLogin
                ? "Ocultar entrada por e-mail"
                : "Prefiro entrar com e-mail do protótipo"}
            </button>
          </div>

          <div className="rounded-2xl border border-surfaceLight bg-surface/60 p-3">
            <button
              type="button"
              onClick={() => setShowCustomize((current) => !current)}
              className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-textsoft hover:text-textmain transition"
            >
              <span className="inline-flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-5 w-5" aria-hidden="true" />
                Personalizar opções de entrada
              </span>
              <span className="text-xs text-textmuted">
                até {MAX_SOCIAL_PROVIDERS}
              </span>
            </button>

            {showCustomize ? (
              <div className="mt-3 space-y-3 border-t border-surfaceLight pt-3">
                <p className="text-xs text-textmuted">
                  Escolha até 3 atalhos sociais para aparecer nesta tela. No MVP, essa preferência fica salva apenas neste navegador.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.values(PROVIDERS).map((provider) => {
                    const checked = selectedProviderIds.includes(provider.id);
                    const Icon = provider.Icon;

                    return (
                      <label
                        key={provider.id}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-surfaceLight bg-surface px-3 py-2 text-sm hover:bg-surfaceLight/40 transition"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProvider(provider.id)}
                          className="h-4 w-4 accent-primary"
                        />
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
                        <Icon className={provider.prefsIconClass || DEFAULT_PREFS_ICON_CLASS} />
                      </span>
                      <span>{provider.label}</span>
                      </label>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={resetPreferences}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Restaurar opções recomendadas
                </button>
              </div>
            ) : null}
          </div>

          {erro ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {erro}
            </div>
          ) : null}

        </div>

        {showEmailLogin ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 backdrop-blur-sm p-5 space-y-4"
          >
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">
                Entrada alternativa por e-mail
              </h2>
              <p className="text-xs text-textmuted">
                Use apenas se preferir não simular login social agora.
              </p>
            </div>

            <label className="space-y-1 block">
              <span className="text-xs text-textmuted">Seu nome (opcional)</span>
              <input
                ref={nomeRef}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    emailRef.current?.focus();
                    emailRef.current?.select();
                  }
                }}
                placeholder="Ex.: Marcos"
                className="w-full rounded-xl border border-surfaceLight bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>

            <label className="space-y-1 block">
              <span className="text-xs text-textmuted">Email</span>
              <input
                ref={emailRef}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitRef.current?.focus();
                  }
                }}
                placeholder="seuemail@exemplo.com"
                inputMode="email"
                autoComplete="email"
                className="w-full rounded-xl border border-surfaceLight bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
              />
              <div className="text-xs">
                {email.length === 0 ? null : emailOk ? (
                  <span className="text-emerald-500">Email ok ✅</span>
                ) : (
                  <span className="text-red-400">Confere o formato do email</span>
                )}
              </div>
            </label>

            <button
              ref={submitRef}
              type="submit"
              className="w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white hover:opacity-95 active:opacity-90 transition"
            >
              Entrar com e-mail
            </button>

            <p className="text-xs text-textmuted">
              Ao entrar, a gente salva seus dados só no seu navegador (LocalStorage), apenas para simular login no protótipo.
            </p>
          </form>
        ) : null}
      </div>
    </section>
  );
}