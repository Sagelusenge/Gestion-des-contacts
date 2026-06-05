import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import * as XLSX from 'xlsx';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
import { blankFonction, blankPastor, blankPoste, pastorContactText, phoneDigits } from './src/utils/format.js';
import { colors, styles } from './src/styles.js';

const SESSION_KEY = 'cbca_mobile_session';
const THEME_KEY = 'cbca_mobile_theme';

const darkColors = {
  ...colors,
  ink: '#081221',
  panel: '#101d34',
  panelSoft: '#172846',
  text: '#f8fbff',
  muted: '#a7b4c8',
  line: '#2e466c',
  white: '#ffffff',
  navy: '#06122a',
  redSoft: 'rgba(215, 25, 32, 0.18)'
};

const ThemeContext = createContext({
  palette: colors,
  themeName: 'light',
  toggleTheme: () => {}
});

function useTheme() {
  return useContext(ThemeContext);
}

const tabs = [
  { key: 'dashboard', label: 'Accueil', icon: 'grid-outline' },
  { key: 'directory', label: 'Annuaire', icon: 'search-outline' },
  { key: 'broadcast', label: 'Diffusion', icon: 'megaphone-outline' },
  { key: 'manage', label: 'Gestion', icon: 'create-outline' }
];


const excelHeaders = ['ID-SO_PA', 'Nom', 'Fonction', 'Poste', 'Entite', 'Region', 'Telephone', 'Email', 'Date affectation'];
const LIST_INITIAL_SIZE = 60;
const LIST_INCREMENT = 60;

function normalizeHeader(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function pickExcelValue(row, names) {
  const normalizedRow = Object.entries(row).reduce((accumulator, [key, value]) => {
    accumulator[normalizeHeader(key)] = value;
    return accumulator;
  }, {});
  const key = names.map(normalizeHeader).find((name) => normalizedRow[name] !== undefined && normalizedRow[name] !== '');
  return key ? normalizedRow[key] : '';
}

function normalizeExcelDate(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).trim();
}

function mapExcelPastorRows(rawRows) {
  return rawRows.map((row) => ({
    id_serviteur: pickExcelValue(row, ['ID-SO_PA', 'id serviteur', 'id']),
    nom: pickExcelValue(row, ['Nom', 'Noms', 'NOMS -POST NOMS CORRECT', 'Name']),
    fonction: pickExcelValue(row, ['Fonction', 'Grade', 'Degre', 'Degré']),
    poste: pickExcelValue(row, ['Poste']),
    entite: pickExcelValue(row, ['Entite', 'Entité', 'ENTITE']),
    region: pickExcelValue(row, ['Region', 'Région']),
    telephone: pickExcelValue(row, ['Telephone', 'Téléphone', 'NUMERO DE TELEPHONE', 'Phone']),
    email: pickExcelValue(row, ['Email']),
    date_affectation: normalizeExcelDate(pickExcelValue(row, ['Date affectation', 'Affectation', 'Date']))
  }));
}

function buildContactWhatsAppMessage(pastor) {
  const fonction = pastor.degre || 'Serviteur';
  return `Bonjour ${fonction} ${pastor.nom}, nous vous saluons au nom du Tout-Puissant. Nous vous contactons via l'annuaire CBCA pour une communication concernant votre fonction et votre poste.`;
}

