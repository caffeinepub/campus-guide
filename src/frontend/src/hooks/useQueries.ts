import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Location, LocationInput, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ── Locations ─────────────────────────────────────────────

export function useGetAllLocations() {
  const { actor, isFetching } = useActor();
  return useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLocations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLocation(id: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Location | null>({
    queryKey: ["location", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getLocation(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useSearchLocations(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Location[]>({
    queryKey: ["locations", "search", searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      if (!searchTerm.trim()) return actor.getAllLocations();
      return actor.searchLocations(searchTerm);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LocationInput) => {
      if (!actor) throw new Error("No actor");
      return actor.addLocation(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

export function useUpdateLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: LocationInput }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateLocation(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

export function useDeleteLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteLocation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}

// ── Auth / User ────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
