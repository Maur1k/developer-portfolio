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
    id: 'backops-wib',
    title: 'When in Baguio (WIBE) — Operations & Dispatch Platform',
    name: 'When in Baguio — Operations & Dispatch Platform',
    subtitle: 'Hyperlocal Logistics & Operations Command Center',
    tagline: 'Production · Operations & Logistics Command Center',
    shortDescription:
      'The operations command center behind Baguio City’s food delivery network — engineered with React 19, Node.js, and MySQL to give dispatchers real-time order tracking, sub-100ms loading speeds, instant push notifications, and accurate financial settlements.',
    longDescription:
      'When in Baguio (WIBE) serves as Baguio City\'s premier hyperlocal food delivery service. Behind the customer mobile app is the BackOps & Dispatch Platform — the mission control center where dispatchers assign motorcycle couriers, monitor live orders, calculate mountain delivery surcharges, track store commissions, and manage delivery zones across the city. As a Full-Stack Engineer, I engineered the V2 Operations Dashboard in React 19, modernized backend REST APIs in Node.js, eliminated push notification drop-offs via FCM HTTP v1 token normalization, and optimized database queries down to sub-100ms response times with keyset pagination and LRU caching.',
    description:
      'The operations command center behind Baguio City’s food delivery network — engineered with React 19, Node.js, and MySQL to give dispatchers real-time order tracking, sub-100ms loading speeds, instant push notifications, and accurate financial settlements.',
    summary:
      'The operations command center behind Baguio City’s food delivery network — engineered with React 19, Node.js, and MySQL to give dispatchers real-time order tracking, sub-100ms loading speeds, instant push notifications, and accurate financial settlements.',
    category: 'Production · BackOps & Logistics · Web Platform',
    status: 'Production',
    repositoryUrl: '',
    liveDemoUrl: '',
    appStoreUrl: '',
    playStoreUrl: '',
    featured: true,
    displayOrder: 1,
    thumbnailImage: '/projects/backops-wib/Dashboard.png',
    technologies: ['React 19', 'Vite', 'Node.js', 'Express', 'MySQL', 'Firebase Cloud Messaging (FCM)', 'PayMongo', 'Leaflet GIS', 'Recharts'],
    highlights: [
      'Real-time order dispatch board built with React 19 & Vite for live kitchen-to-rider tracking',
      'Sub-100ms dashboard queries via keyset pagination & LRU caching during peak lunch/dinner rushes',
      'High-reliability FCM HTTP v1 push pipeline ensuring zero dropped notifications to customer phones',
      'Automated financial engine for exact merchant commissions, per-item packaging, and digital receipts',
      'Interactive geospatial delivery zone mapping and mountain route surcharge configuration (Leaflet GIS)',
      'Instant payment verification for GCash, Maya, and cards via automated PayMongo webhooks',
    ],
    results: [
      'Sub-100ms Page Loads: Over 80% reduction in query latency during peak rush hours',
      '99.5%+ Push Reliability: Zero dropped order lifecycle alerts across legacy and modern devices',
      '100% Financial Accuracy: Automated calculation of merchant commissions and itemized packaging',
      'Live Dispatch Efficiency: Geospatial polygon boundary mapping preventing out-of-zone errors',
    ],
    galleryImages: [
      '/projects/backops-wib/Dashboard.png',
      '/projects/backops-wib/Dashboard-Darkmode.png',
      '/projects/backops-wib/Login.png',
    ],
    screenshots: [
      { src: '/projects/backops-wib/Dashboard.png', alt: 'When in Baguio BackOps Operations Dashboard', title: 'Operations Dashboard (Light)' },
      { src: '/projects/backops-wib/Dashboard-Darkmode.png', alt: 'When in Baguio BackOps Operations Dashboard Dark Mode', title: 'Operations Dashboard (Dark)' },
      { src: '/projects/backops-wib/Login.png', alt: 'When in Baguio BackOps Secure Authentication Portal', title: 'Admin & Merchant Login' },
    ],
    problem:
      'Operating a high-demand delivery service in a mountainous city faced severe operational bottlenecks: dashboards lagged under peak order volume, push notifications intermittently failed to alert customers, and complex mountain delivery surcharges and packaging fees led to manual calculation errors.',
    solution:
      'Engineered the V2 BackOps platform with sub-100ms keyset pagination, token-normalized FCM HTTP v1 push pipelines for 100% notification delivery, interactive Leaflet polygon zone mapping, and automated PayMongo payment settlement.',
    features: [
      'Live real-time order & courier dispatch board',
      'FCM HTTP v1 multi-platform push notification engine',
      'Geospatial delivery zone & boundary editor (Leaflet GIS)',
      'Sales velocity & operational analytics (Recharts)',
      'Automated PayMongo payment webhook reconciliation',
      'Itemized dynamic packaging & commission formula engine',
    ],
    contributions: [
      'Architected and built the React 19 V2 operations, dispatch, and merchant administration dashboard',
      'Modernized backend REST APIs in Node.js/Express, refactoring legacy endpoints with zero downtime',
      'Optimized MySQL relational queries using compound indexing, keyset pagination, and LRU in-memory caching',
      'Built a high-reliability dual-target FCM HTTP v1 notification dispatch system with token normalization',
      'Engineered deterministic financial formula engines for dynamic per-item packaging and merchant commissions',
      'Implemented interactive geospatial polygon delivery zones and surcharges using Leaflet and React-Leaflet',
    ],
  },
  {
    id: 'wibav3',
    title: 'When In Baguio Eats — Customer Mobile App',
    name: 'When in Baguio (WIBE)',
    subtitle: 'Baguio City Food Discovery & Delivery App (V2 Upgrade)',
    tagline: 'Production · Mobile App Upgrade (iOS / Android)',
    shortDescription:
      'A major V2 upgrade of Baguio City’s customer food ordering app — re-architected in Flutter for 60,000+ existing users with persistent cart state, Google Maps/Leaflet GIS restaurant discovery, instant GCash payments, and 99.2% crash-free stability.',
    longDescription:
      'When In Baguio Eats serves as Baguio City\'s premier hyperlocal food ordering platform. I worked on the major V2 modernization and upgrade of the customer mobile app on iOS and Android (retaining the When in Baguio brand across 60,000+ existing users) — replacing legacy session limits with a modern Flutter architecture, real-time push notifications, map-based restaurant discovery, secure GCash/PayMongo checkout, and persistent cart state management.',
    description:
      'A major V2 upgrade of Baguio City’s customer food ordering app — re-architected in Flutter for 60,000+ existing users with persistent cart state, Google Maps/Leaflet GIS restaurant discovery, instant GCash payments, and 99.2% crash-free stability.',
    summary:
      'A major V2 upgrade of Baguio City’s customer food ordering app — re-architected in Flutter for 60,000+ existing users with persistent cart state, Google Maps/Leaflet GIS restaurant discovery, instant GCash payments, and 99.2% crash-free stability.',
    category: 'Production · Mobile App Upgrade · iOS / Android',
    status: 'Production',
    repositoryUrl: '',
    liveDemoUrl: '',
    appStoreUrl: 'https://apps.apple.com/ph/app/when-in-baguio-eat/id1524156193',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.wheninbaguio.wibapp&hl=en',
    featured: false,
    displayOrder: 2,
    thumbnailImage: '/projects/wibav3/overview.png',
    technologies: ['Flutter', 'Dart', 'Provider', 'Google Maps', 'Leaflet GIS', 'Firebase Cloud Messaging (FCM)', 'PayMongo (GCash)', 'REST APIs', 'iOS', 'Android'],
    highlights: [
      'Major V2 Upgrade for iOS & Android in Flutter adapting to 6+ screen sizes with persistent sessions',
      'Real-time Firebase Cloud Messaging (FCM) push notifications with local scheduling & deep-linking',
      'Geospatial Leaflet/Google Maps delivery zone mapping, address autocomplete, & distance surcharge calculations',
      'Secure GCash/PayMongo payment flow with dynamic QR generation & webhook verification',
      'Provider state management with offline-first cart persistence reducing perceived latency by 40%',
      'High stability with 99.2% crash-free rate across 60,000+ user installs in production',
    ],
    results: [
      'Rolled out to 60,000+ existing users on Google Play & App Store maintaining 4.7+ star rating',
      '99.2% Crash-Free Rate achieved after deploying the modernized Flutter codebase',
      '40% Faster Cart Operations via local caching & state persistence',
      '80% Order Completion Rate with streamlined 3-step checkout',
      '<500ms API Response Times via request batching & query optimization',
      '95%+ Push Notification Delivery with reliable multi-layer fallbacks',
    ],
    galleryImages: [
      '/projects/wibav3/overview.png',
      '/projects/wibav3/restaurants.png',
      '/projects/wibav3/ordering.png',
      '/projects/wibav3/checkout.png',
      '/projects/wibav3/feature1.png',
      '/projects/wibav3/feature2.png',
      '/projects/wibav3/feature3.png',
    ],
    screenshots: [
      { src: '/projects/wibav3/overview.png', alt: 'When in Baguio Eats Customer Mobile App Overview', title: 'App Overview' },
      { src: '/projects/wibav3/restaurants.png', alt: 'Restaurant Discovery & Category Browsing', title: 'Restaurant Discovery' },
      { src: '/projects/wibav3/ordering.png', alt: 'Food Item Addons & Custom Ordering', title: 'Food Item & Addons' },
      { src: '/projects/wibav3/checkout.png', alt: '3-Step Checkout & GCash QR Payment', title: 'Checkout & Payment' },
      { src: '/projects/wibav3/feature1.png', alt: 'Real-Time Order Tracking & Status', title: 'Live Order Tracking' },
      { src: '/projects/wibav3/feature2.png', alt: 'Cart Persistence & Session Management', title: 'Cart Management' },
      { src: '/projects/wibav3/feature3.png', alt: 'Push Notifications & Multi-Channel Alerts', title: 'Push Alerts' },
    ],
    problem:
      'Customers in Baguio City experienced cart resets when switching apps, unclear visibility on which restaurants delivered to their specific mountain zone, manual payment delays, and missed delivery alerts.',
    solution:
      'Engineered a modern Flutter app with Provider-based cart persistence that never loses uncommitted orders, polygon GIS delivery zone validation, automated GCash QR payments, and deep-linked FCM push notifications.',
    features: [
      'Responsive Restaurant Discovery Engine with real-time availability badges & category filtering',
      'Interactive Google Maps & Leaflet GIS location services with polygon delivery zone previews',
      'Firebase Cloud Messaging push notification pipeline with deep-linking to live order details',
      '3-step secure checkout with GCash QR generation & PayMongo webhook reconciliation',
      'Provider-based persistent cart with automatic device serialization & token auto-refresh',
      'Offline-first caching layer reducing API latency by 40%',
    ],
    contributions: [
      'Architected responsive Flutter UI system supporting phones and tablets with 40+ reusable widgets',
      'Designed Provider state management architecture with automatic cart persistence and session refresh',
      'Built ApiService singleton with timeout management, retry logic, and offline-first caching',
      'Integrated Google Maps and Leaflet GIS with point-in-polygon delivery validation and Haversine distance calculations',
      'Engineered FCM push notification setup with deep-linking and local notification caching',
      'Integrated PayMongo payment gateway with secure GCash QR code generation and receipt PDF export',
      'Optimized app startup time by 35% through lazy-loading and achieved 99.2% crash-free rate',
    ],
  },
  {
    id: 'click2serve',
    title: 'CLICK2SERVE: Smart Municipal Information Kiosk',
    name: 'CLICK2SERVE: Smart Municipal Information Kiosk',
    subtitle: 'Smart City Hall Self-Service Kiosk & Citizen Web Portal',
    tagline: 'Completed · Civic Technology · Web & Kiosk Platform',
    shortDescription:
      'An AI-assisted touchscreen kiosk and companion web portal deployed in city hall lobbies to help citizens discover municipal services, navigate building departments in 3D, ask questions to an AI assistant, and track queue tickets in real time.',
    longDescription:
      'Visiting government offices often involves long waiting lines and confusion over requirements and office locations. CLICK2SERVE is an AI-assisted municipal information kiosk and citizen web portal that simplifies city hall visits. Citizens can check required documents, explore an interactive 3D floor map, ask an AI assistant questions in plain language, book appointments, and track their queue numbers directly from their phones.',
    description:
      'An AI-assisted touchscreen kiosk and companion web portal deployed in city hall lobbies to help citizens discover municipal services, navigate building departments in 3D, ask questions to an AI assistant, and track queue tickets in real time.',
    summary:
      'An AI-assisted touchscreen kiosk and companion web portal deployed in city hall lobbies to help citizens discover municipal services, navigate building departments in 3D, ask questions to an AI assistant, and track queue tickets in real time.',
    category: 'Completed · Civic Technology · Web Platform',
    status: 'Completed',
    repositoryUrl: '',
    liveDemoUrl: '',
    featured: false,
    displayOrder: 3,
    thumbnailImage: '/projects/click2serve/Kiosk Homescreen.png',
    technologies: ['Laravel', 'PHP', 'JavaScript', 'MySQL', 'Tailwind CSS', '3D Floor Maps', 'AI Assistant'],
    highlights: [
      'Touchscreen lobby kiosk designed with high-contrast, accessible UI for citizens of all ages',
      'Interactive 3D building floor plan guiding visitors floor-by-floor to the exact office window',
      'AI-powered municipal assistant answering common civic inquiries in English and Tagalog 24/7',
      'Live queue management engine with mobile ticket tracking and officer dispatch consoles',
      'Online citizen appointment booking synced with physical walk-in department queues',
      'Secure role-based administration with audit logging in Laravel and MySQL',
    ],
    results: [
      'Self-Service Civic Information: Drastically reduces repetitive inquiries at city hall front desks',
      'Organized Queue Flow: Citizens monitor queue progress on their mobile phones while waiting comfortably',
      'Omnichannel Access: Seamlessly links physical lobby touchscreens with the online citizen booking portal',
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
      'Citizens regularly face long waiting queues and confusion finding required documents, fee schedules, and specific departmental offices across multi-story government buildings, placing heavy repetitive inquiry burdens on front-desk staff.',
    solution:
      'Engineered an interactive touchscreen kiosk and companion web portal featuring guided document checklists, interactive 3D building navigation, an AI municipal FAQ assistant, and live mobile queue tracking.',
    features: [
      'Self-service touchscreen kiosk interface',
      'Citizen online booking & appointment portal',
      'Live queue number tracking on mobile phones',
      'Officer service processing dashboard',
      'Interactive 3D municipal department directory',
      'AI chatbot for 24/7 FAQ resolution',
    ],
    contributions: [
      'Architected service request and queue management backend workflows in Laravel',
      'Designed responsive UI screens for high-resolution municipal kiosks',
      'Integrated live database sync for ticket verification and department dispatch',
      'Implemented officer and super-admin administrative management dashboards',
    ],
  },
];

export const fallbackPlaygroundProjects = [
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
    category: 'Technical Assessment · Full Stack App',
    status: 'Completed',
    projectType: 'playground',
    repositoryUrl: 'https://github.com/Maur1k',
    liveDemoUrl: '',
    featured: false,
    displayOrder: 1,
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
  {
    id: 'playground-placeholder',
    title: 'More coming soon',
    name: 'More coming soon',
    subtitle: 'Playground · Personal',
    shortDescription: 'Small experiments, school projects, and side builds will appear here as I continue building.',
    description: 'Small experiments, school projects, and side builds.',
    summary: 'Small experiments, school projects, and side builds will appear here.',
    category: 'Playground',
    status: 'In Progress',
    projectType: 'playground',
    displayOrder: 2,
    technologies: [],
    highlights: [],
    galleryImages: [],
    screenshots: [],
    repositoryUrl: '',
    liveDemoUrl: '',
    featured: false,
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

