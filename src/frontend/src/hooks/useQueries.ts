import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CollegeEntry,
  CollegeEntryInput,
  CollegeInfo,
  Course,
  CourseInput,
  Location,
  LocationInput,
  UserProfile,
} from "../backend.d";
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
      return actor.searchLocations(searchTerm, null);
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

// ── Courses ────────────────────────────────────────────────

export function useGetAllCourses() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCourse(id: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Course | null>({
    queryKey: ["course", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getCourse(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CourseInput) => {
      if (!actor) throw new Error("No actor");
      return actor.addCourse(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useUpdateCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: CourseInput }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateCourse(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useDeleteCourse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteCourse(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

// ── College Info ───────────────────────────────────────────

export function useGetCollegeInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<CollegeInfo | null>({
    queryKey: ["collegeInfo"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCollegeInfo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateCollegeInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (info: CollegeInfo) => {
      if (!actor) throw new Error("No actor");
      return actor.updateCollegeInfo(info);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collegeInfo"] });
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

// ── College Entries ────────────────────────────────────────

export function useGetAllCollegeEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<CollegeEntry[]>({
    queryKey: ["collegeEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCollegeEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCollegeEntry(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<CollegeEntry | null>({
    queryKey: ["collegeEntry", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getCollegeEntry(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAddCollegeEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CollegeEntryInput) => {
      if (!actor) throw new Error("No actor");
      return actor.addCollegeEntry(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collegeEntries"] });
    },
  });
}

export function useUpdateCollegeEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: bigint;
      input: CollegeEntryInput;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateCollegeEntry(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collegeEntries"] });
    },
  });
}

export function useDeleteCollegeEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteCollegeEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collegeEntries"] });
    },
  });
}
