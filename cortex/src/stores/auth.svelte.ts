import { validateAuth } from "@/services/ws.svelte";

class authStore {
  authenticated = $state(false);
  pending = $state(false);

  async login(username: string, password: string): Promise<boolean> {
    this.pending = true;
    try {
      const valid = await validateAuth({ username, password });
      this.authenticated = valid;
      return valid;
    } catch {
      this.authenticated = false;
      return false;
    } finally {
      this.pending = false;
    }
  }

  async checkAuth(username: string, password: string): Promise<boolean> {
    this.pending = true;
    try {
      const valid = await validateAuth({username, password});
      return valid;
    } catch {
      return false;
    } finally {
      this.pending = false;
    }
  }

  logout() {
    this.authenticated = false;
  }

  clear() {
    this.authenticated = false;
    this.pending = false;
  }
}

export const AuthStore = new authStore();
