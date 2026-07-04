# Development & Build Guide

## Quick Start

### Running the Project Locally

1. **Backend Development Server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   - Runs on: `http://localhost:5000`
   - Watches for file changes automatically with nodemon

2. **Frontend Development Server** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   - Runs on: `http://localhost:5173`
   - Hot reload enabled

### Building for Production

**Frontend Build:**
```bash
cd frontend
npm run build
```
- Output: `frontend/dist/` folder
- Minified and optimized for production

## Common Commands

| Command | Directory | Purpose |
|---------|-----------|---------|
| `npm install` | backend / frontend | Install dependencies |
| `npm run dev` | backend / frontend | Start development server |
| `npm run build` | frontend | Build for production |
| `npm run preview` | frontend | Preview production build |

## Troubleshooting

### Port Already in Use
- Backend (5000): Kill process or change PORT in .env
- Frontend (5173): Vite will automatically use next available port

### CORS Errors
- Ensure backend is running on port 5000
- Check CORS configuration in `backend/src/index.js`

### Module Not Found
- Run `npm install` in the respective directory
- Clear `node_modules` and reinstall if issues persist

## Next Steps

1. Customize portfolio content in `backend/src/controllers/portfolioController.js`
2. Add database integration with MySQL
3. Implement authentication if needed
4. Deploy to production (Vercel, Netlify, Heroku, etc.)
