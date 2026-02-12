// src/pages/Entrar.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

const AUTH_KEY = "falaCidadao.auth";

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

export default function Entrar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");

  const emailOk = useMemo(() => isValidEmail(email.trim()), [email]);
  
  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const emailLimpo = email.trim().toLowerCase();
    const nomeLimpo = nome.trim();

    if (!emailLimpo) {
      setErro("Me diz teu email pra eu liberar a entrada 🙂");
      return;
    }
    if (!isValidEmail(emailLimpo)) {
      setErro("Esse email parece inválido. Confere pra mim?");
      return;
    }

    const payload = {
      nome: nomeLimpo || "Cidadão",
      email: emailLimpo,
      role: "cidadao",
      loggedAt: new Date().toISOString(),
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    window.location.href = "/";
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
              <h1 className="text-2xl md:text-3xl font-semibold">Entrar</h1>
              <p className="text-textsoft">
                Só pra identificar quem está usando o protótipo. (Sem senha por enquanto.)
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

        {/* Login social (preparado para o futuro) */}
        <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 backdrop-blur-sm p-5 space-y-3">
          <h2 className="text-sm font-semibold">Entrar com</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled
              className="rounded-2xl border border-surfaceLight bg-surface px-4 py-3 text-left opacity-60 cursor-not-allowed"
              title="Em breve"
            >
              <div className="flex items-center gap-3">
                <GoogleIcon />
                <div>
                  <div className="font-semibold">Google</div>
                  <div className="text-xs text-textmuted">Em breve</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              disabled
              className="rounded-2xl border border-surfaceLight bg-surface px-4 py-3 text-left opacity-60 cursor-not-allowed"
              title="Em breve"
            >
              <div className="flex items-center gap-3">
                <FacebookIcon />
                <div>
                  <div className="font-semibold">Facebook</div>
                  <div className="text-xs text-textmuted">Em breve</div>
                </div>
              </div>
            </button>
          </div>

          <p className="text-xs text-textmuted">
            Estamos preparando login social para versões futuras (MVP/app).
          </p>
        </div>

        {/* Login simples por email (protótipo) */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 backdrop-blur-sm p-5 space-y-4"
        >
          <label className="space-y-1 block">
            <span className="text-xs text-textmuted">Seu nome (opcional)</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Marcos"
              className="w-full rounded-xl border border-surfaceLight bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <label className="space-y-1 block">
            <span className="text-xs text-textmuted">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {erro ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {erro}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white hover:opacity-95 active:opacity-90 transition"
          >
            Entrar
          </button>

          <p className="text-xs text-textmuted">
            Ao entrar, a gente salva seus dados só no seu navegador (LocalStorage), apenas para simular login no protótipo.
          </p>
        </form>
      </div>
    </section>
  );
}










