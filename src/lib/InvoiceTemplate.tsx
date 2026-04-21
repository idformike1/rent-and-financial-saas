import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { marginBottom: 30, paddingBottom: 10, borderBottom: '1 solid #000' },
  title: { fontSize: 24, fontWeight: 'bold' },
  date: { fontSize: 10, color: '#666', marginTop: 5 },
  section: { marginBottom: 20 },
  table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '33.33%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f8fafc' },
  tableCol: { width: '33.33%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCellHeader: { margin: 5, fontSize: 10, fontWeight: 'bold' },
  tableCell: { margin: 5, fontSize: 10 }
});

export const InvoiceTemplate = ({ transaction }: { transaction: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoice</Text>
        <Text style={styles.date}>Date: {new Date(transaction.date).toLocaleDateString()}</Text>
        <Text style={styles.date}>Transaction ID: {transaction.id}</Text>
      </View>
      <View style={styles.section}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Description</Text>
        <Text style={{ fontSize: 12 }}>{transaction.description}</Text>
      </View>
      <View style={styles.section}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Account</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Debit</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Credit</Text></View>
          </View>
          {transaction.entries.map((entry: any, i: number) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{entry.account?.name || 'N/A'}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{entry.type === 'DEBIT' ? `$${Number(entry.amount).toFixed(2)}` : ''}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{entry.type === 'CREDIT' ? `$${Number(entry.amount).toFixed(2)}` : ''}</Text></View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);
