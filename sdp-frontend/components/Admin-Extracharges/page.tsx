import React, { useEffect, useMemo, useState } from 'react';
import { Button, IconButton, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

'use client';

import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

// Example data type
type ExtraCharge = {
    id: number;
    type: string;
    amount: number;
};

// Mock service to fetch extra charges
const fetchExtraChargesService = async (): Promise<ExtraCharge[]> => {
    // Replace with actual API call
    return [
        { id: 1, type: 'Cleaning Fee', amount: 50 },
        { id: 2, type: 'Service Fee', amount: 30 },
    ];
};

const ExtraCharges = () => {
    const [data, setData] = useState<ExtraCharge[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCharge, setEditingCharge] = useState<ExtraCharge | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const charges = await fetchExtraChargesService();
            setData(charges);
        };
        fetchData();
    }, []);

    const columns = useMemo<MRT_ColumnDef<ExtraCharge>[]>(
        () => [
            {
                accessorKey: 'type',
                header: 'Type',
                size: 200,
            },
            {
                accessorKey: 'amount',
                header: 'Amount',
                size: 100,
            },
            {
                id: 'actions',
                header: 'Actions',
                size: 150,
                Cell: ({ row }) => (
                    <Box>
                        <IconButton
                            onClick={() => handleEdit(row.original)}
                            color="primary"
                        >
                            <Edit />
                        </IconButton>
                        <IconButton
                            onClick={() => handleDelete(row.original.id)}
                            color="error"
                        >
                            <Delete />
                        </IconButton>
                    </Box>
                ),
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data,
    });

    const handleEdit = (charge: ExtraCharge) => {
        setEditingCharge(charge);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        setData((prevData) => prevData.filter((charge) => charge.id !== id));
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingCharge(null);
    };

    const handleSave = () => {
        if (editingCharge) {
            setData((prevData) =>
                prevData.map((charge) =>
                    charge.id === editingCharge.id ? editingCharge : charge
                )
            );
        }
        handleDialogClose();
    };

    return (
        <Box>
            <MaterialReactTable table={table} />
            <Dialog open={isDialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Edit Extra Charge</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Type"
                        fullWidth
                        margin="normal"
                        value={editingCharge?.type || ''}
                        onChange={(e) =>
                            setEditingCharge((prev) =>
                                prev ? { ...prev, type: e.target.value } : null
                            )
                        }
                    />
                    <TextField
                        label="Amount"
                        type="number"
                        fullWidth
                        margin="normal"
                        value={editingCharge?.amount || ''}
                        onChange={(e) =>
                            setEditingCharge((prev) =>
                                prev ? { ...prev, amount: +e.target.value } : null
                            )
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ExtraCharges;