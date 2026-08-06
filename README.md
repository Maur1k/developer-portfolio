<<<<<<< HEAD
# Maurik's Portfolio Website

A responsive Node.js + React portfolio website showcasing professional experience, projects, and skills with mobile and desktop responsiveness.

## 🚀 Features

- **Responsive Design**: Fully responsive on mobile, tablet, and desktop devices
- **Modern Stack**: React 18, Node.js with Express.js, and Tailwind CSS
- **Dynamic Content**: Backend API serving portfolio data
- **Contact Form**: Functional contact form with validation
- **SEO Optimized**: Meta tags and proper HTML structure
- **Fast Performance**: Optimized with Vite for quick development and production builds

## 📋 Tech Stack

**Backend:**
- Node.js
- Express.js
- CORS enabled
- RESTful API architecture

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- React Router DOM (navigation)
- Axios (HTTP client)

## 📁 Project Structure

```
Portfolio/
├── backend/
│   ├── src/
│   │   ├── index.js           # Server entry point
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Data models
│   │   └── middleware/        # Custom middleware
│   ├── package.json
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── App.jsx            # Main App component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── public/                # Static assets
│   ├── package.json
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   └── index.html             # HTML template
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL (for future database integration)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=portfolio_db
```

4. Start the development server:
```bash
npm run dev
```

The API will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will run on `http://localhost:5173`

## 📡 API Endpoints

- `GET /api/portfolio` - Get portfolio information
- `GET /api/projects` - Get all projects
- `GET /api/skills` - Get skills and expertise
- `POST /api/contact` - Submit contact form

## 🎨 Pages

- **Home** - Hero section with introduction
- **About** - About me and education information
- **Projects** - Showcase of completed projects
- **Skills** - Technical skills and expertise
- **Experience** - Professional experience and internships
- **Contact** - Contact form and information

## 🚀 Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
The backend is already production-ready. Deploy to your hosting platform.

## 🔗 API Configuration

The frontend is configured to proxy API requests to `http://localhost:5000` in development. Update the proxy configuration in `frontend/vite.config.js` for production deployment.

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=portfolio_db
```

## 📞 Contact

- Email: maurikfernandez123@gmail.com
- Phone: +63 9277975100
- Location: Urdaneta City, Pangasinan

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

---

**Made with ❤️ by Maurik Angelo L. Fernandez**
=======
# developer-portfolio
>>>>>>> 8cc91c4d160e90063f92781a59bbcdace1d2fe4a
