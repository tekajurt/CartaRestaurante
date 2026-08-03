export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  description: string;
  theme: string;
  accent_color: string;
  is_active: boolean;
  created_at: string;
};

export type RestaurantInput = Omit<Restaurant, "id" | "slug" | "created_at" | "description"> & {
  slug?: string;
  description?: string;
};
