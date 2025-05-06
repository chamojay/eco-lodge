'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, IconButton, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { extraChargesService, ExtraChargeType, ExtraChargeTypeCreate } from '@/app/services/extraChargesService';
import exp from 'constants';

const ExtraChargeTypes = () => {
  const [data, setData] = useState<ExtraChargeType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<Partial<ExtraChargeType> | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch extra charge types
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const types = await extraChargesService.getAllTypes();
        setData(types);
      } catch (error) {
        console.error('Error fetching charge types:', error);
        alert('Failed to load charge types');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Define table columns
  const columns = useMemo<MRT_ColumnDef<ExtraChargeType>[]>(
    () => [
      {
        accessorKey: 'TypeID',
        header: 'Type ID',
        size: 120,
        minSize: 100,
      },
      {
        accessorKey: 'Name',
        header: 'Name',
        size: 200,
        minSize: 150,
      },
      {
        accessorKey: 'DefaultAmount',
        header: 'Default Amount (LKR)',
        size: 150,
        minSize: 120,
        Cell: ({ cell }) => `${cell.getValue<number>().toLocaleString()}`,
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 150,
        minSize: 120,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ row }) => (
          <Box>
            <IconButton
              onClick={() => handleEdit(row.original)}
              sx={{ color: '#1a472a' }}
              disabled={loading}
            >
              <Edit />
            </IconButton>
            <IconButton
              onClick={() => handleDelete(row.original.TypeID)}
              sx={{ color: '#d32f2f' }}
              disabled={loading}
            >
              <Delete />
            </IconButton>
          </Box>
        ),
      },
    ],
    [loading]
  );

  const table = useMaterialReactTable({
    columns,
    data,
    state: { isLoading: loading },
    enableColumnVirtualization: true,
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: '#2e7d32',
        color: 'white',
        '& .MuiTableSortLabel-icon': {
          color: 'white !important',
        },
        '& .MuiIconButton-root': {
          color: 'white !important',
        },
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: 'auto',
        width: '100%',
        '@media (max-width: 600px)': {
          minWidth: 'auto',
        },
      },
    },
    muiTableBodyCellProps: {
      sx: {
        whiteSpace: 'normal',
        wordBreak: 'break-word',
      },
    },
  });

  const handleEdit = (type: ExtraChargeType) => {
    setEditingType(type);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingType({
      Name: '',
      DefaultAmount: 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this charge type?')) {
      setLoading(true);
      try {
        await extraChargesService.deleteType(id);
        setData((prevData) => prevData.filter((type) => type.TypeID !== id));
      } catch (error) {
        console.error('Error deleting charge type:', error);
        alert('Failed to delete charge type');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingType(null);
  };

  const handleSave = async () => {
    if (!editingType) return;

    if (!editingType.Name || !editingType.DefaultAmount) {
      alert('Name and Default Amount are required');
      return;
    }

    setLoading(true);
    try {
      const typeData: ExtraChargeTypeCreate = {
        Name: editingType.Name,
        DefaultAmount: editingType.DefaultAmount,
      };

      if (editingType.TypeID) {
        // Update existing type
        await extraChargesService.updateType(editingType.TypeID, typeData);
        setData((prevData) =>
          prevData.map((type) =>
            type.TypeID === editingType.TypeID ? { ...type, ...typeData } : type
          )
        );
      } else {
        // Add new type
        const { id } = await extraChargesService.addType(typeData);
        setData((prevData) => [...prevData, { ...typeData, TypeID: id }]);
      }
      handleDialogClose();
    } catch (error) {
      console.error('Error saving charge type:', error);
      alert('Failed to save charge type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 2,
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography variant="h5" sx={{ color: 'darkgreen' }}>
          Extra Charge Types Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          sx={{
            backgroundColor: '#1a472a',
            '&:hover': { backgroundColor: '#2e7d32' },
            minWidth: { xs: '100%', sm: 'auto' },
          }}
          disabled={loading}
        >
          Add Type
        </Button>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <MaterialReactTable table={table} />
      </Box>

      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: { xs: '90%', sm: '100%' },
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle>{editingType?.TypeID ? 'Edit Charge Type' : 'Add Charge Type'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={editingType?.Name || ''}
            onChange={(e) =>
              setEditingType((prev) =>
                prev ? { ...prev, Name: e.target.value } : null
              )
            }
            required
            disabled={loading}
          />
          <TextField
            label="Default Amount (LKR)"
            type="number"
            fullWidth
            margin="normal"
            value={editingType?.DefaultAmount || ''}
            onChange={(e) =>
              setEditingType((prev) =>
                prev ? { ...prev, DefaultAmount: +e.target.value } : null
              )
            }
            required
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="error" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            sx={{ backgroundColor: '#1a472a', color: 'white', '&:hover': { backgroundColor: '#2e7d32' } }}
            disabled={loading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExtraChargeTypes;
