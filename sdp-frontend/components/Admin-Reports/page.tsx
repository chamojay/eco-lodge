'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { reportService } from '@/app/services/reportService';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { MaterialReactTable } from 'material-react-table';
import type { MRT_ColumnDef } from 'material-react-table';

interface ReservationData {
  ReservationID: number;
  CheckInDate: string;
  CheckOutDate: string;
  Room_Status: string;
  TotalAmount: number;
  RoomNumber: number;
  RoomType: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Phone?: string;
  Country?: string;
}

interface ActivityData {
  ReservationActivityID: number;
  ReservationID: number;
  ActivityName: string;
  ScheduledDate: string;
  Amount: number;
  Participants: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
}

interface PaymentData {
  PaymentID: number;
  Amount: number;
  PaymentDate: string;
  PaymentMethod: string;
  Source: string;
  ReservationID?: number;
  OrderID?: number;
  CustomerName?: string;
  Email?: string;
  RoomNumber?: number;
  OrderItems?: string;
}

interface ExtraChargeData {
  ChargeID: number;
  ReservationID: number;
  Amount: number;
  Description: string;
  CreatedAt: string;
  ChargeType: string;
  CheckInDate: string;
  CheckOutDate: string;
  CustomerName: string;
  RoomNumber: number;
}

interface CustomerData {
  CustomerID: number;
  Title: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Country: string;
  NIC?: string;
  PassportNumber?: string;
  TotalReservations: number;
  TotalSpent: number;
}

