import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface Placement {
    highestPackage: bigint;
    rate: bigint;
    topRecruiters: Array<string>;
    averagePackage: bigint;
}
export interface CollegeInfo {
    tagline: string;
    name: string;
    established: string;
    description: string;
    email: string;
    website: string;
    address: string;
    phone: string;
}
export interface LocationInput {
    floor: string;
    name: string;
    building: string;
    description: string;
    roomNumber: string;
    category: string;
}
export interface CollegeCourse {
    duration: string;
    fees: string;
    name: string;
    description: string;
    level: string;
    eligibility: string;
}
export interface CollegeEntry {
    id: bigint;
    departments: Array<Department>;
    courses: Array<CollegeCourse>;
    placement: Placement;
    tagline: string;
    name: string;
    createdAt: bigint;
    established: string;
    description: string;
    email: string;
    website: string;
    achievements: Array<string>;
    address: string;
    faculty: Array<FacultyMember>;
    facilities: Array<string>;
    managedBy: Principal;
    phone: string;
}
export interface Course {
    id: string;
    duration: string;
    fees: string;
    name: string;
    createdAt: bigint;
    description: string;
    eligibility: string;
    department: string;
}
export interface CollegeEntryInput {
    departments: Array<Department>;
    courses: Array<CollegeCourse>;
    placement: Placement;
    tagline: string;
    name: string;
    established: string;
    description: string;
    email: string;
    website: string;
    achievements: Array<string>;
    address: string;
    faculty: Array<FacultyMember>;
    facilities: Array<string>;
    phone: string;
}
export interface Department {
    name: string;
    description: string;
}
export interface CourseInput {
    duration: string;
    fees: string;
    name: string;
    description: string;
    eligibility: string;
    department: string;
}
export interface FacultyMember {
    name: string;
    designation: string;
    experience: string;
    department: string;
    qualification: string;
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
    addCollegeEntry(input: CollegeEntryInput): Promise<bigint>;
    addCourse(input: CourseInput): Promise<string>;
    addLocation(location: LocationInput): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCollegeEntry(id: bigint): Promise<void>;
    deleteCourse(id: string): Promise<void>;
    deleteLocation(id: string): Promise<void>;
    getAllCollegeEntries(): Promise<Array<CollegeEntry>>;
    getAllCourses(): Promise<Array<Course>>;
    getAllLocations(): Promise<Array<Location>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCollegeEntry(id: bigint): Promise<CollegeEntry | null>;
    getCollegeInfo(): Promise<CollegeInfo | null>;
    getCourse(id: string): Promise<Course | null>;
    getCoursesByDepartment(department: string): Promise<Array<Course>>;
    getLocation(id: string): Promise<Location | null>;
    getLocationsByCategory(category: string): Promise<Array<Location>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeCollegeInfo(info: CollegeInfo): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchCourses(searchTerm: string): Promise<Array<Course>>;
    searchLocations(searchTerm: string, category: string | null): Promise<Array<Location>>;
    updateCollegeEntry(id: bigint, input: CollegeEntryInput): Promise<void>;
    updateCollegeInfo(info: CollegeInfo): Promise<void>;
    updateCourse(id: string, input: CourseInput): Promise<void>;
    updateLocation(id: string, input: LocationInput): Promise<void>;
}
