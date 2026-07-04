# Portfolio Website Project

## Project Overview
A responsive Node.js + React portfolio website showcasing Maurik Angelo L. Fernandez's web development work, skills, and projects. Built with Express.js backend and React frontend using Vite and Tailwind CSS.

## Technology Stack
- **Backend**: Node.js, Express.js, MySQL
- **Frontend**: React 18, Vite, Tailwind CSS
- **Database**: MySQL
- **Tools**: Git, Postman, VS Code

## Project Structure
```
Portfolio/
├── backend/              # Express.js server
│   ├── src/
│   │   ├── index.js     # Server entry point
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Database models
│   │   └── middleware/  # Custom middleware
│   ├── package.json
│   └── .env
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Development Workflow
1. Backend runs on http://localhost:5000
2. Frontend dev server runs on http://localhost:5173
3. Frontend communicates with backend via API calls
4. MySQL database configured locally

## Key Features
- Responsive design (mobile-first)
- Portfolio showcase with projects and skills
- Downloadable resume
- Contact information
- Educational background
- Professional experience details
