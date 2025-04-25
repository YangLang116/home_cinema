import React, { useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Container, useMediaQuery, ClickAwayListener, Paper } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import MenuIcon from '@mui/icons-material/Menu';
import LogoIcon from './LogoIcon';

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // 检查当前路径是否匹配
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // 处理菜单项点击
  const handleMenuItemClick = (path: string) => {
    navigate(path);
    closeMobileMenu();
  };

  // 监听路由变化关闭菜单
  useEffect(() => {
    return () => {
      // 组件卸载时关闭菜单
      setMobileMenuOpen(false);
    };
  }, []);

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textShadow: '0 0 5px #00b4d8',
            }}
          >
            <LogoIcon sx={{ mr: 1, fontSize: 32 }} />
            家庭影院
          </Typography>

          {isMobile ? (
            <>
              <Button
                ref={menuButtonRef}
                color="inherit"
                onClick={toggleMobileMenu}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <MenuIcon />
              </Button>
              {mobileMenuOpen && (
                <ClickAwayListener onClickAway={closeMobileMenu}>
                  <Paper
                    elevation={4}
                    sx={{
                      position: 'absolute',
                      top: '56px',
                      right: '16px',
                      width: '150px',
                      zIndex: 1000,
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <Button
                      fullWidth
                      sx={{ 
                        justifyContent: 'flex-start', 
                        p: 1.5,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                        bgcolor: isActive('/movie') ? 'rgba(0, 180, 216, 0.15)' : 'inherit',
                        fontWeight: isActive('/movie') ? 'bold' : 'normal',
                        '&:hover': {
                          bgcolor: isActive('/movie') ? 'rgba(0, 180, 216, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                        }
                      }}
                      startIcon={<MovieIcon />}
                      onClick={() => handleMenuItemClick('/movie')}
                    >
                      电影
                      {isActive('/movie') && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            left: 0, 
                            top: 0,
                            bottom: 0,
                            width: '4px', 
                            bgcolor: '#00b4d8'
                          }} 
                        />
                      )}
                    </Button>
                    <Button
                      fullWidth
                      sx={{ 
                        justifyContent: 'flex-start',
                        p: 1.5,
                        bgcolor: isActive('/tvshow') ? 'rgba(0, 180, 216, 0.15)' : 'inherit',
                        fontWeight: isActive('/tvshow') ? 'bold' : 'normal',
                        '&:hover': {
                          bgcolor: isActive('/tvshow') ? 'rgba(0, 180, 216, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                        }
                      }}
                      startIcon={<TvIcon />}
                      onClick={() => handleMenuItemClick('/tvshow')}
                    >
                      电视剧
                      {isActive('/tvshow') && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            left: 0, 
                            top: 0,
                            bottom: 0,
                            width: '4px', 
                            bgcolor: '#00b4d8'
                          }} 
                        />
                      )}
                    </Button>
                  </Paper>
                </ClickAwayListener>
              )}
            </>
          ) : (
            <Box sx={{ display: 'flex' }}>
              <Button
                component={RouterLink}
                to="/movie"
                color="inherit"
                sx={{ 
                  mx: 1,
                  position: 'relative',
                  fontWeight: isActive('/movie') ? 'bold' : 'normal',
                  '&::after': isActive('/movie') ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '3px',
                    bgcolor: '#00b4d8',
                    borderRadius: '3px 3px 0 0'
                  } : {}
                }}
                startIcon={<MovieIcon />}
              >
                电影
              </Button>
              <Button
                component={RouterLink}
                to="/tvshow"
                color="inherit"
                sx={{ 
                  mx: 1,
                  position: 'relative',
                  fontWeight: isActive('/tvshow') ? 'bold' : 'normal',
                  '&::after': isActive('/tvshow') ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '3px',
                    bgcolor: '#00b4d8',
                    borderRadius: '3px 3px 0 0'
                  } : {}
                }}
                startIcon={<TvIcon />}
              >
                电视剧
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 