function buildBroadcastWhatsAppMessage(pastor, message) {
  const fonction = pastor.degre || 'Serviteur';
  const intro = `Bonjour ${fonction} ${pastor.nom}, nous vous saluons au nom du Tout-Puissant.`;
  const body = message.trim();
  return body ? `${intro}\n${body}` : intro;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [themeName, setThemeName] = useState('light');
  const palette = themeName === 'dark' ? darkColors : colors;

  useEffect(() => {
    Promise.all([
      AsyncStorage.removeItem(SESSION_KEY),
      AsyncStorage.getItem(THEME_KEY).then((value) => {
        if (value === 'dark' || value === 'light') {
          setThemeName(value);
        }
      })
    ]).finally(() => setBooting(false));
  }, []);

  async function toggleTheme() {
    const nextTheme = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(nextTheme);
    await AsyncStorage.setItem(THEME_KEY, nextTheme);
  }

  async function handleLogin(nextSession) {
    setSession(nextSession);
    setActiveTab('dashboard');
  }

  async function handleLogout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setSession(null);
    setActiveTab('dashboard');
  }

  if (booting) {
    return (
      <ThemeContext.Provider value={{ palette, themeName, toggleTheme }}>
        <SafeAreaView style={styles.centerScreen}>
        <ActivityIndicator color={palette.blue} size="large" />
        </SafeAreaView>
      </ThemeContext.Provider>
    );
  }

  if (!session) {
    return (
      <ThemeContext.Provider value={{ palette, themeName, toggleTheme }}>
        <LoginScreen onLogin={handleLogin} />
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ palette, themeName, toggleTheme }}>
    <SafeAreaView style={styles.safe}>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      {activeTab === 'dashboard' ? (
        <DashboardScreen token={session.token} onNavigate={setActiveTab} onLogout={handleLogout} />
      ) : null}
      {activeTab === 'directory' ? (
        <DirectoryScreen token={session.token} onLogout={handleLogout} />
      ) : null}
      {activeTab === 'broadcast' ? (
        <BroadcastScreen token={session.token} />
      ) : null}
      {activeTab === 'manage' ? (
        <ManageScreen token={session.token} />
      ) : null}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
    </ThemeContext.Provider>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { palette, themeName, toggleTheme } = useTheme();

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
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.loginPanel, { backgroundColor: palette.panel, borderColor: palette.line }]}>
          <Image source={require('./assets/cbca-logo.png')} style={styles.logo} />
          <Text style={styles.eyebrow}>Annuaire CBCA</Text>
          <Text style={[styles.title, { color: palette.text }]}>Connexion</Text>

          <Field label="Utilisateur" value={username} onChangeText={setUsername} autoCapitalize="none" keyboardType="email-address" />
          <Field
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightPress={() => setShowPassword((current) => !current)}
          />

          {error ? <Notice type="error" message={error} /> : null}

          <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Ionicons name="log-in-outline" color={colors.white} size={21} />}
            <Text style={styles.primaryButtonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ghostButton, { marginTop: 12, borderColor: palette.line, backgroundColor: palette.panelSoft }]} onPress={toggleTheme}>
            <Ionicons name={themeName === 'dark' ? 'sunny-outline' : 'moon-outline'} color={palette.blue} size={20} />
            <Text style={[styles.ghostText, { color: palette.blue }]}>{themeName === 'dark' ? 'Mode clair' : 'Mode sombre'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DashboardScreen({ token, onNavigate, onLogout }) {
  const [pastors, setPastors] = useState([]);
  const [postes, setPostes] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { palette } = useTheme();

  async function load() {
    setError('');
    setLoading(true);
    try {
      const [pastorsPayload, postesPayload, fonctionsPayload] = await Promise.all([
        api.getPastors(token, { page: 1, limit: 5000 }),
        api.getPostes(token),
        api.getFonctions(token)
      ]);
      setPastors(pastorsPayload.data || []);
      setPostes(postesPayload.data || []);
      setFonctions(fonctionsPayload.data || []);
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
    { label: 'Fonctions', value: fonctions.length, icon: 'badge-account-outline' }
  ];

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: palette.ink }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl tintColor={palette.blue} refreshing={loading} onRefresh={load} />}
    >
      <Header title="Accueil" subtitle="Vue mobile de l'annuaire pastoral" rightIcon="log-out-outline" onRightPress={onLogout} />
      {error ? <Notice type="error" message={error} /> : null}

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View style={[styles.statCard, { backgroundColor: palette.panel, borderColor: palette.line }]} key={stat.label}>
            <MaterialCommunityIcons name={stat.icon} color={palette.red} size={25} />
            <Text style={[styles.statValue, { color: palette.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: palette.muted }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.line }]}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Actions rapides</Text>
        <View style={styles.actionRow}>
          <ActionButton label="Annuaire" icon="search-outline" onPress={() => onNavigate('directory')} />
          <ActionButton label="Diffusion" icon="megaphone-outline" onPress={() => onNavigate('broadcast')} />
          <ActionButton label="Gestion" icon="create-outline" onPress={() => onNavigate('manage')} />
        </View>
      </View>

      <Text style={[styles.pageSubtitle, { marginBottom: 10, color: palette.muted }]}>Derniers pasteurs</Text>
      {loading && pastors.length === 0 ? <ActivityIndicator color={palette.blue} /> : null}
      {!loading && pastors.length === 0 ? <EmptyState title="Aucun pasteur" text="Ajoutez le premier pasteur depuis l'onglet Gestion." /> : null}
      {pastors.slice(0, 5).map((pastor) => (
        <MiniRow title={pastor.nom} subtitle={`${pastor.degre} - ${pastor.poste}`} key={pastor.id} />
      ))}
    </ScrollView>
  );
}

function DirectoryScreen({ token, onLogout }) {
  const [query, setQuery] = useState('');
  const [activeFonction, setActiveFonction] = useState('');
  const [activePoste, setActivePoste] = useState('');
  const [pastors, setPastors] = useState([]);
  const [postes, setPostes] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(LIST_INITIAL_SIZE);
  const { palette } = useTheme();

  async function loadReferences() {
    try {
      const [postesPayload, fonctionsPayload] = await Promise.all([api.getPostes(token), api.getFonctions(token)]);
      setPostes(postesPayload.data || []);
      setFonctions(fonctionsPayload.data || []);
    } catch {
      setPostes([]);
      setFonctions([]);
    }
  }

  async function loadPastors() {
    setError('');
    setLoading(true);
    try {
      const payload = await api.searchPastors(token, {
        q: query,
        degre: activeFonction,
        poste: activePoste,
        page: 1,
        limit: 5000
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
  }, [query, activeFonction, activePoste]);

  useEffect(() => {
    setVisibleCount(LIST_INITIAL_SIZE);
  }, [query, activeFonction, activePoste]);

  const posteOptions = useMemo(() => {
    const values = postes.flatMap((poste) => [poste.nom, poste.region]).filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [postes]);
  const visiblePastors = useMemo(() => pastors.slice(0, visibleCount), [pastors, visibleCount]);
  const remainingPastors = pastors.length - visiblePastors.length;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: palette.ink }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl tintColor={palette.blue} refreshing={loading} onRefresh={loadPastors} />}
    >
      <Header title="Annuaire" subtitle={`${pastors.length} contact${pastors.length > 1 ? 's' : ''} affiche${pastors.length > 1 ? 's' : ''}`} />
      <Field label="Recherche" value={query} onChangeText={setQuery} placeholder="Nom, fonction, poste..." />

      <ChipList label="Fonctions" values={fonctions.map((fonction) => fonction.nom)} active={activeFonction} onChange={setActiveFonction} searchable searchPlaceholder="Rechercher une fonction..." />
      <ChipList label="Postes" values={posteOptions} active={activePoste} onChange={setActivePoste} searchable searchPlaceholder="Rechercher un poste..." />

      {error ? <Notice type="error" message={error} /> : null}
      {loading && pastors.length === 0 ? <ActivityIndicator color={palette.blue} /> : null}
      {!loading && pastors.length === 0 ? <EmptyState title="Aucun resultat" text="Essayez une autre recherche ou reinitialisez les filtres." /> : null}
      {visiblePastors.map((pastor) => <PastorCard pastor={pastor} key={pastor.id} />)}
      {remainingPastors > 0 ? (
        <ActionButton
          label={`Afficher ${Math.min(LIST_INCREMENT, remainingPastors)} de plus`}
          icon="chevron-down-outline"
          onPress={() => setVisibleCount((current) => current + LIST_INCREMENT)}
        />
      ) : null}
    </ScrollView>
  );
}

