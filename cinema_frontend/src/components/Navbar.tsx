import React, { useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Container, useMediaQuery, ClickAwayListener, Paper } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
      <Container>
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
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                      }}
                      startIcon={<MovieIcon />}
                      onClick={() => handleMenuItemClick('/movie')}
                    >
                      电影
                    </Button>
                    <Button
                      fullWidth
                      sx={{ 
                        justifyContent: 'flex-start',
                        p: 1.5
                      }}
                      startIcon={<TvIcon />}
                      onClick={() => handleMenuItemClick('/tvshow')}
                    >
                      电视剧
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
                sx={{ mx: 1 }}
                startIcon={<MovieIcon />}
              >
                电影
              </Button>
              <Button
                component={RouterLink}
                to="/tvshow"
                color="inherit"
                sx={{ mx: 1 }}
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