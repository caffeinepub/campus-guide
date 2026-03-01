module {
  public type Category = {
    #department;
    #classroom;
    #lab;
    #office;
    #other;
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
