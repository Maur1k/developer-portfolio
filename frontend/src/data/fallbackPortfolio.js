export const fallbackProfile = {
  name: 'Maurik Angelo L. Fernandez',
  professionalTitle: 'Software Developer',
  subtitle: 'Full Stack · Web · Mobile',
  headline: 'I build things, break things, and figure out how to make them work.',
  heroDescription:
    "Hi, I'm Maurik Angelo L. Fernandez, a software developer specializing in full-stack web and mobile development.",
  bioSecondary:
    "I've worked on production applications across web, Android, and iOS, with experience spanning frontend development, backend services, REST APIs, databases, payments, notifications, and administrative systems.",
  bioTertiary:
    "I work primarily with React, Flutter, Node.js, Laravel, PHP, MySQL, Firebase, and REST APIs, while using AI-assisted and agentic workflows to make development faster without losing control of the engineering behind it.",
  aboutTitle: 'Building software, learning fast, and figuring things out along the way.',
  aboutMe:
    "Hi, I'm Maurik Angelo L. Fernandez — a Software Developer from Urdaneta City, Pangasinan.\n\nI recently graduated with a BS Information Technology degree specializing in Web and Mobile Technologies from Pangasinan State University – Urdaneta Campus, but my journey into software development didn't stop at the classroom. I enjoy taking what I learn and turning it into something that actually works — whether that's a web application, a mobile app, an API, or a system that solves a real problem.\n\nMy professional experience started as a Full Stack Web Developer Intern at When in Baguio Inc., where I worked on production systems and eventually continued with the team as a Contractual Software Developer.\n\nSince then, I've worked across web, Android, and iOS, contributing to features that involve backend services, REST APIs, databases, payments, notifications, administrative tools, and mobile applications.\n\nI'm also interested in how software development itself is changing. I use tools such as Cursor, Claude, ChatGPT, GitHub Copilot, and Codex alongside agentic workflows to research, prototype, debug, automate repetitive work, and move from an idea to a working implementation faster. I don't see AI as a replacement for understanding the code — I use it as another tool in the engineering process while I remain responsible for the decisions, architecture, testing, and final result.\n\nI like solving problems that don't always have an obvious answer. Sometimes that means debugging an API. Sometimes it's figuring out why a mobile build won't cooperate. Sometimes it's learning an entirely new tool because the project needs it. That's what I enjoy most about development: there is always something new to figure out.",
  profilePhoto: '/img/Fernandez_Maurik_Angelo_L.jpg',
  resumeUrl: '/files/Resume.jpg',
  location: 'Urdaneta City, Pangasinan',
  availability: 'Open to Opportunities',
  tagline: 'build. break. learn. repeat.',
  socialLinks: {
    linkedin: 'https://www.linkedin.com/in/maurik-angelo-fernandez-ab835716a/',
    github: 'https://github.com/Maur1k',
    jobstreet: 'https://ph.jobstreet.com/profiles/maurikangelo-fernandez-7mNlX0tM26',
  },
  contact: {
    email: 'maurikfernandez123@gmail.com',
    phone: '+63 927 797 5100',
    portfolioUrl: '',
  },
  approach: [
    { title: 'Curious', description: 'Always learning something new.' },
    { title: 'Practical', description: 'I build for real problems, not just demos.' },
    { title: 'Full Stack', description: 'From interface to API to database.' },
    { title: 'AI-Assisted', description: 'Using AI to move faster, think deeper, and automate the repetitive.' },
  ],
  stackBreakdown: {
    frontend: ['React', 'React Native', 'JavaScript', 'TypeScript'],
    mobile: ['Flutter', 'Dart', 'Android', 'iOS'],
    backend: ['Node.js', 'Express', 'Laravel', 'PHP', 'REST APIs'],
    data: ['MySQL', 'Firebase', 'Firestore'],
  },
};

