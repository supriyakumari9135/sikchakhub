import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchFromApi } from '../../src/api/client';
import { ATSFeedback } from '../../src/types';

export default function MobileAtsScreen() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ATSFeedback | null>(null);

  const handleScan = async () => {
    setLoading(true);
    try {
      const data = await fetchFromApi('/ats/analyze', {
        method: 'POST',
        body: JSON.stringify({ resumeText: text }),
      });
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>ATS Resume Compatibility Check</Text>
      <Text style={styles.subtitle}>
        Scan your resume text against education recruitment filters, pedagogy keywords, and board examination achievements.
      </Text>

      <TextInput
        style={styles.input}
        multiline
        numberOfLines={6}
        placeholder="Paste your teaching experience or summary here..."
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity style={styles.btn} onPress={handleScan} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Calculate ATS Score</Text>
        )}
      </TouchableOpacity>

      {analysis && (
        <View style={styles.resultCard}>
          <View style={styles.scoreRow}>
            <Text style={styles.grade}>Grade: {analysis.grade}</Text>
            <Text style={styles.score}>{analysis.overallScore} / 100</Text>
          </View>
          <Text style={styles.summary}>{analysis.summary}</Text>

          <Text style={styles.sectionTitle}>Identified Keywords ({analysis.matchingKeywords.length})</Text>
          <View style={styles.tagWrap}>
            {analysis.matchingKeywords.map((kw, i) => (
              <Text key={i} style={styles.tag}>{kw}</Text>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Recommended Improvements</Text>
          {analysis.recommendations.map((rec, i) => (
            <Text key={i} style={styles.bullet}>• {rec}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#64748b', lineHeight: 18 },
  input: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', padding: 12, fontSize: 12, minHeight: 120, textAlignVertical: 'top' },
  btn: { backgroundColor: '#15803d', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  resultCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 10, marginTop: 10 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grade: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  score: { fontSize: 18, fontWeight: 'bold', color: '#15803d' },
  summary: { fontSize: 12, color: '#475569', lineHeight: 17 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', marginTop: 4 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#dcfce7', color: '#166534', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 11, fontWeight: '600' },
  bullet: { fontSize: 11, color: '#334155', lineHeight: 16 },
});
