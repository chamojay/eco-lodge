'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'transparent',
  boxShadow: 'none',
  position: 'absolute',
  background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
}));

const NavLink = styled(Button)(({ theme }) => ({
  color: 'white',
  marginLeft: theme.spacing(2),
  textTransform: 'none',
  fontSize: '1.1rem',
  fontFamily: '"Cormorant Garamond", serif',
}));

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { text: 'Home', href: '/' },
    { text: 'Rooms', href: '/web/rooms' },
    { text: 'Contact', href: '/web/contact' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontFamily: '"Cormorant Garamond", serif' }}>
        Algama Ella Eco Lodge
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.href} style={{ width: '100%', textDecoration: 'none', color: 'inherit' }}>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  textAlign: 'center',
                  '.MuiTypography-root': {
                    fontFamily: '"Cormorant Garamond", serif',
                  }
                }} 
              />
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <StyledAppBar>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile Menu Icon */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: { xs: '1.2rem', md: '1.5rem' },
            }}
          >
            Algama Ella Eco Lodge
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {navItems.map((item) => (
              <Link key={item.text} href={item.href} style={{ textDecoration: 'none' }}>
                <NavLink
                  sx={{
                    borderBottom: pathname === item.href ? '2px solid white' : 'none',
                    borderRadius: 0,
                  }}
                >
                  {item.text}
                </NavLink>
              </Link>
            ))}
            <Link href="/login/staff" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                sx={{
                  ml: 3,
                  color: 'white',
                  borderColor: 'white',
                  borderWidth: 2,
                  textTransform: 'none',
                  fontFamily: '"Cormorant Garamond", serif',
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Staff Login
              </Button>
            </Link>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </StyledAppBar>
  );
};

export default Navbar;