export const fallbackProjects = [
  {
    id: 'wibav3',
    title: 'When in Baguio (WIBE)',
    name: 'When in Baguio (WIBE)',
    subtitle: 'From code to something people actually use.',
    tagline: 'Production · Food Delivery Platform',
    shortDescription:
      'A production food delivery platform built for Baguio City, supporting customer ordering, restaurant operations, delivery workflows, payments, notifications, and administrative management.',
    longDescription:
      'WIBE is a production food delivery platform built for Baguio City, with applications and systems spanning customer ordering, payments, delivery workflows, notifications, and administration. I contributed across the stack — from web and mobile features to backend services, APIs, databases, integrations, and internal tools. This project gave me experience beyond simply building features: working with existing systems, debugging production issues, understanding real requirements, and shipping software that has to work for actual users.',
    description:
      'WIBE is a production food delivery platform built for Baguio City, with applications and systems spanning customer ordering, payments, delivery workflows, notifications, and administration.',
    summary:
      'A production food delivery platform built for Baguio City, supporting customer ordering, restaurant operations, delivery workflows, payments, notifications, and administrative management.',
    category: 'Production · Food Delivery · Web & Mobile',
    status: 'Production',
    repositoryUrl: '',
    liveDemoUrl: '',
    appStoreUrl: 'https://apps.apple.com/ph/app/when-in-baguio-eat/id1524156193',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.wheninbaguio.wibapp&hl=en',
    featured: true,
    displayOrder: 1,
    thumbnailImage: '/projects/wibav3/overview.png',
    technologies: ['React Native', 'Node.js', 'Express', 'MySQL', 'Firebase', 'REST APIs'],
    highlights: [
      'Production food ordering and delivery workflows used by real customers',
      'Payment and checkout integrations with localized flow handling',
      'Push notification systems for real-time order and dispatch updates',
      'Administrative dashboards, merchant portal, and order management',
      'Backend services, REST APIs, and database-driven data architecture',
      'Cross-platform mobile engineering across Android and iOS',
    ],
    galleryImages: [
      '/projects/wibav3/overview.png',
      '/projects/wibav3/feature1.png',
      '/projects/wibav3/feature2.png',
      '/projects/wibav3/feature3.png',
      '/projects/wibav3/restaurants.png',
      '/projects/wibav3/ordering.png',
      '/projects/wibav3/checkout.png',
    ],
    screenshots: [
      { src: '/projects/wibav3/overview.png', alt: 'WIBE App Overview', title: 'Overview' },
      { src: '/projects/wibav3/feature1.png', alt: 'WIBE App Features 1', title: 'Features 1' },
      { src: '/projects/wibav3/feature2.png', alt: 'WIBE App Features 2', title: 'Features 2' },
      { src: '/projects/wibav3/feature3.png', alt: 'WIBE App Features 3', title: 'Features 3' },
      { src: '/projects/wibav3/restaurants.png', alt: 'WIBE App Restaurants', title: 'Restaurants' },
      { src: '/projects/wibav3/ordering.png', alt: 'WIBE App Ordering', title: 'Ordering' },
      { src: '/projects/wibav3/checkout.png', alt: 'WIBE App Checkout', title: 'Checkout' },
    ],
    problem:
      'Baguio City required a specialized localized food delivery infrastructure handling distinct mountain city geography, multi-tier restaurant menus, rider tracking, and reliable checkout for thousands of active local customers.',
    solution:
      'Delivered end-to-end production features spanning customer mobile apps on iOS and Android, backend microservices, real-time push notifications, payment processor integrations, and operational administration consoles.',
    features: [
      'Customer app (iOS / Android)',
      'Rider delivery tracking & dispatch',
      'Merchant & restaurant ordering portal',
      'Admin dashboard & analytics',
      'Secure payment processing',
      'Real-time push notifications',
    ],
    contributions: [
      'Developed and maintained features across web, Android, and iOS applications',
      'Built and integrated backend services and REST APIs for core delivery flows',
      'Implemented payment and checkout functionality',
      'Developed push notification and communication features',
      'Built administrative dashboards and database-driven systems',
      'Worked with MySQL and Firebase-backed services',
    ],
  },
  {
    id: 'click2serve',
    title: 'CLICK2SERVE: Smart Municipal Information Kiosk',
    name: 'CLICK2SERVE: Smart Municipal Information Kiosk',
    subtitle: 'AI-assisted municipal service platform',
    tagline: 'Completed · Civic Technology · Web Platform',
    shortDescription:
      'An AI-assisted municipal information and service platform designed to make local government services easier to discover and access.',
    longDescription:
      'An AI-assisted municipal information and service platform designed to make local government services easier to discover and access. The system provides residents with a self-service experience for exploring municipal information, requesting services, managing bookings, and tracking queue progress.',
    description:
      'An AI-assisted municipal information and service platform designed to make local government services easier to discover and access.',
    summary:
      'An AI-assisted municipal information and service platform designed to make local government services easier to discover and access through self-service kiosks and web portals.',
    category: 'Completed · Civic Technology · Web Platform',
    status: 'Completed',
    repositoryUrl: '',
    liveDemoUrl: '',
    featured: true,
    displayOrder: 2,
    thumbnailImage: '/projects/click2serve/Kiosk Homescreen.png',
    technologies: ['Laravel', 'PHP', 'JavaScript', 'MySQL'],
    highlights: [
      'Municipal information and service discovery',
      'Service request and booking workflows',
      'Queue tracking and ticket status',
      'Self-service kiosk touch interface',
      'Database-driven administration',
      'AI-assisted development workflow',
    ],
    galleryImages: [
      '/projects/click2serve/Kiosk Splash Screen.png',
      '/projects/click2serve/Kiosk Homescreen.png',
      '/projects/click2serve/Kiosk 3Dmap Screen.png',
      '/projects/click2serve/Kiosk Chatbot Screen.png',
      '/projects/click2serve/Kiosk Tracker Screen.png',
      '/projects/click2serve/Kiosk Services Screen.png',
      '/projects/click2serve/Kiosk MunicipalInfo Screen.png',
      '/projects/click2serve/Kiosk MunicipalInfo Screen 2.png',
      '/projects/click2serve/Website Homescreen.png',
      '/projects/click2serve/Website Booking.png',
      '/projects/click2serve/Website Chatbot Screen.png',
      '/projects/click2serve/Website Tracker Screen.png',
      '/projects/click2serve/Officer Dashboard.png',
      '/projects/click2serve/Super Admin Dashboard.png',
    ],
    screenshots: [
      { src: '/projects/click2serve/Kiosk Splash Screen.png', alt: 'Click2Serve splash screen', title: 'Splash' },
      { src: '/projects/click2serve/Kiosk Homescreen.png', alt: 'Click2Serve home dashboard', title: 'Kiosk Home' },
      { src: '/projects/click2serve/Kiosk 3Dmap Screen.png', alt: 'Click2Serve map interface', title: '3D Map' },
      { src: '/projects/click2serve/Kiosk Chatbot Screen.png', alt: 'Click2Serve chatbot interface', title: 'Chatbot' },
      { src: '/projects/click2serve/Kiosk Tracker Screen.png', alt: 'Click2Serve service tracker', title: 'Tracker' },
      { src: '/projects/click2serve/Kiosk Services Screen.png', alt: 'Click2Serve services page', title: 'Services' },
      { src: '/projects/click2serve/Kiosk MunicipalInfo Screen.png', alt: 'Click2Serve municipal info', title: 'Municipal Info' },
      { src: '/projects/click2serve/Website Homescreen.png', alt: 'Click2Serve web portal', title: 'Web Portal' },
      { src: '/projects/click2serve/Website Booking.png', alt: 'Click2Serve online booking', title: 'Booking' },
      { src: '/projects/click2serve/Officer Dashboard.png', alt: 'Click2Serve officer dashboard', title: 'Officer Dashboard' },
      { src: '/projects/click2serve/Super Admin Dashboard.png', alt: 'Click2Serve super admin', title: 'Admin Console' },
    ],
    problem:
      'Citizens frequently faced long waiting queues and confusion when finding relevant municipal offices, prerequisites, and filing requirements at the city hall.',
    solution:
      'Engineered an interactive touchscreen kiosk and synced web portal with self-service request queues, interactive 3D department navigation, automated assistant chatbots, and officer dispatch boards.',
    features: [
      'Self-service kiosk interface',
      'Citizen online booking portal',
      'Live queue number tracker',
      'Officer service processing dashboard',
      'Municipal department directory',
      'AI chatbot FAQ resolution',
    ],
    contributions: [
      'Architected service request and queue management backend workflows in Laravel',
      'Designed responsive UI screens for high-resolution municipal kiosks',
      'Integrated live database sync for ticket verification and department dispatch',
      'Implemented officer and super-admin administrative management dashboards',
    ],
  },
  {
    id: 'client-project-tracker',
    title: 'ProjeX — Client Project Management',
    name: 'ProjeX',
    subtitle: 'Full Stack · SaaS-style Dashboard',
    tagline: 'Technical Assessment · Full Stack Web Application',
    shortDescription:
      'A full-stack client project management app built with Laravel 12, React + TypeScript, and MySQL — featuring a clean SaaS-style dashboard with real-time validation, status and priority badges, and full error/loading state handling.',
    longDescription:
      'ProjeX is a full-stack client project management app built with Laravel 12, React + TypeScript, and MySQL. It features a clean SaaS-style dashboard for creating, viewing, editing, and deleting client engagements — complete with real-time client-side validation, server-side form request validation, status and priority badges, and full error/loading state handling. The architecture follows a clean decoupled pattern: a REST API backend served by Laravel and a React frontend powered by Vite and Axios, with Tailwind CSS v4 for styling.',
    description:
      'ProjeX is a full-stack client project management app built with Laravel 12, React + TypeScript, and MySQL. Features a clean SaaS-style dashboard with CRUD operations, real-time validation, status and priority badges, and full error/loading state handling.',
    summary:
      'A full-stack client project management system with a clean SaaS-style dashboard, REST API backend, real-time validation, status and priority tracking, and a fully decoupled React + TypeScript frontend.',
    category: 'Technical Assessment · Full Stack Web Application',
    status: 'Completed',
    repositoryUrl: 'https://github.com/Maur1k',
    liveDemoUrl: '',
    featured: true,
    displayOrder: 3,
    thumbnailImage: '/projects/project-management-crud/Dashboard.png',
    technologies: ['Laravel 12', 'PHP', 'MySQL', 'React', 'TypeScript', 'Vite', 'Axios', 'Tailwind CSS v4', 'REST API'],
    highlights: [
      'SaaS-style dashboard with full CRUD operations',
      'Real-time client-side & server-side validation',
      'Status and priority badge system',
      'Full error/loading state handling',
      'Decoupled REST API + React frontend architecture',
      'Tailwind CSS v4 responsive design system',
    ],
    galleryImages: [
      '/projects/project-management-crud/Dashboard.png',
    ],
    screenshots: [
      { src: '/projects/project-management-crud/Dashboard.png', alt: 'ProjeX Dashboard', title: 'Dashboard' },
    ],
    problem:
      'Managing multiple client engagements requires clear project association, status pipelines, priority tracking, and a clean responsive interface — without the overhead of bloated tooling.',
    solution:
      'Built ProjeX with a fully decoupled architecture: Laravel 12 REST API backend with server-side form request validation, and a React + TypeScript frontend powered by Vite and Axios — with Tailwind CSS v4 for rapid, consistent UI styling.',
    features: [
      'Create, view, edit, and delete client engagements',
      'Real-time client-side validation with React',
      'Server-side form request validation via Laravel',
      'Status and priority badge system',
      'Full error and loading state handling',
      'Axios-powered REST API communication',
      'Tailwind CSS v4 responsive UI',
    ],
    contributions: [
      'Architected a clean decoupled Laravel 12 REST API with form request validation',
      'Built a type-safe React + TypeScript frontend with real-time validation',
      'Implemented status and priority badge tracking across client engagements',
      'Designed full error and loading state handling for all CRUD operations',
      'Styled the entire SaaS-style dashboard using Tailwind CSS v4',
    ],
  },
];

