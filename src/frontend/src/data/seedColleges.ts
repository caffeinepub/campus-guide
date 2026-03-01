import type { Principal } from "@icp-sdk/core/principal";
import type { CollegeEntry } from "../backend.d";

export const SEED_COLLEGES: CollegeEntry[] = [
  {
    id: BigInt(1),
    name: "Hi-Tech Institute of Technology (HIT)",
    tagline: "Churning out technocrats of excellence",
    description:
      "Hi-Tech Institute of Technology (HIT) is an AICTE approved, BPUT affiliated engineering institution under the Hi-Tech Group, established in 2008. Located in Khordha, Odisha, HIT offers undergraduate and postgraduate programs in engineering, management, and applied management.",
    address:
      "Behind Reliance Petrol Pump, Near Industrial Estate Khordha, District: Khordha, Odisha, PIN: 752057",
    phone: "9938615995 (Office) | 9348054112 (Admission)",
    email: "info@hit.ac.in",
    website: "https://www.hit.ac.in",
    established: "2008",
    departments: [
      {
        name: "Civil Engineering",
        description:
          "Focuses on structural, environmental and construction engineering fundamentals.",
      },
      {
        name: "Computer Science Engineering",
        description:
          "Covers software development, algorithms, data structures, AI, and networking.",
      },
      {
        name: "Electrical Engineering",
        description:
          "Power systems, electronics, control systems, and electrical machines.",
      },
      {
        name: "Mechanical Engineering",
        description:
          "Thermodynamics, manufacturing, design, and industrial engineering.",
      },
      {
        name: "Basic Science & Humanities",
        description:
          "Foundation courses in physics, chemistry, mathematics, and communication skills.",
      },
      {
        name: "MBA",
        description:
          "Master of Business Administration for management and entrepreneurship.",
      },
    ],
    courses: [
      {
        name: "B.Tech – Civil Engineering",
        level: "UG",
        duration: "4 Years",
        fees: "₹60,000/yr",
        eligibility: "10+2 with PCM, JEE/OJEE qualified",
        description: "4-year undergraduate program affiliated to BPUT.",
      },
      {
        name: "B.Tech – Computer Science Engineering",
        level: "UG",
        duration: "4 Years",
        fees: "₹60,000/yr",
        eligibility: "10+2 with PCM, JEE/OJEE qualified",
        description: "Focus on software engineering, AI, and cloud computing.",
      },
      {
        name: "B.Tech – Electrical Engineering",
        level: "UG",
        duration: "4 Years",
        fees: "₹60,000/yr",
        eligibility: "10+2 with PCM, JEE/OJEE qualified",
        description: "Power, control, and electronics engineering.",
      },
      {
        name: "B.Tech – Mechanical Engineering",
        level: "UG",
        duration: "4 Years",
        fees: "₹60,000/yr",
        eligibility: "10+2 with PCM, JEE/OJEE qualified",
        description: "Design, manufacturing, and thermal engineering.",
      },
      {
        name: "Diploma in Engineering",
        level: "Diploma",
        duration: "3 Years",
        fees: "₹40,000/yr",
        eligibility: "10th pass with Science & Math",
        description: "Polytechnic diploma in multiple engineering branches.",
      },
      {
        name: "MBA",
        level: "PG",
        duration: "2 Years",
        fees: "₹70,000/yr",
        eligibility: "Graduation with OJEE/CMAT score",
        description:
          "Management program covering finance, HR, marketing, and operations.",
      },
      {
        name: "M.Tech",
        level: "PG",
        duration: "2 Years",
        fees: "₹65,000/yr",
        eligibility: "B.Tech + GATE score",
        description: "Post-graduate engineering with research focus.",
      },
      {
        name: "MAM",
        level: "PG",
        duration: "2 Years",
        fees: "₹65,000/yr",
        eligibility: "Graduation in relevant field",
        description: "Master of Applied Management.",
      },
    ],
    faculty: [
      {
        name: "Prof. Bikash Kumar Mohanty",
        designation: "Principal",
        department: "Administration",
        qualification: "Ph.D, M.Tech",
        experience: "20+ years",
      },
      {
        name: "Prof. Sarat Kumar Das",
        designation: "Admission Incharge",
        department: "Administration",
        qualification: "M.Tech",
        experience: "15+ years",
      },
      {
        name: "Dr. Ramesh Panda",
        designation: "HOD – CSE",
        department: "Computer Science Engineering",
        qualification: "Ph.D (CS), M.Tech",
        experience: "18 years",
      },
      {
        name: "Prof. Sushanta Nayak",
        designation: "HOD – Mechanical",
        department: "Mechanical Engineering",
        qualification: "M.Tech (Thermal)",
        experience: "14 years",
      },
      {
        name: "Dr. Priya Singh",
        designation: "HOD – Civil",
        department: "Civil Engineering",
        qualification: "Ph.D (Structures)",
        experience: "16 years",
      },
      {
        name: "Prof. Ajit Kumar Jena",
        designation: "HOD – Electrical",
        department: "Electrical Engineering",
        qualification: "M.Tech (Power Systems)",
        experience: "12 years",
      },
    ],
    placement: {
      rate: BigInt(88),
      highestPackage: BigInt(18),
      averagePackage: BigInt(5),
      topRecruiters: [
        "TCS",
        "Infosys",
        "Wipro",
        "Cognizant",
        "L&T",
        "Tech Mahindra",
        "HCL",
        "Capgemini",
      ],
    },
    facilities: [
      "Central Library with 10,000+ books and e-resources",
      "24x7 High-Speed Internet Facility",
      "Modern Computing Lab with 200+ workstations",
      "Canteen & Cafeteria",
      "Separate Hostel for Boys & Girls",
      "Campus Transportation",
      "Study Tours and Industrial Visits",
      "Sports Complex",
      "Project & Research Activity Center",
    ],
    achievements: [
      "AICTE Approved Institution",
      "Affiliated to BPUT (Biju Patnaik University of Technology), Odisha",
      "Consistent 85-90% placement record over the past 5 years",
      "Multiple campus drives with 50+ recruiting companies",
      "Active NSS and NCC units",
      "Winner of multiple inter-college technical fests",
      "Strong alumni network across India and abroad",
    ],
    managedBy: { toText: () => "aaaaa-aa" } as unknown as Principal,
    createdAt: BigInt(Date.now()),
  },
];
