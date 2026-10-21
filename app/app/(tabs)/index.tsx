import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchFromApi } from '../../src/api/client';
import { JobVacancy } from '../../src/types';

export default function JobsScreen() {
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mobile-jobs', search],
    queryFn: () => fetchFromApi(`/jobs?q=${encodeURIComponent(search)}`),
  });

  const jobs: JobVacancy[] = data?.jobs || [];

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search subject, role, city..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#15803d" />
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          refreshing={isLoading}
          onRefresh={refetch}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.tag}>{item.teachingLevel} • {item.board}</Text>
                  <Text style={styles.jobTitle}>{item.title}</Text>
                  <Text style={styles.institutionName}>{item.institution?.name} - {item.city}</Text>
                </View>
                <Text style={styles.salary}>₹{item.minSalaryLPA}-{item.maxSalaryLPA}L</Text>
              </View>

              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.footerInfo}>Min Exp: {item.minExperienceYears}+ Yrs</Text>
                <TouchableOpacity style={styles.applyBtn}>
                  <Text style={styles.applyBtnText}>Quick Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  searchContainer: { padding: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  searchInput: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 12, gap: 12 },
  card: { backgroundColor: '#ffffff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  tag: { fontSize: 10, color: '#15803d', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  jobTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', maxWidth: 220 },
  institutionName: { fontSize: 11, color: '#64748b', marginTop: 2 },
  salary: { fontSize: 13, fontWeight: 'bold', color: '#15803d' },
  description: { fontSize: 11, color: '#475569', lineHeight: 16, marginVertical: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  footerInfo: { fontSize: 10, color: '#94a3b8' },
  applyBtn: { backgroundColor: '#15803d', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  applyBtnText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
});
