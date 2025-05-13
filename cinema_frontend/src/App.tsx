import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './styles/theme';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MediaListPage from './pages/MediaListPage';
import MediaDetailPage from './pages/MediaDetailPage';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/movie" 
            element={<MediaListPage type="movie" title="电影" />} 
          />
          <Route 
            path="/movie/:id" 
            element={<MediaDetailPage type="movie" />} 
          />
          <Route 
            path="/tvshow" 
            element={<MediaListPage type="tvshow" title="电视剧" />} 
          />
          <Route 
            path="/tvshow/:id" 
            element={<MediaDetailPage type="tvshow" />} 
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
