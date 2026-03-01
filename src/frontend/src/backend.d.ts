import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LocationInput {
    floor: string;
    name: string;
    building: string;
    description: string;
    roomNumber: string;
    category: string;
}
export interface Location {
    id: string;
    floor: string;
    name: string;
    createdAt: bigint;
    building: string;
    description: string;
    roomNumber: string;
    category: Category;
}
export interface UserProfile {
    name: string;
}
export enum Category {
    lab = "lab",
    other = "other",
    office = "office",
    department = "department",
    classroom = "classroom"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLocation(input: LocationInput): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteLocation(id: string): Promise<void>;
    getAllLocations(): Promise<Array<Location>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLocation(id: string): Promise<Location | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchLocations(searchTerm: string): Promise<Array<Location>>;
    updateLocation(id: string, input: LocationInput): Promise<void>;
}
