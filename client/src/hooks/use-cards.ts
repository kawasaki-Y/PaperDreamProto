import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type BalanceRequest, type Game, type Card } from "@shared/schema";

export function useGames() {
  return useQuery<Game[]>({
    queryKey: ["/api/games"],
    queryFn: async () => {
      const res = await fetch("/api/games", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch games");
      return res.json();
    },
  });
}

export function useGame(id: number | null) {
  return useQuery<Game>({
    queryKey: ["/api/games", id],
    queryFn: async () => {
      const res = await fetch(buildUrl("/api/games/:id", { id: id! }), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch game");
      return res.json();
    },
    enabled: id !== null,
  });
}

export function useGameCards(gameId: number | null) {
  return useQuery<Card[]>({
    queryKey: ["/api/games", gameId, "cards"],
    queryFn: async () => {
      const res = await fetch(buildUrl("/api/games/:id/cards", { id: gameId! }), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cards");
      return res.json();
    },
    enabled: gameId !== null,
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create game");
      }
      return res.json() as Promise<Game>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; title?: string; description?: string }) => {
      const res = await fetch(buildUrl("/api/games/:id", { id }), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update game");
      return res.json() as Promise<Game>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(buildUrl("/api/games/:id", { id }), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete game");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gameId, ...data }: { gameId: number; name: string; imageUrl?: string; frontImageUrl?: string; backImageUrl?: string; description?: string; attributes?: Record<string, unknown>; order?: number }) => {
      const res = await fetch(buildUrl("/api/games/:id/cards", { id: gameId }), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create card");
      }
      return res.json() as Promise<Card>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", variables.gameId, "cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cardId, gameId, ...data }: { cardId: number; gameId: number; name?: string; imageUrl?: string; frontImageUrl?: string; backImageUrl?: string; description?: string; attributes?: Record<string, unknown>; order?: number }) => {
      const res = await fetch(buildUrl("/api/cards/:id", { id: cardId }), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update card");
      }
      return res.json() as Promise<Card>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", variables.gameId, "cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to upload image");
      }
      return res.json() as Promise<{ url: string; filename: string }>;
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ cardId, gameId }: { cardId: number; gameId: number }) => {
      const res = await fetch(buildUrl("/api/cards/:id", { id: cardId }), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete card");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", variables.gameId, "cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
  });
}

export function useBalanceCheck() {
  return useMutation({
    mutationFn: async (data: BalanceRequest) => {
      const res = await fetch(api.balance.suggest.path, {
        method: api.balance.suggest.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.balance.suggest.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 500) {
          const error = api.balance.suggest.responses[500].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to get balance suggestion");
      }
      return api.balance.suggest.responses[200].parse(await res.json());
    },
  });
}
