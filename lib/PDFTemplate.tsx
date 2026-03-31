import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface PDFProps {
  data: {
    reportDate: string;
    netRealizableRevenue: number;
    totalCollectedIncome: number;
    totalOperationalExpense: number;
    utilityAnalysis: {
      utilExpense: number;
      utilRecovery: number;
      utilityDelta: number;
      isUtilityWarning: boolean;
    };
    agingSnapshot: {
      name: string;
      totalDue: number;
      daysPastDue: number;
    }[];
  }
}

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { marginBottom: 30, paddingBottom: 10, borderBottom: '1 solid #000' },
  title: { fontSize: 24, fontWeight: 'bold' },
  date: { fontSize: 10, color: '#666', marginTop: 5 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, backgroundColor: '#f0f0f0', padding: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 10, color: '#333' },
  value: { fontSize: 10, fontWeight: 'bold' },
  nrrBox: { padding: 10, backgroundColor: '#0f172a', color: '#fff', marginBottom: 20, textAlign: 'center' },
  nrrValue: { fontSize: 18, fontWeight: 'bold' },
  nrrLabel: { fontSize: 10, textTransform: 'uppercase' },
  warningText: { color: '#dc2626', fontSize: 10, fontWeight: 'bold' },
  // Table
  table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '33.33%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f8fafc' },
  tableCol: { width: '33.33%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCellHeader: { margin: 5, fontSize: 10, fontWeight: 'bold' },
  tableCell: { margin: 5, fontSize: 10 }
});

export const StakeholderPDF = ({ data }: PDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Super-Report: Operational Audit</Text>
        <Text style={styles.date}>Generated: {data.reportDate}</Text>
      </View>

      <View style={styles.nrrBox}>
        <Text style={styles.nrrLabel}>Net Realizable Revenue</Text>
        <Text style={styles.nrrValue}>${data.netRealizableRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Macro Financials</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total Collected Income</Text>
          <Text style={styles.value}>${data.totalCollectedIncome.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Operational Expense</Text>
          <Text style={styles.value}>${data.totalOperationalExpense.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Utility Delta Analysis</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Master Expense</Text>
          <Text style={styles.value}>${data.utilityAnalysis.utilExpense.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tenant Recovery</Text>
          <Text style={styles.value}>${data.utilityAnalysis.utilRecovery.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Unrecovered Delta</Text>
          <Text style={data.utilityAnalysis.isUtilityWarning ? styles.warningText : styles.value}>
            ${data.utilityAnalysis.utilityDelta.toLocaleString()} 
            {data.utilityAnalysis.isUtilityWarning ? ' (! HIGH DELTA)' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aging Receivables Snapshot</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Tenant</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Total Due</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Max Days Past Due</Text></View>
          </View>
          {data.agingSnapshot.length === 0 && (
             <View style={styles.tableRow}>
               <View style={{...styles.tableCol, width: '100%'}}><Text style={styles.tableCell}>No outstanding balances.</Text></View>
             </View>
          )}
          {data.agingSnapshot.map((tenant, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{tenant.name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>${tenant.totalDue.toLocaleString()}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{tenant.daysPastDue} days</Text></View>
            </View>
          ))}
        </View>
      </View>

    </Page>
  </Document>
);
