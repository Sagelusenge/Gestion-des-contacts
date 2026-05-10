import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar as RNStatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from './src/services/api.js';
import { blankGrade, blankPastor, blankPoste, pastorContactText, phoneDigits } from './src/utils/format.js';
import { colors, styles } from './src/styles.js';

const SESSION_KEY = 'cbca_mobile_session';

const tabs = [
  { key: 'dashboard', label: 'Accueil', icon: 'grid-outline' },
  { key: 'directory', label: 'Annuaire', icon: 'search-outline' },
  { key: 'manage', label: 'Gestion', icon: 'create-outline' }
];

export default function App() {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((value) => {
        if (value) {
          setSession(JSON.parse(value));
        }
      })
      .finally(() => setBooting(false));
  }, []);

  async function handleLogin(nextSession) {
    setSession(nextSession);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setActiveTab('dashboard');
  }

  async function handleLogout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setSession(null);
    setActiveTab('dashboard');
  }

  if (booting) {
    return (
      <SafeAreaView style={styles.centerScreen}>
        <ActivityIndicator color={colors.gold} size="large" />
      </SafeAreaView>
    );
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      {activeTab === 'dashboard' ? (
        <DashboardScreen token={session.token} onNavigate={setActiveTab} onLogout={handleLogout} />
      ) : null}
      {activeTab === 'directory' ? (
        <DirectoryScreen token={session.token} onLogout={handleLogout} />
      ) : null}
      {activeTab === 'manage' ? (
        <ManageScreen token={session.token} />
      ) : null}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const payload = await api.login({ username: username.trim(), password });
      await onLogin(payload);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.centerScreen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.loginPanel}>
          <Image source={require('./assets/cbca-logo.png')} style={styles.logo} />
          <Text style={styles.eyebrow}>Annuaire CBCA</Text>
          <Text style={styles.title}>Connexion</Text>

          <Field label="Utilisateur" value={username} onChangeText={setUsername} autoCapitalize="none" keyboardType="email-address" />
          <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />

          {error ? <Notice type="error" message={error} /> : null}

          <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Ionicons name="log-in-outline" color={colors.white} size={21} />}
            <Text style={styles.primaryButtonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DashboardScreen({ token, onNavigate, onLogout }) {
  const [pastors, setPastors] = useState([]);
  const [postes, setPostes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    setLoading(true);
    try {
      const [pastorsPayload, postesPayload, gradesPayload] = await Promise.all([
        api.getPastors(token, { page: 1, limit: 1000 }),
        api.getPostes(token),
        api.getGrades(token)
      ]);
      setPastors(pastorsPayload.data || []);
      setPostes(postesPayload.data || []);
      setGrades(gradesPayload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  const regions = useMemo(() => new Set(postes.map((poste) => poste.region).filter(Boolean)).size, [postes]);
  const stats = [
    { label: 'Pasteurs', value: pastors.length, icon: 'account-group-outline' },
    { label: 'Postes', value: postes.length, icon: 'map-marker-radius-outline' },
    { label: 'Regions', value: regions, icon: 'map-outline' },
    { label: 'Grades', value: grades.length, icon: 'badge-account-outline' }
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl tintColor={colors.gold} refreshing={loading} onRefresh={load} />}
    >
      <Header title="Accueil" subtitle="Vue mobile de l'annuaire pastoral" rightIcon="log-out-outline" onRightPress={onLogout} />
      {error ? <Notice type="error" message={error} /> : null}

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View style={styles.statCard} key={stat.label}>
            <MaterialCommunityIcons name={stat.icon} color={colors.teal} size={25} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actions rapides</Text>
        <View style={styles.actionRow}>
          <ActionButton label="Annuaire" icon="search-outline" onPress={() => onNavigate('directory')} />
          <ActionButton label="Gestion" icon="create-outline" onPress={() => onNavigate('manage')} />
        </View>
      </View>

      <Text style={[styles.pageSubtitle, { marginBottom: 10 }]}>Derniers pasteurs</Text>
      {loading && pastors.length === 0 ? <ActivityIndicator color={colors.gold} /> : null}
      {!loading && pastors.length === 0 ? <EmptyState title="Aucun pasteur" text="Ajoutez le premier pasteur depuis l'onglet Gestion." /> : null}
      {pastors.slice(0, 5).map((pastor) => (
        <MiniRow title={pastor.nom} subtitle={`${pastor.degre} - ${pastor.poste}`} key={pastor.id} />
      ))}
    </ScrollView>
  );
}

function DirectoryScreen({ token, onLogout }) {
  const [query, setQuery] = useState('');
  const [activeGrade, setActiveGrade] = useState('');
  const [activePoste, setActivePoste] = useState('');
  const [pastors, setPastors] = useState([]);
  const [postes, setPostes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadReferences() {
    try {
      const [postesPayload, gradesPayload] = await Promise.all([api.getPostes(token), api.getGrades(token)]);
      setPostes(postesPayload.data || []);
      setGrades(gradesPayload.data || []);
    } catch {
      setPostes([]);
      setGrades([]);
    }
  }

  async function loadPastors() {
    setError('');
    setLoading(true);
    try {
      const payload = await api.searchPastors(token, {
        q: query,
        degre: activeGrade,
        poste: activePoste,
        page: 1,
        limit: 1000
      });
      setPastors(payload.data || []);
    } catch (loadError) {
      if (loadError.message.includes('Authentification') || loadError.message.includes('Session')) {
        onLogout();
        return;
      }
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReferences();
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(loadPastors, 300);
    return () => clearTimeout(timer);
  }, [query, activeGrade, activePoste]);

  const posteOptions = useMemo(() => {
    const values = postes.flatMap((poste) => [poste.nom, poste.region]).filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [postes]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl tintColor={colors.gold} refreshing={loading} onRefresh={loadPastors} />}
    >
      <Header title="Annuaire" subtitle={`${pastors.length} contact${pastors.length > 1 ? 's' : ''} affiche${pastors.length > 1 ? 's' : ''}`} />
      <Field label="Recherche" value={query} onChangeText={setQuery} placeholder="Nom, grade, poste..." />

      <ChipList label="Grades" values={grades.map((grade) => grade.nom)} active={activeGrade} onChange={setActiveGrade} />
      <ChipList label="Postes" values={posteOptions} active={activePoste} onChange={setActivePoste} />

      {error ? <Notice type="error" message={error} /> : null}
      {loading && pastors.length === 0 ? <ActivityIndicator color={colors.gold} /> : null}
      {!loading && pastors.length === 0 ? <EmptyState title="Aucun resultat" text="Essayez une autre recherche ou reinitialisez les filtres." /> : null}
      {pastors.map((pastor) => <PastorCard pastor={pastor} key={pastor.id} />)}
    </ScrollView>
  );
}

function ManageScreen({ token }) {
  const [section, setSection] = useState('pastors');
  const [pastors, setPastors] = useState([]);
  const [postes, setPostes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [pastorForm, setPastorForm] = useState(blankPastor());
  const [posteForm, setPosteForm] = useState(blankPoste());
  const [gradeForm, setGradeForm] = useState(blankGrade());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setError('');
    setLoading(true);
    try {
      const [pastorsPayload, postesPayload, gradesPayload] = await Promise.all([
        api.getPastors(token, { page: 1, limit: 1000 }),
        api.getPostes(token),
        api.getGrades(token)
      ]);
      setPastors(pastorsPayload.data || []);
      setPostes(postesPayload.data || []);
      setGrades(gradesPayload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  function resetForms() {
    setEditingId(null);
    setPastorForm(blankPastor(grades[0]?.nom || 'Pasteur'));
    setPosteForm(blankPoste());
    setGradeForm(blankGrade());
  }

  async function savePastor() {
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...pastorForm,
        email: pastorForm.email || null,
        date_affectation: pastorForm.date_affectation || null
      };
      if (editingId) {
        await api.updatePastor(token, editingId, payload);
        setMessage('Pasteur mis a jour.');
      } else {
        await api.createPastor(token, payload);
        setMessage('Pasteur ajoute.');
      }
      resetForms();
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function savePoste() {
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const payload = {
        nom: posteForm.nom,
        region: posteForm.region || null,
        description: posteForm.description || null
      };
      if (editingId) {
        await api.updatePoste(token, editingId, payload);
        setMessage('Poste mis a jour.');
      } else {
        await api.createPoste(token, payload);
        setMessage('Poste ajoute.');
      }
      resetForms();
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveGrade() {
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const payload = {
        nom: gradeForm.nom,
        description: gradeForm.description || null
      };
      if (editingId) {
        await api.updateGrade(token, editingId, payload);
        setMessage('Grade mis a jour.');
      } else {
        await api.createGrade(token, payload);
        setMessage('Grade ajoute.');
      }
      resetForms();
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(kind, id) {
    setError('');
    setMessage('');
    try {
      if (kind === 'pastor') await api.deletePastor(token, id);
      if (kind === 'poste') await api.deletePoste(token, id);
      if (kind === 'grade') await api.deleteGrade(token, id);
      setMessage('Element supprime.');
      resetForms();
      await load();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function confirmRemove(kind, id) {
    Alert.alert('Confirmer', 'Voulez-vous supprimer cet element ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => remove(kind, id) }
    ]);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl tintColor={colors.gold} refreshing={loading} onRefresh={load} />}
    >
      <Header title="Gestion" subtitle="Ajouter, modifier et supprimer les donnees" rightIcon="refresh-outline" onRightPress={load} />
      <ChipList values={['pastors', 'postes', 'grades']} labels={{ pastors: 'Pasteurs', postes: 'Postes', grades: 'Grades' }} active={section} onChange={(value) => { setSection(value); resetForms(); }} />

      {message ? <Notice type="success" message={message} /> : null}
      {error ? <Notice type="error" message={error} /> : null}

      {section === 'pastors' ? (
        <View>
          <FormPanel title={editingId ? 'Modifier pasteur' : 'Ajouter pasteur'}>
            <Field label="Nom complet" value={pastorForm.nom} onChangeText={(value) => setPastorForm({ ...pastorForm, nom: value })} />
            <ChipList label="Grade" values={grades.map((grade) => grade.nom)} active={pastorForm.degre} onChange={(value) => setPastorForm({ ...pastorForm, degre: value })} />
            <ChipList label="Poste" values={postes.map((poste) => poste.nom)} active={pastorForm.poste} onChange={(value) => setPastorForm({ ...pastorForm, poste: value })} />
            <Field label="Telephone" value={pastorForm.telephone} onChangeText={(value) => setPastorForm({ ...pastorForm, telephone: value })} keyboardType="phone-pad" />
            <Field label="Email" value={pastorForm.email} onChangeText={(value) => setPastorForm({ ...pastorForm, email: value })} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Date affectation" value={pastorForm.date_affectation} onChangeText={(value) => setPastorForm({ ...pastorForm, date_affectation: value })} placeholder="YYYY-MM-DD" />
            <SubmitRow saving={saving} onSubmit={savePastor} onCancel={editingId ? resetForms : null} />
          </FormPanel>
          {pastors.map((pastor) => (
            <ManageRow
              title={pastor.nom}
              subtitle={`${pastor.degre} - ${pastor.poste}`}
              key={pastor.id}
              onEdit={() => {
                setSection('pastors');
                setEditingId(pastor.id);
                setPastorForm({
                  nom: pastor.nom || '',
                  degre: pastor.degre || grades[0]?.nom || 'Pasteur',
                  poste: pastor.poste || '',
                  telephone: pastor.telephone || '',
                  email: pastor.email || '',
                  date_affectation: pastor.date_affectation ? String(pastor.date_affectation).slice(0, 10) : ''
                });
              }}
              onDelete={() => confirmRemove('pastor', pastor.id)}
            />
          ))}
        </View>
      ) : null}

      {section === 'postes' ? (
        <View>
          <FormPanel title={editingId ? 'Modifier poste' : 'Ajouter poste'}>
            <Field label="Nom du poste" value={posteForm.nom} onChangeText={(value) => setPosteForm({ ...posteForm, nom: value })} />
            <Field label="Region" value={posteForm.region} onChangeText={(value) => setPosteForm({ ...posteForm, region: value })} />
            <Field label="Description" value={posteForm.description} onChangeText={(value) => setPosteForm({ ...posteForm, description: value })} multiline />
            <SubmitRow saving={saving} onSubmit={savePoste} onCancel={editingId ? resetForms : null} />
          </FormPanel>
          {postes.map((poste) => (
            <ManageRow
              title={poste.nom}
              subtitle={poste.region || 'Sans region'}
              key={poste.id}
              onEdit={() => {
                setSection('postes');
                setEditingId(poste.id);
                setPosteForm({ nom: poste.nom || '', region: poste.region || '', description: poste.description || '' });
              }}
              onDelete={() => confirmRemove('poste', poste.id)}
            />
          ))}
        </View>
      ) : null}

      {section === 'grades' ? (
        <View>
          <FormPanel title={editingId ? 'Modifier grade' : 'Ajouter grade'}>
            <Field label="Nom du grade" value={gradeForm.nom} onChangeText={(value) => setGradeForm({ ...gradeForm, nom: value })} />
            <Field label="Description" value={gradeForm.description} onChangeText={(value) => setGradeForm({ ...gradeForm, description: value })} multiline />
            <SubmitRow saving={saving} onSubmit={saveGrade} onCancel={editingId ? resetForms : null} />
          </FormPanel>
          {grades.map((grade) => (
            <ManageRow
              title={grade.nom}
              subtitle={grade.description || 'Sans description'}
              key={grade.id}
              onEdit={() => {
                setSection('grades');
                setEditingId(grade.id);
                setGradeForm({ nom: grade.nom || '', description: grade.description || '' });
              }}
              onDelete={() => confirmRemove('grade', grade.id)}
            />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function PastorCard({ pastor }) {
  const digits = phoneDigits(pastor.telephone);
  const whatsapp = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(`Bonjour Pasteur ${pastor.nom}, je vous contacte via l'annuaire CBCA...`)}`
    : '';

  async function copy() {
    await Clipboard.setStringAsync(pastorContactText(pastor));
    Alert.alert('Contact copie', 'Les informations du pasteur sont dans le presse-papiers.');
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{pastor.degre} {pastor.nom}</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{pastor.degre}</Text></View>
      </View>
      <Text style={styles.meta}>{pastor.poste}</Text>
      {pastor.telephone ? <Text style={styles.meta}>{pastor.telephone}</Text> : null}
      {pastor.email ? <Text style={styles.meta}>{pastor.email}</Text> : null}
      <View style={styles.actionRow}>
        {pastor.telephone ? <RoundAction icon="call-outline" color={colors.blue} onPress={() => Linking.openURL(`tel:${pastor.telephone}`)} /> : null}
        {whatsapp ? <RoundAction icon="logo-whatsapp" color={colors.green} onPress={() => Linking.openURL(whatsapp)} /> : null}
        {pastor.email ? <RoundAction icon="mail-outline" color={colors.gold} onPress={() => Linking.openURL(`mailto:${pastor.email}`)} /> : null}
        <RoundAction icon="copy-outline" color={colors.teal} onPress={copy} />
      </View>
    </View>
  );
}

function BottomNav({ activeTab, onChange }) {
  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity style={[styles.navItem, active && styles.navItemActive]} onPress={() => onChange(tab.key)} key={tab.key}>
            <Ionicons name={tab.icon} color={active ? colors.blue : colors.white} size={22} />
            <Text style={[styles.navText, active && styles.navTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Header({ title, subtitle, rightIcon, onRightPress }) {
  return (
    <View style={styles.pageHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightIcon ? (
        <TouchableOpacity style={styles.iconButton} onPress={onRightPress}>
          <Ionicons name={rightIcon} color={colors.teal} size={23} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function SafeAreaView({ children, style }) {
  return (
    <View style={[style, { paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0 }]}>
      {children}
    </View>
  );
}

function Field({ label, multiline, style, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#6f857e"
        style={[styles.input, multiline && styles.textArea, style]}
        multiline={multiline}
        {...props}
      />
    </View>
  );
}

function ChipList({ label, values, labels = {}, active, onChange }) {
  if (!values.length) return null;
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        <TouchableOpacity style={[styles.chip, !active && styles.chipActive]} onPress={() => onChange('')}>
          <Text style={[styles.chipText, !active && styles.chipTextActive]}>Tous</Text>
        </TouchableOpacity>
        {values.map((value) => {
          const selected = active === value;
          return (
            <TouchableOpacity style={[styles.chip, selected && styles.chipActive]} onPress={() => onChange(value)} key={value}>
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>{labels[value] || value}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Notice({ type, message }) {
  return (
    <View style={[styles.notice, type === 'error' && styles.errorNotice, type === 'success' && styles.successNotice]}>
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}

function EmptyState({ title, text }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="file-tray-outline" color={colors.teal} size={34} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

function ActionButton({ label, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.ghostButton} onPress={onPress}>
      <Ionicons name={icon} color={colors.teal} size={20} />
      <Text style={styles.ghostText}>{label}</Text>
    </TouchableOpacity>
  );
}

function RoundAction({ icon, color, onPress }) {
  return (
    <TouchableOpacity style={styles.smallAction} onPress={onPress}>
      <Ionicons name={icon} color={color} size={22} />
    </TouchableOpacity>
  );
}

function MiniRow({ title, subtitle }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.meta}>{subtitle}</Text>
    </View>
  );
}

function FormPanel({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.cardTitle, { marginBottom: 14 }]}>{title}</Text>
      {children}
    </View>
  );
}

function SubmitRow({ saving, onSubmit, onCancel }) {
  return (
    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.primaryButton} onPress={onSubmit} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.white} /> : <Ionicons name="save-outline" color={colors.white} size={20} />}
        <Text style={styles.primaryButtonText}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
      </TouchableOpacity>
      {onCancel ? <ActionButton label="Annuler" icon="close-outline" onPress={onCancel} /> : null}
    </View>
  );
}

function ManageRow({ title, subtitle, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.meta}>{subtitle}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <RoundAction icon="pencil-outline" color={colors.gold} onPress={onEdit} />
          <RoundAction icon="trash-outline" color={colors.red} onPress={onDelete} />
        </View>
      </View>
    </View>
  );
}