const ReportComponent = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reportType, setReportType] = useState('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [includeCustomer, setIncludeCustomer] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const reservationColumns = useMemo<MRT_ColumnDef<ReservationData>[]>(() => [
    {
      accessorKey: 'ReservationID',
      header: 'ID',
      size: 80,
    },
    {
      accessorKey: 'CheckInDate',
      header: 'Check In',
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: 'CheckOutDate',
      header: 'Check Out',
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: 'Room_Status',
      header: 'Status',
    },
    {
      accessorKey: 'RoomNumber',
      header: 'Room',
    },
    {
      accessorKey: 'RoomType',
      header: 'Type',
    },
    {
      accessorKey: 'TotalAmount',
      header: 'Amount',
      Cell: ({ cell }) => `LKR ${cell.getValue<number>().toLocaleString()}`,
    },
    ...(includeCustomer ? [
      {
        accessorKey: 'FirstName',
        header: 'First Name',
      },
      {
        accessorKey: 'LastName',
        header: 'Last Name',
      },
      {
        accessorKey: 'Email',
        header: 'Email',
      },
      {
        accessorKey: 'Country',
        header: 'Country',
      },
    ] : []),
  ], [includeCustomer]);

  const activityColumns = useMemo<MRT_ColumnDef<ActivityData>[]>(() => [
    {
      accessorKey: 'ReservationActivityID',
      header: 'ID',
      size: 80,
    },
    {
      accessorKey: 'ReservationID',
      header: 'Reservation ID',
    },
    {
      accessorKey: 'ActivityName',
      header: 'Activity',
    },
    {
      accessorKey: 'ScheduledDate',
      header: 'Date',
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: 'Amount',
      header: 'Amount',
      Cell: ({ cell }) => `LKR ${cell.getValue<number>().toLocaleString()}`,
    },
    {
      accessorKey: 'Participants',
      header: 'Participants',
    },
    {
      accessorKey: 'FirstName',
      header: 'First Name',
    },
    {
      accessorKey: 'LastName',
      header: 'Last Name',
    },
    {
      accessorKey: 'Email',
      header: 'Email',
    },
  ], []);

  const paymentColumns = useMemo<MRT_ColumnDef<PaymentData>[]>(() => [
    {
      accessorKey: 'PaymentID',
      header: 'ID',
      size: 80,
    },
    {
      accessorKey: 'Amount',
      header: 'Amount',
      Cell: ({ cell }) => `LKR ${cell.getValue<number>().toLocaleString()}`,
    },
    {
      accessorKey: 'PaymentDate',
      header: 'Date',
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    },
    {
      accessorKey: 'PaymentMethod',
      header: 'Method',
    },
    {
      accessorKey: 'Source',
      header: 'Source',
    },
    {
      accessorKey: 'ReservationID',
      header: 'Reservation ID',
    },
    {
      accessorKey: 'CustomerName',
      header: 'Customer',
    },
    {
      accessorKey: 'OrderItems',
      header: 'Order Details',
    },
  ], []);

  const extraChargeColumns = useMemo<MRT_ColumnDef<ExtraChargeData>[]>(() => [
    {
      accessorKey: 'ChargeID',
      header: 'ID',
      size: 80,
    },
    {
      accessorKey: 'ReservationID',
      header: 'Reservation ID',
    },
    {
      accessorKey: 'Amount',
      header: 'Amount',
      Cell: ({ cell }) => `LKR ${cell.getValue<number>().toLocaleString()}`,
    },
    {
      accessorKey: 'ChargeType',
      header: 'Type',
    },
    {
      accessorKey: 'Description',
      header: 'Description',
    },
    {
      accessorKey: 'CreatedAt',
      header: 'Date',
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    },
    {
      accessorKey: 'CustomerName',
      header: 'Customer',
    },
    {
      accessorKey: 'RoomNumber',
      header: 'Room',
    },
  ], []);

  const customerColumns = useMemo<MRT_ColumnDef<CustomerData>[]>(() => [
    {
      accessorKey: 'CustomerID',
      header: 'ID',
      size: 80,
    },
    {
      accessorKey: 'Title',
      header: 'Title',
    },
    {
      accessorKey: 'FirstName',
      header: 'First Name',
    },
    {
      accessorKey: 'LastName',
      header: 'Last Name',
    },
    {
      accessorKey: 'Email',
      header: 'Email',
    },
    {
      accessorKey: 'Phone',
      header: 'Phone',
    },
    {
      accessorKey: 'Country',
      header: 'Country',
    },
    {
      accessorKey: 'NIC',
      header: 'NIC',
    },
    {
      accessorKey: 'PassportNumber',
      header: 'Passport',
    },
    {
      accessorKey: 'TotalReservations',
      header: 'Total Reservations',
    },
    {
      accessorKey: 'TotalSpent',
      header: 'Total Spent',
      Cell: ({ cell }) => `LKR ${cell.getValue<number>().toLocaleString()}`,
    },
  ], []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setData([]);
    setTotalAmount(0);
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, [startDate, endDate, reportType, includeCustomer]);

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let response;
      const dateParams = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      console.log('Fetching report for tab:', activeTab, 'with params:', dateParams); // Debug log

      switch (activeTab) {
        case 0:
          response = await reportService.getReservationReport({
            ...dateParams,
            type: reportType,
            includeCustomer
          });
          console.log('Reservation response:', response); // Debug log
          setData(Array.isArray(response) ? response : []);
          break;

        case 1: // Activities
          response = await reportService.getActivitiesReport(dateParams.startDate, dateParams.endDate);
          setData(response.activities);
          setTotalAmount(response.totalRevenue);
          break;

        case 2: // Payments
          response = await reportService.getPaymentsReport(dateParams.startDate, dateParams.endDate);
          setData(response.payments);
          setTotalAmount(response.total);
          break;

        case 3: // Extra Charges
          response = await reportService.getExtraChargesReport(dateParams.startDate, dateParams.endDate);
          setData(response.charges);
          setTotalAmount(response.total);
          break;

        case 4: // Customers
          response = await reportService.getCustomersReport(reportType);
          setData(response);
          setTotalAmount(response.reduce((sum: number, item: any) => sum + Number(item.TotalSpent), 0));
          break;
      }
    } catch (error: any) {
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeForTab = (tabIndex: number): string => {
    const reportTypes = {
      0: 'reservations',
      1: 'activities',
      2: 'payments',
      3: 'extraCharges',
      4: 'customers'
    } as const;
    
    return reportTypes[tabIndex as keyof typeof reportTypes] || 'unknown';
  };

  const handleDownloadPDF = async (selectedRows: any[]) => {
    try {
      if (!selectedRows || selectedRows.length === 0) {
        setError('Please select rows to download');
        return;
      }

      const reportType = getReportTypeForTab(activeTab);
      if (reportType === 'unknown') {
        setError('Invalid report type');
        return;
      }

      const selectedData = selectedRows.map(row => row.original);
      const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;

      setLoading(true);
      const blob = await reportService.generatePDF({
        data: selectedData,
        reportType: reportType as PDFGenerationParams['reportType'],
        title
      });

      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setError(error.message || 'Failed to generate PDF');
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Reservations" />
          <Tab label="Activities" />
          <Tab label="Payments" />
          <Tab label="Extra Charges" />
          <Tab label="Customers" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          {activeTab === 0 && (
            <>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value="all">All Reservations</MenuItem>
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="past">Past</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeCustomer}
                      onChange={(e) => setIncludeCustomer(e.target.checked)}
                    />
                  }
                  label="Include Customer Details"
                />
              </Grid>
            </>
          )}
          {activeTab === 4 && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="all">All Customers</MenuItem>
                  <MenuItem value="local">Local Customers</MenuItem>
                  <MenuItem value="foreign">Foreign Customers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          {/* Add other tab-specific filters here */}
        </Grid>
      </Paper>

      <Button
        variant="contained"
        onClick={fetchReport}
        disabled={!startDate || !endDate || loading}
        sx={{ mb: 2 }}
      >
        Generate Report
      </Button>

      <Paper sx={{ width: '100%' }}>
        <MaterialReactTable
          columns={
            activeTab === 0 ? reservationColumns :
            activeTab === 1 ? activityColumns :
            activeTab === 2 ? paymentColumns :
            activeTab === 3 ? extraChargeColumns :
            customerColumns
          }
          data={data}
          state={{ isLoading: loading }}
          enableRowSelection
          enableColumnResizing
          enableColumnFiltering
          enablePagination
          enableSorting
          enableBottomToolbar
          enableTopToolbar
          muiTableHeadCellProps={{
            sx: { backgroundColor: '#1a472a', color: 'white' }
          }}
          renderTopToolbarCustomActions={({ table }) => (
            <Box sx={{ display: 'flex', gap: 2, p: 1 }}>
              <Button
                variant="contained"
                onClick={fetchReport}
                disabled={!startDate || !endDate}
              >
                Generate Report
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleDownloadPDF(table.getSelectedRowModel().rows)}
                disabled={table.getSelectedRowModel().rows.length === 0}
              >
                Download Selected as PDF
              </Button>
            </Box>
          )}
        />
        {data.length > 0 && totalAmount > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1">
              Total Amount: LKR {totalAmount.toLocaleString()}
            </Typography>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportComponent;