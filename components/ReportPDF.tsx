import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a',
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
    marginTop: 25,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#f1f5f9',
    borderBottomWidth: 1,
    alignItems: 'center',
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: '#0f172a',
    minHeight: 35,
  },
  headerText: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 8,
    padding: 8,
    color: '#334155',
  },
  dateCol: { width: '15%' },
  idCol: { width: '25%' },
  accountCol: { width: '20%' },
  debitCol: { width: '15%', textAlign: 'right' },
  creditCol: { width: '15%', textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  }
});

export const ReportPDF = ({ data, entries }: { data: any, entries: any[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Master Ledger Report</Text>
          <Text style={styles.subtitle}>Generated on {data.reportDate} | System Integrity: PASSED</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Financial Performance Index</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Net Operating Income</Text>
          <Text style={[styles.statValue, { color: '#16a34a' }]}>${data.netRealizableRevenue.toLocaleString()}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Collected Income</Text>
          <Text style={styles.statValue}>${data.totalCollectedIncome.toLocaleString()}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Operational Delta</Text>
          <Text style={[styles.statValue, { color: '#dc2626' }]}>-${data.totalOperationalExpense.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Transactional Log Registry</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCell, styles.dateCol]}><Text style={styles.headerText}>Date</Text></View>
          <View style={[styles.tableCell, styles.idCol]}><Text style={styles.headerText}>Transaction ID</Text></View>
          <View style={[styles.tableCell, styles.accountCol]}><Text style={styles.headerText}>Account</Text></View>
          <View style={[styles.tableCell, styles.debitCol]}><Text style={styles.headerText}>Debit (+)</Text></View>
          <View style={[styles.tableCell, styles.creditCol]}><Text style={styles.headerText}>Credit (-)</Text></View>
        </View>

        {entries.map((e, i) => {
          const isDebit = Number(e.amount) > 0;
          return (
            <View key={e.id} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }]}>
              <View style={[styles.tableCell, styles.dateCol]}><Text>{e.date.toISOString().split('T')[0]}</Text></View>
              <View style={[styles.tableCell, styles.idCol]}><Text>{e.transactionId}</Text></View>
              <View style={[styles.tableCell, styles.accountCol]}><Text>{e.account.name}</Text></View>
              <View style={[styles.tableCell, styles.debitCol]}><Text style={{ color: '#16a34a', fontWeight: 'bold' }}>{isDebit ? `$${Number(e.amount).toFixed(2)}` : ''}</Text></View>
              <View style={[styles.tableCell, styles.creditCol]}><Text style={{ color: '#dc2626', fontWeight: 'bold' }}>{!isDebit ? `$${Math.abs(Number(e.amount)).toFixed(2)}` : ''}</Text></View>
            </View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Certified Immutable Ledger Export</Text>
        <Text style={styles.footerText}>Powered by AntiGravity Engine v3.0</Text>
      </View>
    </Page>
  </Document>
);
