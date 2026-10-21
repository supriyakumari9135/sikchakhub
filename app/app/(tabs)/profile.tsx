import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function MobileProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>RS</Text>
        </View>
        <Text style={styles.name}>Dr. Rajesh Sharma</Text>
        <Text style={styles.headline}>Senior Physics Faculty | 8+ Yrs JEE Advanced Pedagogy</Text>
        <Text style={styles.city}>Kota, Rajasthan • Ph.D / M.Sc Physics</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>95%</Text>
          <Text style={styles.statLabel}>Profile Score</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>8 Yrs</Text>
          <Text style={styles.statLabel}>Teaching Exp</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹22 LPA</Text>
          <Text style={styles.statLabel}>Expected CTC</Text>
        </View>
      </View>

      {/* Quick Settings */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Educator Credentials</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Primary Subjects</Text>
          <Text style={styles.val}>Physics, Mechanics</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Target Boards</Text>
          <Text style={styles.val}>JEE Adv, CBSE 12th</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Notice Period</Text>
          <Text style={styles.val}>30 Days</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Relocation Willingness</Text>
          <Text style={styles.val}>Yes (Kota, Delhi, Jaipur)</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Switch Account / Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 14 },
  profileCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', gap: 6 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#15803d', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  avatarText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  headline: { fontSize: 11, color: '#475569', textAlign: 'center', paddingHorizontal: 10 },
  city: { fontSize: 11, color: '#94a3b8' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  statValue: { fontSize: 15, fontWeight: 'bold', color: '#15803d' },
  statLabel: { fontSize: 10, color: '#64748b', marginTop: 2 },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0', gap: 10 },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 11, color: '#64748b' },
  val: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' },
  logoutBtn: { backgroundColor: '#fee2e2', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#dc2626', fontWeight: 'bold', fontSize: 12 },
});
