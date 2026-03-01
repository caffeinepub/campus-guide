import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Category "category";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    emitUnauthorizedIfNotUser(caller, "Only users can access profiles");
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller == user) {
      return userProfiles.get(user);
    };
    emitUnauthorizedUnlessAdmin(caller, "Unauthorized: Only admins can view other profiles");
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    emitUnauthorizedIfNotUser(caller, "Only users can save profiles");
    userProfiles.add(caller, profile);
  };

  func emitUnauthorizedIfNotUser(caller : Principal, message : Text) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap(message);
    };
  };

  func emitUnauthorizedUnlessAdmin(caller : Principal, message : Text) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap(message);
    };
  };

  // ===== Types =====

  public type Location = {
    id : Text;
    name : Text;
    category : Category.Category;
    building : Text;
    floor : Text;
    roomNumber : Text;
    description : Text;
    createdAt : Int;
  };

  public type LocationInput = {
    name : Text;
    category : Text;
    building : Text;
    floor : Text;
    roomNumber : Text;
    description : Text;
  };

  public type Course = {
    id : Text;
    name : Text;
    department : Text;
    duration : Text;
    fees : Text;
    eligibility : Text;
    description : Text;
    createdAt : Int;
  };

  public type CourseInput = {
    name : Text;
    department : Text;
    duration : Text;
    fees : Text;
    eligibility : Text;
    description : Text;
  };

  public type CollegeInfo = {
    name : Text;
    tagline : Text;
    description : Text;
    address : Text;
    phone : Text;
    email : Text;
    website : Text;
    established : Text;
  };

  // New CollegeEntry types
  public type CollegeEntry = {
    id : Nat;
    name : Text;
    tagline : Text;
    description : Text;
    address : Text;
    phone : Text;
    email : Text;
    website : Text;
    established : Text;
    departments : [Department];
    courses : [CollegeCourse];
    faculty : [FacultyMember];
    placement : Placement;
    facilities : [Text];
    achievements : [Text];
    managedBy : Principal;
    createdAt : Int;
  };

  public type Department = {
    name : Text;
    description : Text;
  };

  public type CollegeCourse = {
    name : Text;
    level : Text;
    duration : Text;
    fees : Text;
    eligibility : Text;
    description : Text;
  };

  public type FacultyMember = {
    name : Text;
    designation : Text;
    department : Text;
    qualification : Text;
    experience : Text;
  };

  public type Placement = {
    rate : Nat;
    highestPackage : Nat;
    averagePackage : Nat;
    topRecruiters : [Text];
  };

  public type CollegeEntryInput = {
    name : Text;
    tagline : Text;
    description : Text;
    address : Text;
    phone : Text;
    email : Text;
    website : Text;
    established : Text;
    departments : [Department];
    courses : [CollegeCourse];
    faculty : [FacultyMember];
    placement : Placement;
    facilities : [Text];
    achievements : [Text];
  };

  // ===== Storage =====

  var nextCollegeId = 1;
  let collegeEntries = Map.empty<Nat, CollegeEntry>();
  let locations = Map.empty<Text, Location>();
  let courses = Map.empty<Text, Course>();
  var collegeInfo : ?CollegeInfo = null;

  // ===== Location Functions =====

  public shared ({ caller }) func addLocation(location : LocationInput) : async Text {
    emitUnauthorizedUnlessAdmin(caller, "Only admins can add locations");
    let id = location.name # location.building # location.floor;
    let newLocation : Location = {
      id;
      name = location.name;
      category = Category.fromText(location.category);
      building = location.building;
      floor = location.floor;
      roomNumber = location.roomNumber;
      description = location.description;
      createdAt = Time.now();
    };
    locations.add(id, newLocation);
    id;
  };

  public shared ({ caller }) func updateLocation(id : Text, input : LocationInput) : async () {
    emitUnauthorizedUnlessAdmin(caller, "Only admins can update locations");
    switch (locations.get(id)) {
      case (null) { Runtime.trap("Location not found") };
      case (?_) {
        let updatedLocation : Location = {
          id;
          name = input.name;
          category = Category.fromText(input.category);
          building = input.building;
          floor = input.floor;
          roomNumber = input.roomNumber;
          description = input.description;
          createdAt = Time.now();
        };
        locations.add(id, updatedLocation);
      };
    };
  };

  public shared ({ caller }) func deleteLocation(id : Text) : async () {
    emitUnauthorizedUnlessAdmin(caller, "Only admins can delete locations");
    if (not (locations.containsKey(id))) {
      Runtime.trap("Location not found");
    };
    locations.remove(id);
  };

  public query func getLocation(id : Text) : async ?Location {
    locations.get(id);
  };

  public query func getAllLocations() : async [Location] {
    locations.values().toArray();
  };

  public query func searchLocations(searchTerm : Text, category : ?Text) : async [Location] {
    let lowerSearchTerm = searchTerm.toLower();
    let filteredLocations = locations.values().toArray().filter(
      func(loc) {
        loc.name.toLower().contains(#text lowerSearchTerm) or
        loc.building.toLower().contains(#text lowerSearchTerm)
      }
    );
    switch (category) {
      case (null) { filteredLocations };
      case (?catText) {
        let cat = Category.fromText(catText);
        filteredLocations.filter(
          func(loc) {
            cat == loc.category;
          }
        );
      };
    };
  };

  public query func getLocationsByCategory(category : Text) : async [Location] {
    let cat = Category.fromText(category);
    locations.values().toArray().filter(
      func(loc) {
        cat == loc.category;
      }
    );
  };

  // ===== Course Functions =====

  public shared ({ caller }) func addCourse(input : CourseInput) : async Text {
    emitUnauthorizedUnlessAdmin(caller, "Only admins can add courses");
    let id = input.name # input.department # Time.now().toText();
    let newCourse : Course = {
      id;
      name = input.name;
      department = input.department;
      duration = input.duration;
      fees = input.fees;
      eligibility = input.eligibility;
      description = input.description;
      createdAt = Time.now();
    };
    courses.add(id, newCourse);
    id;
  };

  public shared ({ caller }) func updateCourse(id : Text, input : CourseInput) : async () {
    emitUnauthorizedUnlessAdmin(caller, "Only admins can update courses");
    switch (courses.get(id)) {
      case (null) { Runtime.trap("Course not found") };
      case (?existingCourse) {
        let updatedCourse : Course = {
          id = existingCourse.id;
          name = input.name;
          department = input.department;
          duration = input.duration;
          fees = input.fees;
          eligibility = input.eligibility;
          description = input.description;
          createdAt = Time.now();
        };
        courses.add(id, updatedCourse);
      };
    };
  };

  public shared ({ caller }) func deleteCourse(id : Text) : async () {
    emitUnauthorizedUnlessAdmin(caller, "Only admins can delete courses");
    if (not (courses.containsKey(id))) {
      Runtime.trap("Course not found");
    };
    courses.remove(id);
  };

  public query func getCourse(id : Text) : async ?Course {
    courses.get(id);
  };

  public query func getAllCourses() : async [Course] {
    courses.values().toArray();
  };

  public query func getCoursesByDepartment(department : Text) : async [Course] {
    let filterDepartment = department.toLower();
    courses.values().toArray().filter(
      func(course) {
        course.department.toLower() == filterDepartment
      }
    );
  };

  public query func searchCourses(searchTerm : Text) : async [Course] {
    let lowerSearchTerm = searchTerm.toLower();
    courses.values().toArray().filter(
      func(course) {
        course.name.toLower().contains(#text lowerSearchTerm) or
        course.department.toLower().contains(#text lowerSearchTerm)
      }
    );
  };

  // ===== College Info Functions =====

  public shared ({ caller }) func updateCollegeInfo(info : CollegeInfo) : async () {
    emitUnauthorizedUnlessAdmin(caller, "Only admins can update college info");
    collegeInfo := ?info;
  };

  public query func getCollegeInfo() : async ?CollegeInfo {
    collegeInfo;
  };

  public shared ({ caller }) func initializeCollegeInfo(info : CollegeInfo) : async () {
    emitUnauthorizedUnlessAdmin(caller, "Only admins can set college info");
    if (collegeInfo != null) {
      Runtime.trap("College info already initialized");
    };
    collegeInfo := ?info;
  };

  // ===== College Entry Functions =====

  // Add College Entry
  public shared ({ caller }) func addCollegeEntry(input : CollegeEntryInput) : async Nat {
    emitUnauthorizedIfNotUser(caller, "Must be authenticated to add a college");
    let id = nextCollegeId;
    let newCollege : CollegeEntry = {
      id;
      name = input.name;
      tagline = input.tagline;
      description = input.description;
      address = input.address;
      phone = input.phone;
      email = input.email;
      website = input.website;
      established = input.established;
      departments = input.departments;
      courses = input.courses;
      faculty = input.faculty;
      placement = input.placement;
      facilities = input.facilities;
      achievements = input.achievements;
      managedBy = caller;
      createdAt = Time.now();
    };
    collegeEntries.add(id, newCollege);
    nextCollegeId += 1;
    id;
  };

  // Update College Entry
  public shared ({ caller }) func updateCollegeEntry(id : Nat, input : CollegeEntryInput) : async () {
    switch (collegeEntries.get(id)) {
      case (null) { Runtime.trap("College not found") };
      case (?existing) {
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);
        if (not isAdmin and caller != existing.managedBy) {
          Runtime.trap("Unauthorized: Must be the manager or admin to update");
        };
        let updated : CollegeEntry = {
          id;
          name = input.name;
          tagline = input.tagline;
          description = input.description;
          address = input.address;
          phone = input.phone;
          email = input.email;
          website = input.website;
          established = input.established;
          departments = input.departments;
          courses = input.courses;
          faculty = input.faculty;
          placement = input.placement;
          facilities = input.facilities;
          achievements = input.achievements;
          managedBy = existing.managedBy;
          createdAt = existing.createdAt;
        };
        collegeEntries.add(id, updated);
      };
    };
  };

  // Delete College Entry
  public shared ({ caller }) func deleteCollegeEntry(id : Nat) : async () {
    switch (collegeEntries.get(id)) {
      case (null) { Runtime.trap("College not found") };
      case (?existing) {
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);
        if (not isAdmin and caller != existing.managedBy) {
          Runtime.trap("Unauthorized: Must be the manager or admin to delete");
        };
        collegeEntries.remove(id);
      };
    };
  };

  // Get All Colleges
  public query func getAllCollegeEntries() : async [CollegeEntry] {
    collegeEntries.values().toArray();
  };

  // Get College by ID
  public query func getCollegeEntry(id : Nat) : async ?CollegeEntry {
    collegeEntries.get(id);
  };
};
