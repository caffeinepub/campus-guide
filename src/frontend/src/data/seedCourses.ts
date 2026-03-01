import type { CollegeInfo, Course } from "../backend.d";

export const SEED_COURSES: Course[] = [
  {
    id: "course-1",
    name: "Bachelor of Technology – Computer Science & Engineering",
    department: "Computer Science",
    duration: "4 Years",
    fees: "₹85,000 / year",
    eligibility:
      "10+2 with Physics, Chemistry & Mathematics. Minimum 60% aggregate. Valid JEE Main score.",
    description:
      "A comprehensive program covering algorithms, data structures, software engineering, AI/ML, cloud computing, and systems programming. Students gain hands-on experience through industry internships and capstone projects.",
    createdAt: BigInt(0),
  },
  {
    id: "course-2",
    name: "Bachelor of Technology – Electronics & Communication",
    department: "Electronics & Communication",
    duration: "4 Years",
    fees: "₹82,000 / year",
    eligibility:
      "10+2 with Physics, Chemistry & Mathematics. Minimum 60% aggregate. Valid JEE Main score.",
    description:
      "Covers VLSI design, embedded systems, signal processing, telecommunications, and IoT. Lab-intensive curriculum with access to state-of-the-art signal analysis equipment.",
    createdAt: BigInt(0),
  },
  {
    id: "course-3",
    name: "Master of Science – Artificial Intelligence",
    department: "Computer Science",
    duration: "2 Years",
    fees: "₹1,10,000 / year",
    eligibility:
      "B.Tech/B.E. or equivalent in CS, IT, or related field. Minimum 65% aggregate. GATE score preferred.",
    description:
      "Advanced curriculum covering deep learning, reinforcement learning, NLP, computer vision, and AI ethics. Students complete a research thesis with industry collaboration.",
    createdAt: BigInt(0),
  },
  {
    id: "course-4",
    name: "Bachelor of Science – Physics",
    department: "Physics",
    duration: "3 Years",
    fees: "₹45,000 / year",
    eligibility:
      "10+2 with Physics and Mathematics as compulsory subjects. Minimum 55% aggregate.",
    description:
      "Foundational and advanced physics covering classical mechanics, quantum theory, thermodynamics, electromagnetism, and optics. Includes laboratory work and a final-year project.",
    createdAt: BigInt(0),
  },
  {
    id: "course-5",
    name: "Master of Business Administration",
    department: "Business Administration",
    duration: "2 Years",
    fees: "₹1,25,000 / year",
    eligibility:
      "Any bachelor's degree with minimum 50% aggregate. Valid CAT/MAT/XAT score. Group discussion and personal interview.",
    description:
      "A rigorous MBA program with specializations in Finance, Marketing, Operations, and Human Resources. Includes live industry projects, case competitions, and a mandatory summer internship.",
    createdAt: BigInt(0),
  },
  {
    id: "course-6",
    name: "Bachelor of Science – Chemistry",
    department: "Chemistry",
    duration: "3 Years",
    fees: "₹42,000 / year",
    eligibility:
      "10+2 with Chemistry as a compulsory subject. Minimum 55% aggregate.",
    description:
      "Covers organic, inorganic, and physical chemistry with extensive laboratory practice. Prepares students for careers in pharmaceuticals, materials science, and research.",
    createdAt: BigInt(0),
  },
  {
    id: "course-7",
    name: "Bachelor of Technology – Mechanical Engineering",
    department: "Mechanical Engineering",
    duration: "4 Years",
    fees: "₹80,000 / year",
    eligibility:
      "10+2 with Physics, Chemistry & Mathematics. Minimum 60% aggregate. Valid JEE Main score.",
    description:
      "Comprehensive mechanical engineering curriculum covering thermodynamics, fluid mechanics, manufacturing processes, CAD/CAM, and robotics. Includes workshops and industrial visits.",
    createdAt: BigInt(0),
  },
  {
    id: "course-8",
    name: "Master of Technology – Data Science",
    department: "Computer Science",
    duration: "2 Years",
    fees: "₹1,05,000 / year",
    eligibility:
      "B.Tech/B.E./M.Sc. in CS, IT, Statistics, or related field. Minimum 60% aggregate.",
    description:
      "Specialised program in statistical modeling, big data analytics, machine learning pipelines, data visualization, and business intelligence. Includes an industry-sponsored capstone project.",
    createdAt: BigInt(0),
  },
];

