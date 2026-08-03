import type { Restaurant } from "@/types";
import type { Menu } from "@/types";
import type { MenuItem } from "@/types";
import DefaultLandingPage from "./default/LandingPage";
import DefaultMenuPage from "./default/MenuPage";
import defaultConfig from "./default/config";
import ModernLandingPage from "./modern/LandingPage";
import ModernMenuPage from "./modern/MenuPage";
import modernConfig from "./modern/config";

export type ThemeConfig = {
  slug: string;
  name: string;
  description: string;
  defaultColor: string;
};

export type ThemeComponents = {
  LandingPage: React.ComponentType<{ restaurant: Restaurant }>;
  MenuPage: React.ComponentType<{ restaurant: Restaurant; menu: Menu; menuItems: MenuItem[] }>;
};

export const themes: Record<string, ThemeConfig & ThemeComponents> = {
  default: {
    ...defaultConfig,
    LandingPage: DefaultLandingPage,
    MenuPage: DefaultMenuPage,
  },
  modern: {
    ...modernConfig,
    LandingPage: ModernLandingPage,
    MenuPage: ModernMenuPage,
  },
};

export function getTheme(slug: string) {
  return themes[slug] ?? themes.default;
}

export const themeList = Object.values(themes).map(({ slug, name, description, defaultColor }) => ({
  slug,
  name,
  description,
  defaultColor,
}));
