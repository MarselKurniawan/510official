import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "EN" | "ID";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

const LangCtx = createContext<Ctx>({ lang: "EN", setLang: () => {}, toggle: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("EN");
  return (
    <LangCtx.Provider
      value={{ lang, setLang, toggle: () => setLang((l) => (l === "EN" ? "ID" : "EN")) }}
    >
      {children}
    </LangCtx.Provider>
  );
}

export function useLang() {
  return useContext(LangCtx);
}

type Dict = Record<Lang, string>;
export function t(d: Dict, lang: Lang) {
  return d[lang];
}
