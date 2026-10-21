import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchFromApi } from '../../src/api/client';
import { JobApplication } from '../../src/types';

export default function ApplicationsScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['mobile-my-applications'],
    queryFn: () => fetchFromApi('/applications/job/job-1'), // fallback preview
  });

  const applications: JobApplication[] = data?.candidates || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.stageBadge}>{item.stage.replace('_', ' ')}</Text>
              {item.matchResult && (
                <Text style={styles.scoreBadge}>{item.matchResult.overallScore}% MATCH</Text>
              )}
            </View>

            <Text style={styles.candidateName}>{item.teacher?.fullName || 'Senior Physics Faculty Application'}</Text>
            <Text style={styles.subtext}>
              {item.teacher?.profile?.highestQualification || 'B.Ed / M.Sc'} • {item.teacher?.profile?.experienceYears || 5} Yrs Exp
            </Text>

            {item.matchResult?.aiAnalysisSummary && (
              <Text style={styles.analysis} numberOfLines={3}>
                {item.matchResult.aiAnalysisSummary}
              </Text>
            )}

            <View style={styles.footer}>
              <Text style={styles.date}>Date: {new Date(item.appliedAt).toLocaleDateString()}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 12, gap: 12 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  stageBadge: { fontSize: 10, fontWeight: 'bold', color: '#6b21a8', backgroundColor: '#f3e8ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  scoreBadge: { fontSize: 10, fontWeight: 'bold', color: '#15803d', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  candidateName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  subtext: { fontSize: 11, color: '#64748b', marginTop: 2 },
  analysis: { fontSize: 11, color: '#334155', backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, marginTop: 8 },
  footer: { marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  date: { fontSize: 10, color: '#94a3b8' },
});
