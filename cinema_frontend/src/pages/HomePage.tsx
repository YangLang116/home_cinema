import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link as RouterLink } from 'react-router-dom';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 100px)',
          textAlign: 'center',
          py: 4,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          className="sci-fi-text"
          sx={{
            mb: 3,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #00b4d8 30%, #90e0ef 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 10px rgba(0, 180, 216, 0.5)',
          }}
        >
          欢迎来到家庭影院
        </Typography>

        <Typography
          variant="h5"
          sx={{
            mb: 4,
            maxWidth: '800px',
            color: 'text.secondary',
          }}
        >
          探索大量优质电影与电视剧，尽享高品质家庭观影体验
        </Typography>

        <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              component={RouterLink}
              to="/movie"
              variant="contained"
              size="large"
              startIcon={<MovieIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '30px',
                fontSize: '1.2rem',
                boxShadow: '0 0 15px rgba(0, 180, 216, 0.5)',
                background: 'linear-gradient(45deg, #1E3A8A 30%, #2563EB 90%)',
                border: '2px solid #00b4d8',
                color: 'white',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 0 20px rgba(0, 180, 216, 0.8)',
                },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              浏览电影
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              component={RouterLink}
              to="/tvshow"
              variant="contained"
              size="large"
              startIcon={<TvIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '30px',
                fontSize: '1.2rem',
                boxShadow: '0 0 15px rgba(0, 180, 216, 0.5)',
                background: 'linear-gradient(45deg, #9D174D 30%, #DB2777 90%)',
                border: '2px solid #00b4d8',
                color: 'white',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 0 20px rgba(0, 180, 216, 0.8)',
                },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              浏览电视剧
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage; 