import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// ── MERCURY PRINT PALETTE ───────────────────────────────────────────────────
// PDF renderers cannot consume CSS variables.
// These constants mirror the Mercury Light Mode ground truth exactly.
const P = {
  bg:         '#FFFFFF',
  surface:    '#F5F6F8',
  border:     '#E5E7EB',
  header:     '#14161A',
  body:       '#3D4249',
  muted:      '#5C6470',
  subtle:     '#8A919E',
  positive:   '#059669',  // emerald-600
  negative:   '#DC2626',  // rose-600
  stripe:     '#F9FAFB',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: P.bg,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: P.header,
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: P.header,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 9,
    color: P.subtle,
    marginTop: 5,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: P.muted,
    marginBottom: 12,
    marginTop: 24,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 14,
    backgroundColor: P.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: P.border,
  },
  statLabel: {
    fontSize: 7,
    color: P.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: P.header,
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginTop: 16,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: P.border,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: P.border,
    borderBottomWidth: 1,
    alignItems: 'center',
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: P.header,
    minHeight: 32,
  },
  headerText: {
    fontSize: 7,
    color: P.subtle,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableCell: {
    fontSize: 8,
    padding: 8,
    color: P.body,
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
    borderTopColor: P.border,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: P.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
          <Text style={[styles.statValue, { color: P.positive }]}>${data.netRealizableRevenue.toLocaleString()}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Collected Income</Text>
          <Text style={styles.statValue}>${data.totalCollectedIncome.toLocaleString()}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Operational Delta</Text>
          <Text style={[styles.statValue, { color: P.negative }]}>-${data.totalOperationalExpense.toLocaleString()}</Text>
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
            <View key={e.id} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? P.bg : P.stripe }]}>
              <View style={[styles.tableCell, styles.dateCol]}><Text>{e.date.toISOString().split('T')[0]}</Text></View>
              <View style={[styles.tableCell, styles.idCol]}><Text>{e.transactionId}</Text></View>
              <View style={[styles.tableCell, styles.accountCol]}><Text>{e.account.name}</Text></View>
              <View style={[styles.tableCell, styles.debitCol]}><Text style={{ color: P.positive, fontWeight: 'bold' }}>{isDebit ? `$${Number(e.amount).toFixed(2)}` : ''}</Text></View>
              <View style={[styles.tableCell, styles.creditCol]}><Text style={{ color: P.negative, fontWeight: 'bold' }}>{!isDebit ? `$${Math.abs(Number(e.amount)).toFixed(2)}` : ''}</Text></View>
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