export const SEED_COLLEGE_EXTRA = {
  faculty: [
    {
      name: "Dr. Arjun Mehta",
      designation: "Professor & HoD",
      department: "Computer Science",
      qualification: "Ph.D. IIT Bombay",
      experience: "22 years",
    },
    {
      name: "Dr. Priya Sharma",
      designation: "Associate Professor",
      department: "Electronics & Communication",
      qualification: "Ph.D. IISc Bangalore",
      experience: "15 years",
    },
    {
      name: "Dr. Ramesh Iyer",
      designation: "Professor",
      department: "Mechanical Engineering",
      qualification: "Ph.D. IIT Madras",
      experience: "18 years",
    },
    {
      name: "Dr. Sunita Patel",
      designation: "Assistant Professor",
      department: "Physics",
      qualification: "Ph.D. TIFR Mumbai",
      experience: "9 years",
    },
    {
      name: "Prof. Kiran Desai",
      designation: "Professor & Dean Academics",
      department: "Business Administration",
      qualification: "MBA IIM-A, Ph.D. XLRI",
      experience: "25 years",
    },
    {
      name: "Dr. Neha Gupta",
      designation: "Associate Professor",
      department: "Chemistry",
      qualification: "Ph.D. IIT Delhi",
      experience: "12 years",
    },
    {
      name: "Dr. Vikram Nair",
      designation: "Professor",
      department: "Mathematics",
      qualification: "Ph.D. CMI Chennai",
      experience: "20 years",
    },
    {
      name: "Prof. Anita Joshi",
      designation: "Assistant Professor",
      department: "Computer Science",
      qualification: "M.Tech IIT Kharagpur",
      experience: "7 years",
    },
  ],
  placement: {
    year: "2024–25",
    placementPercentage: "94%",
    highestPackage: "₹42 LPA",
    averagePackage: "₹8.6 LPA",
    companiesVisited: 180,
    offersExtended: 1240,
    topRecruiters: [
      "Google",
      "Microsoft",
      "Infosys",
      "TCS",
      "Wipro",
      "Amazon",
      "Deloitte",
      "HDFC Bank",
      "L&T",
      "Bosch",
    ],
  },
  facilities: [
    {
      name: "Boys & Girls Hostel",
      detail: "2,500 seats across 6 blocks with mess, Wi-Fi & laundry",
    },
    {
      name: "Central Library",
      detail: "1.2 lakh books, 400+ e-journals, 24×7 digital access",
    },
    {
      name: "Sports Complex",
      detail: "Olympic pool, cricket ground, basketball & badminton courts",
    },
    {
      name: "Medical Center",
      detail: "Full-time doctors, ambulance, tie-up with nearby hospital",
    },
    {
      name: "High-Speed Wi-Fi",
      detail: "Campus-wide 1 Gbps fibre with 24×7 connectivity",
    },
    {
      name: "Cafeteria & Canteen",
      detail: "Multi-cuisine food court serving 3,000 students daily",
    },
    {
      name: "Auditorium",
      detail: "2,000-seat air-conditioned auditorium for events & conferences",
    },
    {
      name: "Innovation Lab",
      detail: "Startup incubator with 3D printers, IoT kits & maker space",
    },
  ],
  achievements: [
    { title: "NAAC Accreditation", detail: "'A+' Grade — Cycle 3 (2023)" },
    {
      title: "NIRF Ranking",
      detail: "Ranked #48 among Engineering Colleges (2024)",
    },
    {
      title: "NBA Accreditation",
      detail: "B.Tech CSE, ECE & Mech accredited by NBA",
    },
    { title: "ISO Certified", detail: "ISO 9001:2015 Certified Institution" },
    {
      title: "Best Campus Award",
      detail: "Awarded by AICTE for Green & Smart Campus (2023)",
    },
    {
      title: "Research Output",
      detail: "200+ publications in SCI journals annually",
    },
  ],
};

export const SEED_COLLEGE_INFO: CollegeInfo = {
  name: "Greenfield Institute of Technology & Science",
  tagline: "Shaping Tomorrow's Innovators Since 1978",
  description:
    "Greenfield Institute of Technology & Science is an autonomous engineering and science institution accredited by NAAC with 'A+' grade. With over 8,000 students and 400 faculty members, GITS is renowned for research excellence, industry partnerships, and a vibrant campus life spread across 120 acres.",
  address: "42, Knowledge Park, Greenfield Road, Bhubaneswar – 751024, Odisha",
  phone: "+91 674 240 8800",
  email: "admissions@gits.edu.in",
  website: "https://www.gits.edu.in",
  established: "1978",
};