function BroadcastScreen({ token }) {
  const [pastors, setPastors] = useState([]);
  const [postes, setPostes] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [filterType, setFilterType] = useState('poste');
  const [selectedValue, setSelectedValue] = useState('');
  const [message, setMessage] = useState('');
  const [showRecipients, setShowRecipients] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [recipientsVisibleCount, setRecipientsVisibleCount] = useState(LIST_INITIAL_SIZE);
  const [apiSending, setApiSending] = useState(false);
  const [apiSummary, setApiSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { palette } = useTheme();

  async function load() {
    setError('');
    setLoading(true);
    try {
      const [pastorsPayload, postesPayload, fonctionsPayload] = await Promise.all([
        api.getPastors(token, { page: 1, limit: 5000 }),
        api.getPostes(token),
        api.getFonctions(token)
      ]);
      setPastors(pastorsPayload.data || []);
      setPostes(postesPayload.data || []);
      setFonctions(fonctionsPayload.data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  const regionByPoste = useMemo(() => {
    return postes.reduce((accumulator, poste) => {
      if (poste.nom) {
        accumulator.set(poste.nom, poste.region || '');
      }
      return accumulator;
    }, new Map());
  }, [postes]);

  const filterValues = useMemo(() => {
    if (filterType === 'poste') {
      return [...new Set(postes.map((poste) => poste.nom).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    }

    if (filterType === 'region') {
      return [...new Set(postes.map((poste) => poste.region).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    }

    return [...new Set(fonctions.map((fonction) => fonction.nom).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [filterType, postes, fonctions]);

  const recipients = useMemo(() => {
    return pastors
      .filter((pastor) => {
        if (!selectedValue) {
          return true;
        }

        if (filterType === 'poste') {
          return pastor.poste === selectedValue;
        }

        if (filterType === 'region') {
          return regionByPoste.get(pastor.poste) === selectedValue;
        }

        return pastor.degre === selectedValue;
      })
      .map((pastor) => ({
        ...pastor,
        whatsappPhone: phoneDigits(pastor.telephone)
      }))
      .filter((pastor) => pastor.whatsappPhone);
  }, [filterType, pastors, regionByPoste, selectedValue]);

  const canSend = Boolean(message.trim() && recipients.length);
  const activeRecipient = currentIndex >= 0 ? recipients[currentIndex] : null;
  const visibleRecipients = useMemo(() => recipients.slice(0, recipientsVisibleCount), [recipients, recipientsVisibleCount]);
  const remainingRecipients = recipients.length - visibleRecipients.length;

  function whatsappUrl(recipient) {
    return `https://wa.me/${recipient.whatsappPhone}?text=${encodeURIComponent(buildBroadcastWhatsAppMessage(recipient, message))}`;
  }

  async function copyMessage() {
    if (!message.trim()) {
      return;
    }
    await Clipboard.setStringAsync(message.trim());
    Alert.alert('Message copie', 'Le message est pret a coller dans WhatsApp.');
  }

  function openRecipientAt(index) {
    if (!canSend) {
      return;
    }
    const recipient = recipients[index];

    if (!recipient) {
      Alert.alert('Diffusion terminee', 'Tous les destinataires de cette categorie ont ete ouverts.');
      return;
    }

    setCurrentIndex(index);
    setShowRecipients(true);
    Linking.openURL(whatsappUrl(recipient));
  }

  function openFirstRecipient() {
    openRecipientAt(0);
  }

  function openNextRecipient() {
    openRecipientAt(currentIndex + 1);
  }

  async function sendWithApi() {
    if (!canSend || apiSending) {
      return;
    }

    setError('');
    setApiSummary('');
    setApiSending(true);

    try {
      const payload = await api.sendWhatsappBroadcast(token, {
        message,
        ids: recipients.map((recipient) => recipient.id)
      });
      const summary = payload.data || {};
      const text = `${summary.sent || 0} envoye(s), ${summary.failed || 0} echec(s), ${summary.skipped || 0} ignore(s).`;
      setApiSummary(text);
      Alert.alert('Diffusion terminee', text);
      if (summary.errors?.length) {
        setError(summary.errors.map((item) => `${item.nom}: ${item.error}`).join(' '));
      }
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setApiSending(false);
    }
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: palette.ink }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl tintColor={palette.blue} refreshing={loading} onRefresh={load} />}
    >
      <Header title="Diffusion" subtitle="Message WhatsApp par poste, region ou fonction" rightIcon="refresh-outline" onRightPress={load} />
      {error ? <Notice type="error" message={error} /> : null}

      <FormPanel title="Cible de diffusion">
        <ChipList
          label="Categorie"
          values={['poste', 'region', 'fonction']}
          labels={{ poste: 'Poste', region: 'Region', fonction: 'Fonction' }}
          active={filterType}
          includeAll={false}
          onChange={(value) => {
            setFilterType(value);
            setSelectedValue('');
            setShowRecipients(false);
            setCurrentIndex(-1);
            setRecipientsVisibleCount(LIST_INITIAL_SIZE);
            setApiSummary('');
          }}
        />
        <ChipList
          label={filterType === 'poste' ? 'Postes' : filterType === 'region' ? 'Regions' : 'Fonctions'}
          values={filterValues}
          active={selectedValue}
          searchable
          searchPlaceholder={filterType === 'poste' ? 'Rechercher un poste...' : filterType === 'region' ? 'Rechercher une region...' : 'Rechercher une fonction...'}
          onChange={(value) => {
            setSelectedValue(value);
            setShowRecipients(false);
            setCurrentIndex(-1);
            setRecipientsVisibleCount(LIST_INITIAL_SIZE);
            setApiSummary('');
          }}
        />
        <Field
          label="Message a envoyer"
          value={message}
          onChangeText={(value) => {
            setMessage(value);
            setShowRecipients(false);
            setCurrentIndex(-1);
            setRecipientsVisibleCount(LIST_INITIAL_SIZE);
            setApiSummary('');
          }}
          multiline
          placeholder="Ex: Reunion ce samedi a 10h au bureau CBCA..."
        />
        <Notice
          message="WhatsApp demande de valider chaque envoi. L'application prepare le message et ouvre chaque destinataire automatiquement, puis vous appuyez sur Envoyer dans WhatsApp."
        />
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: palette.text }]}>{recipients.length} destinataire{recipients.length > 1 ? 's' : ''}</Text>
            <Text style={[styles.meta, { color: palette.muted }]}>
              {selectedValue ? `${filterType}: ${selectedValue}` : 'Tous les serviteurs avec numero WhatsApp'}
            </Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={openFirstRecipient} disabled={!canSend}>
            <Ionicons name="logo-whatsapp" color={colors.white} size={20} />
            <Text style={styles.primaryButtonText}>Demarrer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={sendWithApi} disabled={!canSend || apiSending}>
            {apiSending ? <ActivityIndicator color={colors.white} /> : <Ionicons name="send-outline" color={colors.white} size={20} />}
            <Text style={styles.primaryButtonText}>{apiSending ? 'Envoi...' : 'Envoyer via API'}</Text>
          </TouchableOpacity>
          {activeRecipient ? (
            <ActionButton
              label={currentIndex + 1 >= recipients.length ? 'Termine' : 'Suivant'}
              icon="arrow-forward-outline"
              onPress={openNextRecipient}
            />
          ) : null}
          <ActionButton label="Copier" icon="copy-outline" onPress={copyMessage} />
          <ActionButton
            label={showRecipients ? 'Masquer' : 'Liste'}
            icon="people-outline"
            onPress={() => setShowRecipients((current) => !current)}
          />
        </View>
        {activeRecipient ? (
          <Text style={[styles.meta, { color: palette.muted }]}>
            Progression: {currentIndex + 1}/{recipients.length} - {activeRecipient.nom}
          </Text>
        ) : null}
        {apiSummary ? <Notice type="success" message={apiSummary} /> : null}
      </FormPanel>

      {loading && recipients.length === 0 ? <ActivityIndicator color={palette.blue} /> : null}
      {!loading && recipients.length === 0 ? (
        <EmptyState title="Aucun destinataire" text="Choisissez une autre categorie ou verifiez les numeros de telephone." />
      ) : null}

      {showRecipients ? visibleRecipients.map((recipient, index) => (
        <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.line }]} key={recipient.id}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>{index + 1}. {recipient.nom}</Text>
              <Text style={[styles.meta, { color: palette.muted }]}>{recipient.degre} - {recipient.poste}</Text>
              <Text style={[styles.meta, { color: palette.muted }]}>WhatsApp: {recipient.whatsappPhone}</Text>
            </View>
            <RoundAction icon="logo-whatsapp" color={colors.green} onPress={() => Linking.openURL(whatsappUrl(recipient))} />
          </View>
        </View>
      )) : null}
      {showRecipients && remainingRecipients > 0 ? (
        <ActionButton
          label={`Afficher ${Math.min(LIST_INCREMENT, remainingRecipients)} destinataires de plus`}
          icon="chevron-down-outline"
          onPress={() => setRecipientsVisibleCount((current) => current + LIST_INCREMENT)}
        />
      ) : null}
    </ScrollView>
  );
}

function ManageScreen({ token }) {
  const [section, setSection] = useState('pastors');
  const [pastors, setPastors] = useState([]);
  const [postes, setPostes] = useState([]);
  const [fonctions, setFonctions] = useState([]);
  const [users, setUsers] = useState([]);
  const [pastorForm, setPastorForm] = useState(blankPastor());
  const [posteForm, setPosteForm] = useState(blankPoste());
  const [fonctionForm, setFonctionForm] = useState(blankFonction());
  const [userForm, setUserForm] = useState({ username: '', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pastorSearch, setPastorSearch] = useState('');
  const [posteSearch, setPosteSearch] = useState('');
  const [fonctionSearch, setFonctionSearch] = useState('');
  const [manageVisibleCount, setManageVisibleCount] = useState(LIST_INITIAL_SIZE);
  const { palette } = useTheme();

  const visiblePastors = useMemo(() => {
    const search = normalizeSearch(pastorSearch);
    return pastors.filter((pastor) => {
      if (!search) {
        return true;
      }

      return [pastor.nom, pastor.degre, pastor.poste, pastor.entite, pastor.telephone].some((value) => normalizeSearch(value).includes(search));
    });
  }, [pastors, pastorSearch]);

  const visiblePostes = useMemo(() => {
    const search = normalizeSearch(posteSearch);
    return postes.filter((poste) => {
      if (!search) {
        return true;
      }

      return [poste.nom, poste.region, poste.description].some((value) => normalizeSearch(value).includes(search));
    });
  }, [postes, posteSearch]);

  const visibleFonctions = useMemo(() => {
    const search = normalizeSearch(fonctionSearch);
    return fonctions.filter((fonction) => {
      if (!search) {
        return true;
      }

      return [fonction.nom, fonction.description].some((value) => normalizeSearch(value).includes(search));
    });
  }, [fonctions, fonctionSearch]);
  const shownPastors = useMemo(() => visiblePastors.slice(0, manageVisibleCount), [manageVisibleCount, visiblePastors]);
  const shownPostes = useMemo(() => visiblePostes.slice(0, manageVisibleCount), [manageVisibleCount, visiblePostes]);
  const shownFonctions = useMemo(() => visibleFonctions.slice(0, manageVisibleCount), [manageVisibleCount, visibleFonctions]);

  useEffect(() => {
    setManageVisibleCount(LIST_INITIAL_SIZE);
  }, [section, pastorSearch, posteSearch, fonctionSearch]);

  async function load() {
    setError('');
    setLoading(true);
    try {
      const [pastorsPayload, postesPayload, fonctionsPayload] = await Promise.all([
        api.getPastors(token, { page: 1, limit: 5000 }),
        api.getPostes(token),
        api.getFonctions(token)
      ]);
      const usersPayload = await api.getUsers(token).catch(() => ({ data: [] }));
      setPastors(pastorsPayload.data || []);
      setPostes(postesPayload.data || []);
      setFonctions(fonctionsPayload.data || []);
      setUsers(usersPayload.data || []);
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
    setPastorForm(blankPastor(fonctions[0]?.nom || 'Pasteur'));
    setPosteForm(blankPoste());
    setFonctionForm(blankFonction());
    setUserForm({ username: '', password: '' });
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

  async function importPastorsFromExcel() {
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          'text/comma-separated-values'
        ],
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];
      if (!file?.uri) {
        throw new Error('Fichier introuvable.');
      }

      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      const workbook = XLSX.read(base64, { type: 'base64', cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
      const rows = mapExcelPastorRows(rawRows);
      const payload = await api.importPastors(token, rows);
      const summary = payload.data || {};

      setMessage(`${summary.imported || 0} pasteur(s) importes. ${summary.createdFunctions || 0} fonction(s) et ${summary.createdPostes || 0} poste(s) crees.`);
      if (summary.errors?.length) {
        setError(summary.errors.slice(0, 3).join(' '));
      }
      await load();
    } catch (importError) {
      setError(importError.message);
    } finally {
      setSaving(false);
    }
  }

  async function exportPastorsToExcel() {
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const regionByPoste = new Map(postes.map((poste) => [poste.nom, poste.region || '']));
      const rows = pastors.map((pastor) => ({
        'ID-SO_PA': pastor.id_serviteur || '',
        Nom: pastor.nom || '',
        Fonction: pastor.degre || '',
        Poste: pastor.poste || '',
        Entite: pastor.entite || '',
        Region: regionByPoste.get(pastor.poste) || '',
        Telephone: pastor.telephone || '',
        Email: pastor.email || '',
        'Date affectation': pastor.date_affectation ? String(pastor.date_affectation).slice(0, 10) : ''
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows, { header: excelHeaders });
      worksheet['!cols'] = [
        { wch: 14 },
        { wch: 28 },
        { wch: 20 },
        { wch: 20 },
        { wch: 24 },
        { wch: 18 },
        { wch: 18 },
        { wch: 28 },
        { wch: 18 }
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pasteurs');
      const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      const uri = `${FileSystem.cacheDirectory}pasteurs-cbca-${new Date().toISOString().slice(0, 10)}.xlsx`;
      await FileSystem.writeAsStringAsync(uri, base64, {
        encoding: FileSystem.EncodingType.Base64
      });

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("Le partage de fichier n'est pas disponible sur ce telephone.");
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Exporter les pasteurs CBCA',
        UTI: 'com.microsoft.excel.xlsx'
      });
      setMessage('Export Excel prepare.');
    } catch (exportError) {
      setError(exportError.message);
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

  async function saveFonction() {
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const payload = {
        nom: fonctionForm.nom,
        description: fonctionForm.description || null
      };
      if (editingId) {
        await api.updateFonction(token, editingId, payload);
        setMessage('Fonction mise a jour.');
      } else {
        await api.createFonction(token, payload);
        setMessage('Fonction ajoutee.');
      }
      resetForms();
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveUser() {
    setMessage('');
    setError('');
    setSaving(true);
    try {
      await api.createUser(token, {
        username: userForm.username,
        password: userForm.password
      });
      setMessage('Utilisateur ajoute.');
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
      if (kind === 'fonction') await api.deleteFonction(token, id);
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
      style={[styles.screen, { backgroundColor: palette.ink }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl tintColor={palette.blue} refreshing={loading} onRefresh={load} />}
    >
      <Header title="Gestion" subtitle="Ajouter, modifier et supprimer les donnees" rightIcon="refresh-outline" onRightPress={load} />
      <ChipList values={['pastors', 'postes', 'fonctions', 'users']} labels={{ pastors: 'Pasteurs', postes: 'Postes', fonctions: 'Fonctions', users: 'Users' }} active={section} onChange={(value) => { setSection(value); resetForms(); }} includeAll={false} />

      {message ? <Notice type="success" message={message} /> : null}
      {error ? <Notice type="error" message={error} /> : null}

      {section === 'pastors' ? (
        <View>
          <FormPanel title={editingId ? 'Modifier pasteur' : 'Ajouter pasteur'}>
            <View style={styles.actionRow}>
              <ActionButton label="Importer Excel" icon="cloud-upload-outline" onPress={importPastorsFromExcel} />
              <ActionButton label="Exporter Excel" icon="download-outline" onPress={exportPastorsToExcel} />
            </View>
            <Field label="Nom complet" value={pastorForm.nom} onChangeText={(value) => setPastorForm({ ...pastorForm, nom: value })} />
            <Field label="ID serviteur" value={pastorForm.id_serviteur} onChangeText={(value) => setPastorForm({ ...pastorForm, id_serviteur: value })} placeholder="Ex: 000246" />
            <ChipList label="Fonction" values={fonctions.map((fonction) => fonction.nom)} active={pastorForm.degre} onChange={(value) => setPastorForm({ ...pastorForm, degre: value })} searchable searchPlaceholder="Rechercher une fonction..." />
            <ChipList label="Poste" values={postes.map((poste) => poste.nom)} active={pastorForm.poste} onChange={(value) => setPastorForm({ ...pastorForm, poste: value })} searchable searchPlaceholder="Rechercher un poste..." />
            <Field label="Entite" value={pastorForm.entite} onChangeText={(value) => setPastorForm({ ...pastorForm, entite: value })} placeholder="Ex: Bureau poste Bambo" />
            <Field label="Telephone" value={pastorForm.telephone} onChangeText={(value) => setPastorForm({ ...pastorForm, telephone: value })} keyboardType="phone-pad" />
            <Field label="Email" value={pastorForm.email} onChangeText={(value) => setPastorForm({ ...pastorForm, email: value })} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Date affectation" value={pastorForm.date_affectation} onChangeText={(value) => setPastorForm({ ...pastorForm, date_affectation: value })} placeholder="YYYY-MM-DD" />
            <SubmitRow saving={saving} onSubmit={savePastor} onCancel={editingId ? resetForms : null} />
          </FormPanel>
          <Field label="Rechercher dans les serviteurs" value={pastorSearch} onChangeText={setPastorSearch} placeholder="Nom, fonction, poste..." />
          {shownPastors.map((pastor) => (
            <ManageRow
              title={pastor.nom}
              subtitle={`${pastor.degre} - ${pastor.poste}${pastor.entite ? ` - ${pastor.entite}` : ''}`}
              key={pastor.id}
              onEdit={() => {
                setSection('pastors');
                setEditingId(pastor.id);
                setPastorForm({
                  nom: pastor.nom || '',
                  id_serviteur: pastor.id_serviteur || '',
                  degre: pastor.degre || fonctions[0]?.nom || 'Pasteur',
                  poste: pastor.poste || '',
                  entite: pastor.entite || '',
                  telephone: pastor.telephone || '',
                  email: pastor.email || '',
                  date_affectation: pastor.date_affectation ? String(pastor.date_affectation).slice(0, 10) : ''
                });
              }}
              onDelete={() => confirmRemove('pastor', pastor.id)}
            />
          ))}
          {visiblePastors.length > shownPastors.length ? (
            <ActionButton
              label={`Afficher ${Math.min(LIST_INCREMENT, visiblePastors.length - shownPastors.length)} de plus`}
              icon="chevron-down-outline"
              onPress={() => setManageVisibleCount((current) => current + LIST_INCREMENT)}
            />
          ) : null}
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
          <Field label="Rechercher dans les postes" value={posteSearch} onChangeText={setPosteSearch} placeholder="Poste, region..." />
          {shownPostes.map((poste) => (
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
          {visiblePostes.length > shownPostes.length ? (
            <ActionButton
              label={`Afficher ${Math.min(LIST_INCREMENT, visiblePostes.length - shownPostes.length)} de plus`}
              icon="chevron-down-outline"
              onPress={() => setManageVisibleCount((current) => current + LIST_INCREMENT)}
            />
          ) : null}
        </View>
      ) : null}

      {section === 'fonctions' ? (
        <View>
          <FormPanel title={editingId ? 'Modifier fonction' : 'Ajouter fonction'}>
            <Field label="Nom de la fonction" value={fonctionForm.nom} onChangeText={(value) => setFonctionForm({ ...fonctionForm, nom: value })} />
            <Field label="Description" value={fonctionForm.description} onChangeText={(value) => setFonctionForm({ ...fonctionForm, description: value })} multiline />
            <SubmitRow saving={saving} onSubmit={saveFonction} onCancel={editingId ? resetForms : null} />
          </FormPanel>
          <Field label="Rechercher dans les fonctions" value={fonctionSearch} onChangeText={setFonctionSearch} placeholder="Fonction..." />
          {shownFonctions.map((fonction) => (
            <ManageRow
              title={fonction.nom}
              subtitle={fonction.description || 'Sans description'}
              key={fonction.id}
              onEdit={() => {
                setSection('fonctions');
                setEditingId(fonction.id);
                setFonctionForm({ nom: fonction.nom || '', description: fonction.description || '' });
              }}
              onDelete={() => confirmRemove('fonction', fonction.id)}
            />
          ))}
          {visibleFonctions.length > shownFonctions.length ? (
            <ActionButton
              label={`Afficher ${Math.min(LIST_INCREMENT, visibleFonctions.length - shownFonctions.length)} de plus`}
              icon="chevron-down-outline"
              onPress={() => setManageVisibleCount((current) => current + LIST_INCREMENT)}
            />
          ) : null}
        </View>
      ) : null}

      {section === 'users' ? (
        <View>
          <FormPanel title="Creer un utilisateur">
            <Field
              label="Email"
              value={userForm.username}
              onChangeText={(value) => setUserForm({ ...userForm, username: value })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@exemple.com"
            />
            <Field
              label="Mot de passe"
              value={userForm.password}
              onChangeText={(value) => setUserForm({ ...userForm, password: value })}
              secureTextEntry
              placeholder="Minimum 6 caracteres"
            />
            <SubmitRow saving={saving} onSubmit={saveUser} />
          </FormPanel>
          {users.map((user) => (
            <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.line }]} key={user.id}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>{user.username}</Text>
              <Text style={[styles.meta, { color: palette.muted }]}>{user.role}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function PastorCard({ pastor }) {
  const { palette } = useTheme();
  const digits = phoneDigits(pastor.telephone);
  const whatsapp = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(buildContactWhatsAppMessage(pastor))}`
    : '';

  async function copy() {
    await Clipboard.setStringAsync(pastorContactText(pastor));
    Alert.alert('Contact copie', 'Les informations du pasteur sont dans le presse-papiers.');
  }

  return (
    <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.line }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>{pastor.degre} {pastor.nom}</Text>
        <View style={[styles.badge, { backgroundColor: palette.panelSoft }]}><Text style={[styles.badgeText, { color: palette.blue }]}>{pastor.degre}</Text></View>
      </View>
      <Text style={[styles.meta, { color: palette.muted }]}>{pastor.poste}</Text>
      {pastor.id_serviteur ? <Text style={[styles.meta, { color: palette.muted }]}>ID: {pastor.id_serviteur}</Text> : null}
      {pastor.entite ? <Text style={[styles.meta, { color: palette.muted }]}>Entite: {pastor.entite}</Text> : null}
      {pastor.telephone ? <Text style={[styles.meta, { color: palette.muted }]}>{pastor.telephone}</Text> : null}
      {pastor.email ? <Text style={[styles.meta, { color: palette.muted }]}>{pastor.email}</Text> : null}
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
  const { palette } = useTheme();
  return (
    <View style={[styles.bottomNav, { backgroundColor: palette.navy, borderColor: palette.line }]}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity style={[styles.navItem, active && { backgroundColor: palette.panel }]} onPress={() => onChange(tab.key)} key={tab.key}>
            <Ionicons name={tab.icon} color={active ? palette.blue : palette.white} size={22} />
            <Text style={[styles.navText, { color: active ? palette.blue : palette.muted }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Header({ title, subtitle, rightIcon, onRightPress }) {
  const { palette, themeName, toggleTheme } = useTheme();
  return (
    <View style={styles.pageHeader}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.pageTitle, { color: palette.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.pageSubtitle, { color: palette.muted }]}>{subtitle}</Text> : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: palette.panel, borderColor: palette.line }]} onPress={toggleTheme}>
          <Ionicons name={themeName === 'dark' ? 'sunny-outline' : 'moon-outline'} color={palette.blue} size={23} />
        </TouchableOpacity>
        {rightIcon ? (
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: palette.panel, borderColor: palette.line }]} onPress={onRightPress}>
            <Ionicons name={rightIcon} color={palette.red} size={23} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function SafeAreaView({ children, style }) {
  const { palette } = useTheme();
  return (
    <View style={[style, { paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0, backgroundColor: palette.ink }]}>
      {children}
    </View>
  );
}

function Field({ label, multiline, style, rightIcon, onRightPress, ...props }) {
  const { palette } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: palette.muted }]}>{label}</Text>
      <View style={[styles.input, multiline && styles.textArea, { backgroundColor: palette.panelSoft, borderColor: palette.line, flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', paddingHorizontal: 0 }]}>
        <TextInput
          placeholderTextColor={palette.muted}
          style={[{ flex: 1, minHeight: multiline ? 68 : 50, paddingHorizontal: 14, color: palette.text, fontSize: 16, fontWeight: '700' }, multiline && { paddingTop: 12, textAlignVertical: 'top' }, style]}
          multiline={multiline}
          {...props}
        />
        {rightIcon ? (
          <TouchableOpacity style={{ width: 48, minHeight: 50, alignItems: 'center', justifyContent: 'center' }} onPress={onRightPress}>
            <Ionicons name={rightIcon} color={palette.muted} size={22} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function ChipList({ label, values, labels = {}, active, onChange, includeAll = true, searchable = false, searchPlaceholder = 'Rechercher...' }) {
  const { palette } = useTheme();
  const [search, setSearch] = useState('');
  const visibleValues = useMemo(() => {
    const needle = normalizeSearch(search);
    return values.filter((value) => !needle || active === value || normalizeSearch(labels[value] || value).includes(needle));
  }, [active, labels, search, values]);
  if (!values.length) return null;
  return (
    <View>
      {label ? <Text style={[styles.label, { color: palette.muted }]}>{label}</Text> : null}
      {searchable ? (
        <View style={[styles.chipSearch, { backgroundColor: palette.panelSoft, borderColor: palette.line }]}>
          <Ionicons name="search-outline" color={palette.muted} size={18} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={searchPlaceholder}
            placeholderTextColor={palette.muted}
            style={[styles.chipSearchInput, { color: palette.text }]}
          />
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {includeAll ? (
          <TouchableOpacity style={[styles.chip, { backgroundColor: palette.panel, borderColor: palette.line }, !active && { backgroundColor: palette.blue, borderColor: palette.blue }]} onPress={() => onChange('')}>
            <Text style={[styles.chipText, { color: !active ? palette.white : palette.text }]}>Tous</Text>
          </TouchableOpacity>
        ) : null}
        {visibleValues.map((value) => {
          const selected = active === value;
          return (
            <TouchableOpacity style={[styles.chip, { backgroundColor: palette.panel, borderColor: palette.line }, selected && { backgroundColor: palette.blue, borderColor: palette.blue }]} onPress={() => onChange(value)} key={value}>
              <Text style={[styles.chipText, { color: selected ? palette.white : palette.text }]}>{labels[value] || value}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Notice({ type, message }) {
  const { palette } = useTheme();
  const backgroundColor = type === 'error' ? palette.redSoft : type === 'success' ? 'rgba(22, 163, 74, 0.16)' : palette.panel;
  const borderColor = type === 'error' ? 'rgba(215, 25, 32, 0.55)' : type === 'success' ? 'rgba(22, 163, 74, 0.55)' : palette.line;

  return (
    <View style={[styles.notice, { backgroundColor, borderColor }]}>
      <Text style={[styles.noticeText, { color: palette.text }]}>{message}</Text>
    </View>
  );
}

function EmptyState({ title, text }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.empty, { backgroundColor: palette.panel, borderColor: palette.line }]}>
      <Ionicons name="file-tray-outline" color={palette.red} size={34} />
      <Text style={[styles.emptyTitle, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: palette.muted }]}>{text}</Text>
    </View>
  );
}

function ActionButton({ label, icon, onPress }) {
  const { palette } = useTheme();
  return (
    <TouchableOpacity style={[styles.ghostButton, { backgroundColor: palette.panel, borderColor: palette.line }]} onPress={onPress}>
      <Ionicons name={icon} color={palette.blue} size={20} />
      <Text style={[styles.ghostText, { color: palette.blue }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function RoundAction({ icon, color, onPress }) {
  const { palette } = useTheme();
  return (
    <TouchableOpacity style={[styles.smallAction, { backgroundColor: palette.panelSoft }]} onPress={onPress}>
      <Ionicons name={icon} color={color} size={22} />
    </TouchableOpacity>
  );
}

function MiniRow({ title, subtitle }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.line }]}>
      <Text style={[styles.cardTitle, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.meta, { color: palette.muted }]}>{subtitle}</Text>
    </View>
  );
}

function FormPanel({ title, children }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.line }]}>
      <Text style={[styles.cardTitle, { marginBottom: 14, color: palette.text }]}>{title}</Text>
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
  const { palette } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.line }]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.meta, { color: palette.muted }]}>{subtitle}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <RoundAction icon="pencil-outline" color={colors.gold} onPress={onEdit} />
          <RoundAction icon="trash-outline" color={colors.red} onPress={onDelete} />
        </View>
      </View>
    </View>
  );
}

