import { getSessionUser } from "@/lib/db/session";

export async function createClient() {
  return {
    auth: {
      async getUser() {
        const user = await getSessionUser();
        return {
          data: { user },
          error: null,
        };
      },
      async signOut() {
        const { deleteSession } = await import("@/lib/db/session");
        await deleteSession();
      },
    },
  };
}
