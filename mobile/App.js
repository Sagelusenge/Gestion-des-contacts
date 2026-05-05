import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const stats = [
  { label: 'Pasteurs', value: 141 },
  { label: 'Postes', value: 4 },
  { label: 'Sections', value: 26 },
  { label: 'Paroisses', value: 107 }
];

const pasteurs = [
  { name: 'Emmanuel Kambale', role: 'Révérend Pasteur', place: 'Poste de Goma', phone: '+243 970 000 101' },
  { name: 'Jean-Paul Mumbere', role: 'Pasteur', place: 'Poste de Beni', phone: '+243 970 000 220' },
  { name: 'Daniel Safari', role: 'Pasteur Stagiaire', place: 'Poste de Butembo', phone: '+243 970 000 303' }
];

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>CBCA Interne</Text>
          <Text style={styles.title}>Pilotage pastoral</Text>
          <Text style={styles.subtitle}>Cockpit mobile réservé aux cadres autorisés.</Text>
        </View>

        <TextInput style={styles.search} placeholder="Rechercher un pasteur, poste, matricule..." />

        <View style={styles.grid}>
          {stats.map((item) => (
            <View key={item.label} style={styles.stat}>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertes de mandat</Text>
          <View style={styles.alert}>
            <Text style={styles.alertTitle}>Jean-Paul Mumbere</Text>
            <Text style={styles.alertText}>Poste de Beni - fin prévue dans 119 jours</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacts stratégiques</Text>
          {pasteurs.map((pasteur) => (
            <View key={pasteur.name} style={styles.card}>
              <View>
                <Text style={styles.cardTitle}>{pasteur.name}</Text>
                <Text style={styles.cardMeta}>{pasteur.role} - {pasteur.place}</Text>
              </View>
              <TouchableOpacity style={styles.action}>
                <Text style={styles.actionText}>Appeler</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  container: { padding: 18, paddingBottom: 36 },
  header: { marginBottom: 18 },
  eyebrow: { color: '#0B5CAB', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0 },
  title: { color: '#172033', fontSize: 34, fontWeight: '900', marginTop: 4 },
  subtitle: { color: '#5B6472', marginTop: 8, fontSize: 15 },
  search: { backgroundColor: '#FFFFFF', borderColor: '#DDE3EC', borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, borderColor: '#E4E9F1', borderWidth: 1 },
  statLabel: { color: '#5B6472' },
  statValue: { color: '#172033', fontSize: 28, fontWeight: '900', marginTop: 6 },
  section: { marginTop: 22 },
  sectionTitle: { color: '#172033', fontSize: 20, fontWeight: '900', marginBottom: 10 },
  alert: { backgroundColor: '#FFF7E8', borderColor: '#F2C678', borderWidth: 1, borderRadius: 8, padding: 14 },
  alertTitle: { color: '#172033', fontWeight: '900' },
  alertText: { color: '#6D530D', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderColor: '#E4E9F1', borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  cardTitle: { color: '#172033', fontWeight: '900', fontSize: 16 },
  cardMeta: { color: '#5B6472', marginTop: 4 },
  action: { backgroundColor: '#0B5CAB', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 12 },
  actionText: { color: '#FFFFFF', fontWeight: '800' }
});
