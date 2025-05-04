'use client'; 

import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Paper,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MainLayout from '@/components/layout/MainLayout';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import SpaIcon from '@mui/icons-material/Spa';
import HikingIcon from '@mui/icons-material/Hiking';
import { useState, useEffect } from 'react';

// Custom theme for Eco Lodge
const theme = createTheme({
  palette: {
    primary: {
      main: '#2F4F4F', // Dark green-gray for eco theme
      light: '#3E686A',
      dark: '#1F3535',
    },
    secondary: {
      main: '#8B4513', // Saddle brown for natural accent
    },
  },
  typography: {
    fontFamily: '"Cormorant Garamond", "Roboto", serif',
  },
});

const images = [
    '/images/ella-hero1.jpg',
    '/images/ella-hero2.jpg',
    '/images/ella-hero3.jpg',
    '/images/ella-hero4.jpg',
    '/images/ella-hero5.jpg',
    '/images/ella-hero6.jpg',
];

const HeroSection = styled(Box)(({ theme }) => ({
    height: '90vh',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
    transition: 'background-image 1s ease-in-out',
}));

const Slideshow = () => {
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prevImage) => (prevImage + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <HeroSection
            sx={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${images[currentImage]})`,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', // Add text shadow for better visibility
            }}
        >
            <Container maxWidth="md">
            <Typography 
                variant="h1" 
                sx={{ 
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 800,
                mb: 2,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', 
                }}
            >
                Algama Ella Eco Lodge
            </Typography>
            <Typography 
                variant="h5" 
                sx={{ 
                mb: 4,
                fontWeight: 500,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', 
                }}
            >
                Where Nature Meets Luxury in the Heart of Ella
            </Typography>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              sx={{ 
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                backgroundColor: 'rgba(255,255,255,0.1)'
              },
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', 
              }}
              onClick={() => window.location.href = '/reservation'}
            >
              Book Your Eco-Stay
            </Button>
            </Container>
        </HeroSection>
    );
};

const EcoCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const HomePage = () => {
  return (
    <ThemeProvider theme={theme}>
      <MainLayout>
        <Slideshow />
        <Box sx={{ bgcolor: '#F5F5F5', py: 8 }}>
          <Container maxWidth="lg">
            <Typography 
              variant="h3" 
              component="h2" 
              textAlign="center" 
              sx={{ mb: 6, fontWeight: 500, color: 'primary.main' }}
            >
              Experience Nature's Luxury
            </Typography>
            <Grid container spacing={4}>
              {ecoFeatures.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <EcoCard elevation={2}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      {feature.icon}
                      <Typography variant="h5" sx={{ my: 2, fontWeight: 500 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </EcoCard>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Paper 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            py: 8,
            mt: 8 
          }}
        >
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 300 }}>
              Discover Our Eco Packages
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: 300 }}>
              Sustainable luxury with breathtaking views of Ella Rock
            </Typography>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              sx={{ 
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              View Packages
            </Button>
          </Container>
        </Paper>
      </MainLayout>
    </ThemeProvider>
  );
};

const ecoFeatures = [
  {
    title: 'Farm-to-Table Dining',
    description: 'Savor organic cuisine made with ingredients from our own eco-farm.',
    icon: <LocalDiningIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
  {
    title: 'Wellness Retreat',
    description: 'Rejuvenate with traditional Ayurvedic treatments and yoga sessions.',
    icon: <SpaIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
  {
    title: 'Nature Trails',
    description: 'Explore guided hiking trails through pristine wilderness.',
    icon: <HikingIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  },
];

export default HomePage;