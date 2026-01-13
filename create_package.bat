@echo off
(
echo {
echo   "name": "hotel-ops-reports",
echo   "version": "0.1.0",
echo   "private": true,
echo   "dependencies": {
echo     "@supabase/supabase-js": "^2.39.0",
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0",
echo     "react-router-dom": "^6.18.0",
echo     "react-scripts": "5.0.1",
echo     "web-vitals": "^2.1.4",
echo     "express": "^4.18.2"
echo   },
echo   "scripts": {
echo     "start": "react-scripts start",
echo     "build": "react-scripts build",
echo     "test": "react-scripts test",
echo     "eject": "react-scripts eject",
echo     "server": "node server.js"
echo   },
echo   "eslintConfig": {
echo     "extends": [
echo       "react-app",
echo       "react-app/jest"
echo     ]
echo   },
echo   "browserslist": {
echo     "production": [
echo       ">0.2%%",
echo       "not dead",
echo       "not op_mini all"
echo     ],
echo     "development": [
echo       "last 1 chrome version",
echo       "last 1 firefox version",
echo       "last 1 safari version"
echo     ]
echo   },
echo   "devDependencies": {
echo     "autoprefixer": "^10.4.16",
echo     "postcss": "^8.4.31",
echo     "tailwindcss": "^3.3.5"
echo   }
echo }
) > package.json
echo package.json created successfully!
pause
