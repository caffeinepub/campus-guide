import { Category } from "../backend.d";

const categoryLabels: Record<Category, string> = {
  [Category.department]: "Department",
  [Category.classroom]: "Classroom",
  [Category.lab]: "Lab",
  [Category.office]: "Office",
  [Category.other]: "Other",
};

const categoryClasses: Record<Category, string> = {
  [Category.department]: "badge-department",
  [Category.classroom]: "badge-classroom",
  [Category.lab]: "badge-lab",
  [Category.office]: "badge-office",
  [Category.other]: "badge-other",
};

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const cls = categoryClasses[category] ?? "badge-other";
  const label = categoryLabels[category] ?? category;

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${cls}
        ${size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1"}
      `}
    >
      {label}
    </span>
  );
}
