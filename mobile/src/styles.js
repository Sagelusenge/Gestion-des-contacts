import { StyleSheet } from 'react-native';

export const colors = {
  ink: '#071411',
  panel: '#10251e',
  panelSoft: '#163126',
  text: '#f5fff9',
  muted: '#a7b8b2',
  line: 'rgba(161, 239, 215, 0.18)',
  gold: '#f5bf3b',
  green: '#39d98a',
  teal: '#7df6d2',
  blue: '#82aaff',
  red: '#ef4444',
  redSoft: '#3b1d22',
  white: '#ffffff',
  paper: '#f4faf6'
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
    backgroundColor: colors.ink
  },
  loginPanel: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    padding: 22,
    backgroundColor: colors.panel
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
    color: colors.teal,
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
    backgroundColor: colors.panel
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
    backgroundColor: '#071b15',
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
    color: colors.ink,
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
    color: colors.text,
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
    backgroundColor: '#123623'
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
    backgroundColor: '#213b30'
  },
  badgeText: {
    color: colors.teal,
    fontSize: 11,
    fontWeight: '900'
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 14
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
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: colors.panel
  },
  chipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.gold
  },
  chipText: {
    color: colors.text,
    fontWeight: '800'
  },
  chipTextActive: {
    color: colors.ink
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
  bottomNav: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    padding: 8,
    backgroundColor: '#0b1b16'
  },
  navItem: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18
  },
  navItemActive: {
    backgroundColor: colors.gold
  },
  navText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3
  },
  navTextActive: {
    color: colors.ink
  }
});