export const fallbackSkills = {
  react: [
    'Interfaces, component systems, and state management',
    'React Native cross-platform mobile architecture',
    'TypeScript & modern JavaScript workflows',
    'Responsive and accessible web design',
  ],
  flutter: [
    'Cross-platform Android and iOS applications',
    'Dart object-oriented development',
    'Mobile UI architecture and lifecycle handling',
    'Native feature and API integration',
  ],
  nodejs: [
    'Backend services, APIs, and server-side logic',
    'Express.js routing and middleware',
    'API integration and data transformation',
    'Authentication and asynchronous workflows',
  ],
  laravel: [
    'Web applications, APIs, and database-driven systems',
    'Eloquent ORM and relationship mapping',
    'Request validation and route controllers',
    'Authentication and authorization mechanisms',
  ],
  mysql: [
    'Relational data modeling and database design',
    'SQL queries, indexing, and optimization',
    'Schema migrations and table relationships',
    'Application storage for production systems',
  ],
  firebase: [
    'Authentication, Firestore, and cloud services',
    'Push notifications for mobile engagement',
    'Cloud Functions and serverless backend triggers',
    'Real-time database synchronizations',
  ],
  restapis: [
    'Connecting systems and third-party integrations',
    'REST API design, JSON contracts, and endpoints',
    'Postman API testing and documentation',
    'Swagger / OpenAPI specification design',
  ],
  aidev: [
    'Cursor, Claude, ChatGPT, GitHub Copilot, Codex, Gemini',
    'Agentic AI engineering and prompt workflows',
    'Accelerated prototyping, testing, and debugging',
    'Automating repetitive coding tasks with developer control',
  ],
};

