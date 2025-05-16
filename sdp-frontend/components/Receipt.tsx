import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, Font } from '@react-pdf/renderer';

// Register a custom font (optional)
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

const styles = StyleSheet.create({
  page: { 
    padding: 30,
    fontFamily: 'Roboto'
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    alignSelf: 'center'
  },
  header: { 
    marginBottom: 20, 
    textAlign: 'center',
    color: '#2B3A55'
  },
  welcome: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666'
  },
  contactInfo: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555'
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
    backgroundColor: '#f0f0f0'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dedede'
  },
  columnItem: { width: '40%', padding: 5 },
  columnPrice: { width: '20%', padding: 5, textAlign: 'right' },
  columnQty: { width: '20%', padding: 5, textAlign: 'center' },
  columnTotal: { width: '20%', padding: 5, textAlign: 'right' },
  total: { 
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 10
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666'
  },
  bold: {
    fontWeight: 'bold'
  }
});

// Add this utility function at the top of the file, after the imports
const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
};

// Update the ReceiptProps interface
interface ReceiptProps {
  orderData: {
    orderId: number;
    items: Array<{
      Name: string;
      Price: string | number; 
      quantity: number;
    }>;
    total: number;
    paymentMethod: string;
    cashReceived?: number;
    balance?: number;
    timestamp: string;
  };
}

const Receipt: React.FC<ReceiptProps> = ({ orderData }) => (
  <PDFViewer width="100%" height={600}>
    <Document>
    <Page size="A4" style={styles.page}>
      <Image
        style={styles.logo}
        src='../public/images/hotel-logo.jpg'
      />
      
      <View style={styles.header}>
        <Text style={{ fontSize: 24, color: '#2B3A55' }}>Eco Lodge</Text>
        <Text style={{ fontSize: 16, marginTop: 5 }}>Restaurant</Text>
      </View>

      <View style={styles.welcome}>
        <Text>Welcome to Eco Lodge Restaurant</Text>
      </View>

      <View style={styles.contactInfo}>
        <Text>123 Nature Way, Kandy, Sri Lanka</Text>
        <Text>Tel: +94 81 234 5678 | Email: dining@ecolodge.lk</Text>
        <Text>Website: www.ecolodge.lk</Text>
      </View>

      <View style={{ marginBottom: 20, textAlign: 'center' }}>
        <Text style={styles.bold}>Order Receipt #{orderData.orderId}</Text>
        <Text style={{ fontSize: 10, marginTop: 5 }}>
        {new Date(orderData.timestamp).toLocaleString()}
        </Text>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.columnItem}>Item Description</Text>
        <Text style={styles.columnPrice}>Unit Price</Text>
        <Text style={styles.columnQty}>Qty</Text>
        <Text style={styles.columnTotal}>Total</Text>
      </View>

      {/* Table Body */}
      {orderData.items.map((item, index) => (
        <View key={index} style={styles.tableRow}>
        <Text style={styles.columnItem}>{item.Name}</Text>
        <Text style={styles.columnPrice}>LKR {formatPrice(item.Price)}</Text>
        <Text style={styles.columnQty}>{item.quantity}</Text>
        <Text style={styles.columnTotal}>
          LKR {formatPrice(Number(item.Price) * item.quantity)}
        </Text>
        </View>
      ))}

      {/* Totals Section */}
      <View style={styles.total}>
        <View style={styles.totalRow}>
        <Text style={styles.bold}>Total Amount:</Text>
        <Text style={styles.bold}>LKR {orderData.total.toFixed(2)}</Text>
        </View>

        {orderData.paymentMethod === 'Cash' && (
        <>
          <View style={styles.totalRow}>
            <Text>Cash Received:</Text>
            <Text>LKR {orderData.cashReceived?.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Balance:</Text>
            <Text>LKR {orderData.balance?.toFixed(2)}</Text>
          </View>
        </>
        )}

        <View style={styles.totalRow}>
        <Text>Payment Method:</Text>
        <Text>{orderData.paymentMethod}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={{ marginBottom: 5 }}>Thank you for dining with us!</Text>
        <Text>Your satisfaction is our priority.</Text>
        <Text style={{ marginTop: 10 }}>
        Follow us on social media @ecolodgesl
        </Text>
      </View>
    </Page>
    </Document>
  </PDFViewer>
);

export default Receipt;