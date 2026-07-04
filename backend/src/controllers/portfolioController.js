// Portfolio data - Replace with database queries later
const portfolioData = {
  name: 'Maurik Angelo L. Fernandez',
  title: 'Junior Full Stack Developer',
  location: 'Urdaneta City, Pangasinan',
  email: 'maurikfernandez123@gmail.com',
  phone: '+63 9277975100',
  summary: 'Information Technology student specializing in Web and Mobile Technologies with experience in full stack development, backend systems, and web application maintenance.',
  education: {
    degree: 'Bachelor of Science in Information Technology',
    institution: 'Pangasinan State University - Urdaneta Campus',
    major: 'Web and Mobile Technologies',
    expectedGraduation: 'July 2026'
  }
};

const projects = [
  {
    id: 1,
    name: 'CLICK2SERVE: Smart Municipal Information Kiosk',
    description: 'Developed an AI-assisted municipal information kiosk to improve public access to government services.',
    summary: 'An AI-assisted kiosk and web platform that helps residents discover services, book requests, track queue progress, and access municipal information through a clearer self-service experience.',
    category: 'Civic Tech',
    status: 'Completed',
    repositoryUrl: '',
    liveDemoUrl: '',
    problem: 'Residents needed a faster and more approachable way to find municipal services, understand requirements, ask common questions, and track service requests without depending entirely on manual front-desk assistance.',
    solution: 'I helped build a kiosk-first service experience with guided service modules, public information screens, AI-assisted chatbot support, queue tracking, and administrative dashboards for officers and super administrators.',
    technologies: ['PHP', 'Laravel', 'JavaScript', 'MySQL'],
    features: [
      'Service request modules',
      'Queue management',
      'Public information features',
      'Administrative functions'
    ],
    challenges: [
      'Designing a kiosk interface that stays readable from a distance and remains simple for first-time users',
      'Organizing municipal service flows into clear modules without overwhelming users',
      'Connecting citizen-facing screens with administrative workflows and status tracking'
    ],
    contributions: [
      'Built and refined service request workflows for the kiosk and web experience',
      'Implemented public information, chatbot, tracker, and queue-related interface modules',
      'Worked on administrative screens for officer and super admin operations',
      'Improved presentation, navigation, and screenshot-ready UI states across the platform'
    ],
    screenshots: [
      { src: '/projects/click2serve/Kiosk Splash Screen.png', alt: 'Click2Serve splash screen', title: 'Splash' },
      { src: '/projects/click2serve/Kiosk Homescreen.png', alt: 'Click2Serve home dashboard', title: 'Home' },
      { src: '/projects/click2serve/Kiosk 3Dmap Screen.png', alt: 'Click2Serve map interface', title: 'Map' },
      { src: '/projects/click2serve/Kiosk Chatbot Screen.png', alt: 'Click2Serve chatbot interface', title: 'Chatbot' },
      { src: '/projects/click2serve/Kiosk Tracker Screen.png', alt: 'Click2Serve service tracker', title: 'Tracker' },
      { src: '/projects/click2serve/Kiosk Services Screen.png', alt: 'Click2Serve services page', title: 'Services' },
      { src: '/projects/click2serve/Kiosk MunicipalInfo Screen.png', alt: 'Click2Serve municipal information screen', title: 'Info' },
      { src: '/projects/click2serve/Kiosk MunicipalInfo Screen 2.png', alt: 'Click2Serve municipal tourism information screen', title: 'Info 2' },
      { src: '/projects/click2serve/Website Homescreen.png', alt: 'Click2Serve website home screen', title: 'Website Home' },
      { src: '/projects/click2serve/Website Booking.png', alt: 'Click2Serve website booking screen', title: 'Booking' },
      { src: '/projects/click2serve/Website Chatbot Screen.png', alt: 'Click2Serve website chatbot screen', title: 'Web Chat' },
      { src: '/projects/click2serve/Website Tracker Screen.png', alt: 'Click2Serve website tracker screen', title: 'Web Track' },
      { src: '/projects/click2serve/Officer Dashboard.png', alt: 'Click2Serve officer dashboard', title: 'Officer' },
      { src: '/projects/click2serve/Super Admin Dashboard.png', alt: 'Click2Serve super admin dashboard', title: 'Admin' }
    ]
  }
];

const skills = {
  programming: ['PHP', 'JavaScript', 'Java', 'React', 'Node.js'],
  frameworks: ['Laravel', 'Express.js', 'Firebase', 'REST API'],
  database: ['MySQL', 'Firebase Firestore'],
  tools: ['Git', 'GitHub', 'Postman', 'VS Code', 'AI-Assisted Development Tools']
};

const experience = [
  {
    id: 1,
    company: 'When in Baguio Inc.',
    position: 'Full Stack Web Developer Intern',
    duration: 'January 2026 - April 2026',
    responsibilities: [
      'Developed and maintained backend features and administrative modules using React, Node.js, and MySQL',
      'Enhanced dashboard functionality by implementing content management features',
      'Assisted in implementing and optimizing payment and checkout workflows',
      'Built and maintained file upload and data management functionality',
      'Performed debugging, testing, and performance optimization'
    ]
  }
];

export const getPortfolioData = (req, res) => {
  try {
    res.json(portfolioData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjects = (req, res) => {
  try {
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSkills = (req, res) => {
  try {
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const contactForm = (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // TODO: Save to database and send email
    console.log('Contact form submission:', { name, email, message });
    
    res.json({ 
      success: true, 
      message: 'Thank you for your message. I will get back to you soon!' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