export const fallbackExperience = [
  {
    id: 'when-in-baguio-contract',
    year: '2026',
    period: '2026 – Present',
    company: 'When in Baguio Inc.',
    location: 'Baguio City / Remote, PH',
    position: 'Contractual Software Developer',
    duration: '2026 – Present',
    leadSummary:
      'Working on the continued development of production web and mobile applications, contributing across frontend, backend, APIs, databases, integrations, and internal systems.',
    description:
      'Working on the continued development of production web and mobile applications, contributing across frontend, backend, APIs, databases, integrations, and internal systems.',
    responsibilities: [
      'Web, Android, and iOS features',
      'Backend services and REST APIs',
      'Payment and checkout workflows',
      'Push notification systems',
      'Administrative dashboards',
      'Database-driven functionality',
      'Debugging and production improvements',
      'AI-assisted development workflows',
    ],
    technologies: ['React', 'React Native', 'Flutter', 'Node.js', 'MySQL', 'Firebase', 'REST APIs'],
    displayOrder: 1,
  },
  {
    id: 'when-in-baguio-intern',
    year: '2026',
    period: 'January 2026 – April 2026',
    company: 'When in Baguio Inc.',
    location: 'Baguio City, PH',
    position: 'Full Stack Web Developer Intern',
    duration: 'January 2026 – April 2026',
    leadSummary:
      'My first professional software development role, where I worked with an existing production codebase and learned what it means to build software beyond the classroom.',
    description:
      'My first professional software development role, where I worked with an existing production codebase and learned what it means to build software beyond the classroom.',
    responsibilities: [
      'Backend and administrative features',
      'React-based interfaces',
      'Node.js services',
      'MySQL databases',
      'API integrations',
      'Payment and checkout workflows',
      'File and data management',
      'Debugging, testing, and optimization',
    ],
    technologies: ['React', 'Node.js', 'MySQL', 'REST APIs', 'Git', 'Postman'],
    displayOrder: 2,
  },
];

export const fallbackEducation = [
  {
    id: 'psu',
    year: '2026',
    period: 'Graduated · July 2026',
    degree: 'BS Information Technology',
    major: 'Major in Web and Mobile Technologies',
    institution: 'Pangasinan State University',
    campus: 'Urdaneta Campus',
    location: 'Urdaneta City, PH',
    duration: 'Graduated · July 2026',
    description:
      'Specialized in Web and Mobile Technologies. Learned fundamental and advanced software engineering principles, algorithms, and practical software design.',
    displayOrder: 1,
  },
];

export const fallbackCertificates = [];

