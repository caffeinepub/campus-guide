import AccessControl "authorization/access-control";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type Category = {
    #department;
    #classroom;
    #lab;
    #office;
    #other;
  };

  module Category {
    public func compare(cat1 : Category, cat2 : Category) : Order.Order {
      switch (cat1, cat2) {
        case (#department, #department) { #equal };
        case (#department, _) { #less };
        case (#classroom, #department) { #greater };
        case (#classroom, #classroom) { #equal };
        case (#classroom, _) { #less };
        case (#lab, #lab) { #equal };
        case (#lab, #office) { #less };
        case (#lab, #other) { #less };
        case (#lab, _) { #greater };
        case (#office, #office) { #equal };
        case (#office, #other) { #less };
        case (#office, _) { #greater };
        case (#other, #other) { #equal };
        case (#other, _) { #greater };
      };
    };

    public func toText(category : Category) : Text {
      switch (category) {
        case (#department) { "Department" };
        case (#classroom) { "Classroom" };
        case (#lab) { "Lab" };
        case (#office) { "Office" };
        case (#other) { "Other" };
      };
    };

    public func fromText(text : Text) : Category {
      switch (text.toLower()) {
        case ("department") { #department };
        case ("classroom") { #classroom };
        case ("lab") { #lab };
        case ("office") { #office };
        case ("other") { #other };
        case (_) { #other };
      };
    };
  };

  type Location = {
    id : Text;
    name : Text;
    category : Category;
    building : Text;
    floor : Text;
    roomNumber : Text;
    description : Text;
    createdAt : Int;
  };

  module Location {
    public func compare(loc1 : Location, loc2 : Location) : Order.Order {
      switch (Text.compare(loc1.building, loc2.building)) {
        case (#equal) {
          switch (Category.compare(loc1.category, loc2.category)) {
            case (#equal) { Text.compare(loc1.name, loc2.name) };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  type LocationInput = {
    name : Text;
    category : Text;
    building : Text;
    floor : Text;
    roomNumber : Text;
    description : Text;
  };

  let locations = Map.empty<Text, Location>();

  public query ({ caller }) func getLocation(id : Text) : async ?Location {
    locations.get(id);
  };

  public query ({ caller }) func getAllLocations() : async [Location] {
    locations.values().toArray().sort();
  };

  public query ({ caller }) func searchLocations(searchTerm : Text) : async [Location] {
    let lowerSearchTerm = searchTerm.toLower();
    locations.values().toArray().filter(
      func(loc) {
        loc.name.toLower().contains(#text lowerSearchTerm) or
        loc.building.toLower().contains(#text lowerSearchTerm) or
        Category.toText(loc.category).toLower().contains(#text lowerSearchTerm)
      }
    ).sort();
  };

  public shared ({ caller }) func addLocation(input : LocationInput) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add locations");
    };

    let id = input.name # input.building # Time.now().toText();
    let newLocation : Location = {
      id;
      name = input.name;
      category = Category.fromText(input.category);
      building = input.building;
      floor = input.floor;
      roomNumber = input.roomNumber;
      description = input.description;
      createdAt = Time.now();
    };
    locations.add(id, newLocation);
    id;
  };

  public shared ({ caller }) func updateLocation(id : Text, input : LocationInput) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update locations");
    };

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
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete locations");
    };

    if (not (locations.containsKey(id))) {
      Runtime.trap("Location not found");
    };
    locations.remove(id);
  };

  system func preupgrade() {
    if (locations.isEmpty()) {
      let sampleLocations : [Location] = [
        {
          id = "1";
          name = "Computer Science Department";
          category = #department;
          building = "Science Building";
          floor = "3rd";
          roomNumber = "301";
          description = "Main office for the CS department";
          createdAt = Time.now();
        },
        {
          id = "2";
          name = "Physics Lab 101";
          category = #lab;
          building = "Science Building";
          floor = "1st";
          roomNumber = "101";
          description = "Introductory Physics lab";
          createdAt = Time.now();
        },
        {
          id = "3";
          name = "Professor Smith's Office";
          category = #office;
          building = "Arts Building";
          floor = "2nd";
          roomNumber = "202";
          description = "Office hours for Prof. Smith";
          createdAt = Time.now();
        },
        {
          id = "4";
          name = "Math Classroom";
          category = #classroom;
          building = "Arts Building";
          floor = "1st";
          roomNumber = "105";
          description = "Calculus lectures";
          createdAt = Time.now();
        },
        {
          id = "5";
          name = "Chemistry Department";
          category = #department;
          building = "Science Building";
          floor = "2nd";
          roomNumber = "210";
          description = "Admin office for Chemistry department";
          createdAt = Time.now();
        },
        {
          id = "6";
          name = "Boardroom A";
          category = #other;
          building = "Main Hall";
          floor = "Ground";
          roomNumber = "GR-5";
          description = "Meeting space available for booking";
          createdAt = Time.now();
        },
        {
          id = "7";
          name = "Library Study Room 3";
          category = #other;
          building = "Library";
          floor = "3rd";
          roomNumber = "L3-4";
          description = "Group study room (seats 6)";
          createdAt = Time.now();
        },
        {
          id = "8";
          name = "Biology Lab";
          category = #lab;
          building = "Science Building";
          floor = "2nd";
          roomNumber = "212";
          description = "Advanced genetics lab";
          createdAt = Time.now();
        },
        {
          id = "9";
          name = "Economics Seminar Room";
          category = #classroom;
          building = "Business Building";
          floor = "1st";
          roomNumber = "B1-02";
          description = "Small seminar-style classroom";
          createdAt = Time.now();
        },
        {
          id = "10";
          name = "Dean's Office";
          category = #office;
          building = "Main Hall";
          floor = "3rd";
          roomNumber = "M3-10";
          description = "Office of the college Dean";
          createdAt = Time.now();
        },
      ];

      for (loc in sampleLocations.values()) {
        locations.add(loc.id, loc);
      };
    };
  };
};
