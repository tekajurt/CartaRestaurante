export type MenuItem = {
  id: string;
  menu_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  created_at: string;
};

export type MenuItemInput = Omit<MenuItem, "id" | "created_at">;
