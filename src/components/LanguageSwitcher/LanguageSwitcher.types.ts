export type Locales = {
  lang: string;
  lang_name: string;
  url: string;
}[];

export interface LanguageSwitcherProps {
  locales: Locales;
  currentLocale: string;
}
