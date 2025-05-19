import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { packageTypeService } from '@/app/services/packageTypeService';
import { PackageType } from '@/types/reservationtypes';
import '@/styles/PackageTypeManagement.css';

// Create a custom theme with dark green, black, and white colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#1B5E20', // Dark green
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#000000', // Black
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#0D3B1E', // Darker green on hover
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#1B5E20',
          color: '#ffffff',
          fontWeight: 600,
        },
      },
    },
  },
});

const PackageTypeManagement: React.FC = () => {
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
  const [open, setOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [formData, setFormData] = useState({
    Name: '',
    Description: '',
    PriceMultiplier: '',
    ImagePath: null as File | null,
  });

  useEffect(() => {
    fetchPackageTypes();
  }, []);

  const fetchPackageTypes = async () => {
    try {
      const data = await packageTypeService.getAllPackageTypes();
      setPackageTypes(data);
    } catch (error) {
      console.error('Error fetching package types:', error);
    }
  };

  const handleOpen = (packageType?: PackageType) => {
    if (packageType) {
      setEditingPackage(packageType);
      setFormData({
        Name: packageType.Name,
        Description: packageType.Description,
        PriceMultiplier: packageType.PriceMultiplier.toString(),
        ImagePath: null,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        Name: '',
        Description: '',
        PriceMultiplier: '',
        ImagePath: null,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPackage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value || '',
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        ImagePath: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('Name', formData.Name);
    formDataToSend.append('Description', formData.Description);
    formDataToSend.append('PriceMultiplier', formData.PriceMultiplier);
    if (formData.ImagePath) {
      formDataToSend.append('image', formData.ImagePath);
    }

    try {
      if (editingPackage) {
        await packageTypeService.updatePackageType(editingPackage.PackageID, formDataToSend);
      } else {
        await packageTypeService.createPackageType(formDataToSend);
      }
      fetchPackageTypes();
      handleClose();
    } catch (error) {
      console.error('Error saving package type:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this package type?')) {
      try {
        await packageTypeService.deletePackageType(id);
        fetchPackageTypes();
      } catch (error) {
        console.error('Error deleting package type:', error);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="package-type-container">
        <Box className="header-section">
          <Typography variant="h4" component="h1" className="header-title">
            Package Type Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            className="add-button"
          >
            Add New Package Type
          </Button>
        </Box>

        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price Multiplier</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packageTypes.map((packageType) => (
                <TableRow key={packageType.PackageID} className="table-row">
                  <TableCell>{packageType.Name}</TableCell>
                  <TableCell>{packageType.Description}</TableCell>
                  <TableCell>{packageType.PriceMultiplier}</TableCell>
                  <TableCell>
                    {packageType.ImagePath && (
                      <img
                        src={packageType.ImagePath}
                        alt={packageType.Name}
                        className="package-image"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleOpen(packageType)} 
                      color="primary"
                      className="action-button edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(packageType.PackageID)} 
                      color="error"
                      className="action-button delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            className: 'dialog-paper'
          }}
        >
          <DialogTitle className="dialog-title">
            {editingPackage ? 'Edit Package Type' : 'Add New Package Type'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <TextField
                fullWidth
                label="Name"
                name="Name"
                value={formData.Name}
                onChange={handleInputChange}
                margin="normal"
                required
                className="form-field"
              />
              <TextField
                fullWidth
                label="Description"
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                margin="normal"
                required
                multiline
                rows={3}
                className="form-field"
              />
              <TextField
                fullWidth
                label="Price Multiplier"
                name="PriceMultiplier"
                type="number"
                value={formData.PriceMultiplier}
                onChange={handleInputChange}
                margin="normal"
                required
                className="form-field"
              />
              <input
                accept="image/*"
                type="file"
                onChange={handleImageChange}
                className="file-input"
              />
            </DialogContent>
            <DialogActions className="dialog-actions">
              <Button 
                onClick={handleClose}
                variant="outlined"
                color="secondary"
                className="cancel-button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                className="submit-button"
              >
                {editingPackage ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default PackageTypeManagement; 