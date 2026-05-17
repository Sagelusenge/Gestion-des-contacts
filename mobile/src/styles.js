import { StyleSheet } from 'react-native';

export const colors = {
  ink: '#f4f7fb',
  panel: '#ffffff',
  panelSoft: '#eef4fb',
  text: '#071b3f',
  muted: '#657389',
  line: '#d9e3f2',
  gold: '#194a9a',
  green: '#16a34a',
  teal: '#194a9a',
  blue: '#194a9a',
  red: '#d71920',
  redSoft: '#fff1f2',
  white: '#ffffff',
  paper: '#f4f7fb',
  navy: '#0f3675'
};

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.ink
  },
  screen: {
    flex: 1,
    backgroundColor: colors.ink
  },
  content: {
    padding: 18,
    paddingBottom: 112
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    padding: 22,
    backgroundColor: colors.navy
  },
  loginPanel: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    padding: 22,
    backgroundColor: colors.white
  },
  logo: {
    width: 86,
    height: 86,
    alignSelf: 'center',
    borderRadius: 24,
    backgroundColor: colors.white,
    marginBottom: 20
  },
  eyebrow: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 22
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18
  },
  pageTitle: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '900'
  },
  pageSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  iconButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.white
  },
  field: {
    marginBottom: 14
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#f8fbff',
    color: colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  textArea: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: 'top'
  },
  primaryButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: colors.gold,
    paddingHorizontal: 18
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900'
  },
  ghostButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.panel
  },
  ghostText: {
    color: colors.blue,
    fontWeight: '800'
  },
  notice: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14
  },
  noticeText: {
    color: colors.text,
    fontWeight: '800'
  },
  errorNotice: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
    backgroundColor: colors.redSoft
  },
  successNotice: {
    borderColor: 'rgba(57, 217, 138, 0.45)',
    backgroundColor: '#ecfdf3'
  },
  card: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.panel,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12
  },
  cardTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900'
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#eaf1ff'
  },
  badgeText: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: '900'
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 14
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14
  },
  providerCard: {
    width: '47%',
    minHeight: 128,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.panelSoft
  },
  providerIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.blue,
    marginBottom: 12
  },
  providerName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900'
  },
  providerCode: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4
  },
  smallAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.panelSoft
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  chipSearch: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 9,
    backgroundColor: colors.panelSoft
  },
  chipSearchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800'
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: colors.panel
  },
  chipActive: {
    borderColor: colors.blue,
    backgroundColor: colors.blue
  },
  chipText: {
    color: colors.text,
    fontWeight: '800'
  },
  chipTextActive: {
    color: colors.white
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18
  },
  statCard: {
    width: '47%',
    minHeight: 108,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 15,
    backgroundColor: colors.panel
  },
  statValue: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 10
  },
  statLabel: {
    color: colors.muted,
    fontWeight: '800'
  },
  empty: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    padding: 24,
    backgroundColor: colors.panel
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10
  },
  emptyText: {
    color: colors.muted,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  linkText: {
    fontSize: 13,
    fontWeight: '900'
  },
  paymentAmount: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 10
  },
  bottomNav: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    padding: 8,
    backgroundColor: colors.navy
  },
  navItem: {
    flex: 1,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17
  },
  navItemActive: {
    backgroundColor: colors.white
  },
  navText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3
  },
  navTextActive: {
    color: colors.blue
  }
});
