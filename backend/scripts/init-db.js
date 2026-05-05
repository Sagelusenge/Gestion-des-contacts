require('dotenv').config();

const mysql = require('mysql2/promise');
const { sequelize } = require('../src/config/sequelize');
const {
  setupModels,
  User,
  Communaute,
  Poste,
  Section,
  Paroisse,
  Pasteur,
  Mouvement,
  AuditLog,
  Message,
  MessageRecipient
} = require('../src/models');

const db = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  name: process.env.DB_NAME || 'cbca_pastors'
};

const users = [
  { email: 'representant.legal@cbca.cd', password: 'Cbca@2026!', firstName: 'Représentant', lastName: 'Légal', phone: '+243 970 000 001', role: 'SUPER_ADMIN' },
  { email: 'secretaire.communautaire@cbca.cd', password: 'Cbca@2026!', firstName: 'Secrétaire', lastName: 'Communautaire', phone: '+243 970 000 002', role: 'SUPER_ADMIN' }
];

const postes = [
  { nom: 'Poste de Goma', code: 'GOM', telephone: '+243 970 000 100', email: 'poste.goma@cbca.cd', adresse: 'Goma, Nord-Kivu' },
  { nom: 'Poste de Beni', code: 'BEN', telephone: '+243 970 000 200', email: 'poste.beni@cbca.cd', adresse: 'Beni, Nord-Kivu' },
  { nom: 'Poste de Butembo', code: 'BUT', telephone: '+243 970 000 300', email: 'poste.butembo@cbca.cd', adresse: 'Butembo, Nord-Kivu' },
  { nom: 'Poste de Rutshuru', code: 'RUT', telephone: '+243 970 000 400', email: 'poste.rutshuru@cbca.cd', adresse: 'Rutshuru, Nord-Kivu' }
];

const sections = [
  { nom: 'Section Centre', code: 'GOM-C', poste: 'GOM', telephone: '+243 970 001 100' },
  { nom: 'Section Lac', code: 'GOM-L', poste: 'GOM', telephone: '+243 970 001 101' },
  { nom: 'Section Mulekera', code: 'BEN-M', poste: 'BEN', telephone: '+243 970 002 100' },
  { nom: 'Section Boikene', code: 'BEN-B', poste: 'BEN', telephone: '+243 970 002 101' },
  { nom: 'Section Vulamba', code: 'BUT-V', poste: 'BUT', telephone: '+243 970 003 100' },
  { nom: 'Section Kimemi', code: 'BUT-K', poste: 'BUT', telephone: '+243 970 003 101' },
  { nom: 'Section Kiwanja', code: 'RUT-K', poste: 'RUT', telephone: '+243 970 004 100' }
];

const paroisses = [
  { nom: 'Paroisse Baraka', code: 'BAR', section: 'GOM-C', poste: 'GOM', nombreMembers: 1680 },
  { nom: 'Paroisse Virunga', code: 'VIR', section: 'GOM-L', poste: 'GOM', nombreMembers: 1210 },
  { nom: 'Paroisse Cité Belge', code: 'CBG', section: 'BEN-M', poste: 'BEN', nombreMembers: 1435 },
  { nom: 'Paroisse Boikene', code: 'BOI', section: 'BEN-B', poste: 'BEN', nombreMembers: 980 },
  { nom: 'Paroisse Vulamba', code: 'VLB', section: 'BUT-V', poste: 'BUT', nombreMembers: 1130 },
  { nom: 'Paroisse Kimemi', code: 'KIM', section: 'BUT-K', poste: 'BUT', nombreMembers: 1045 },
  { nom: 'Paroisse Kiwanja', code: 'KIW', section: 'RUT-K', poste: 'RUT', nombreMembers: 860 }
];

const pasteurs = [
  {
    nom: 'Kambale',
    prenom: 'Emmanuel',
    matricule: 'CBCA-RL-0019',
    numeroIdentifiant: 'CBCA-NK-24-0019',
    grade: 'Révérend Pasteur',
    responsabilite: 'Pasteur de Poste',
    fonction: 'Responsable de Poste',
    telephone: '+243 970 000 101',
    email: 'emmanuel.kambale@cbca.cd',
    dateOrdination: '2008-08-17',
    dateNaissance: '1976-04-12',
    lieuNaissance: 'Butembo',
    etatCivil: 'Marié',
    conjoint: { nom: 'Maman Grâce Kambale', telephone: '+243 970 000 102', implication: 'Animatrice' },
    enfants: [{ nom: 'Deborah' }, { nom: 'Samuel' }],
    formation: [{ diplome: 'Licence en Théologie', institution: 'ULPGL', annee: 2005 }],
    statut: 'Actif',
    adresseActuelle: 'Poste CBCA Goma',
    poste: 'GOM',
    section: 'GOM-C',
    paroisse: 'BAR',
    notes: 'Profil prioritaire pour les missions de coordination régionale.'
  },
  {
    nom: 'Mumbere',
    prenom: 'Jean-Paul',
    matricule: 'CBCA-PA-0034',
    numeroIdentifiant: 'CBCA-BN-24-0034',
    grade: 'Pasteur',
    responsabilite: 'Pasteur Sectionnaire',
    fonction: 'Pasteur sectionnaire',
    telephone: '+243 970 000 220',
    email: 'jeanpaul.mumbere@cbca.cd',
    dateOrdination: '2015-06-21',
    dateNaissance: '1983-11-02',
    lieuNaissance: 'Beni',
    etatCivil: 'Marié',
    conjoint: { nom: 'Maman Esther Mumbere', telephone: '+243 970 000 221', implication: 'Responsable mamans' },
    formation: [{ diplome: 'Bachelor en Théologie', institution: 'ISTEBU', annee: 2012 }],
    statut: 'Actif',
    adresseActuelle: 'Paroisse CBCA Cité Belge',
    poste: 'BEN',
    section: 'BEN-M',
    paroisse: 'CBG',
    notes: 'Mandat à réévaluer au prochain conseil.'
  },
  {
    nom: 'Safari',
    prenom: 'Daniel',
    matricule: 'CBCA-ST-0088',
    numeroIdentifiant: 'CBCA-BU-24-0088',
    grade: 'Pasteur Stagiaire',
    responsabilite: 'Assistant Pastoral',
    fonction: 'Assistant paroissial',
    telephone: '+243 970 000 303',
    email: 'daniel.safari@cbca.cd',
    dateOrdination: '2023-09-10',
    etatCivil: 'Célibataire',
    formation: [{ diplome: 'Diplôme en ministère pastoral', institution: 'Institut Biblique CBCA', annee: 2022 }],
    statut: 'Actif',
    poste: 'BUT',
    section: 'BUT-V',
    paroisse: 'VLB'
  },
  {
    nom: 'Bisimwa',
    prenom: 'Moïse',
    matricule: 'CBCA-PR-0112',
    numeroIdentifiant: 'CBCA-RU-24-0112',
    grade: 'Proposant',
    responsabilite: 'Pasteur de Paroisse',
    fonction: 'Responsable jeunesse',
    telephone: '+243 970 000 404',
    email: 'moise.bisimwa@cbca.cd',
    dateOrdination: '2024-02-18',
    etatCivil: 'Marié',
    conjoint: { nom: 'Maman Sarah Bisimwa' },
    formation: [{ diplome: 'Formation en catéchèse', institution: 'CBCA', annee: 2023 }],
    statut: 'Actif',
    poste: 'RUT',
    section: 'RUT-K',
    paroisse: 'KIW'
  }
];

const mouvements = [
  { pasteur: 'CBCA-RL-0019', posteCible: 'GOM', typeMovement: 'Affectation', dateDebut: '2019-01-15', dateFin: '2027-01-15', statut: 'Effectué', dureeMandat: 8 },
  { pasteur: 'CBCA-PA-0034', posteCible: 'BEN', typeMovement: 'Affectation', dateDebut: '2021-03-01', dateFin: '2026-09-01', statut: 'Effectué', dureeMandat: 5 },
  { pasteur: 'CBCA-ST-0088', posteCible: 'BUT', typeMovement: 'Affectation', dateDebut: '2023-10-01', dateFin: '2026-10-01', statut: 'Effectué', dureeMandat: 3 },
  { pasteur: 'CBCA-PR-0112', posteCible: 'RUT', typeMovement: 'Affectation', dateDebut: '2024-03-01', dateFin: '2027-03-01', statut: 'Effectué', dureeMandat: 3 }
];

const upsertBy = async (model, where, values) => {
  const [row, created] = await model.findOrCreate({ where, defaults: values });
  if (!created) await row.update(values);
  return row;
};

const executeOptional = async (sql, label) => {
  try {
    await sequelize.query(sql);
  } catch (error) {
    console.warn(`${label}: ${error.message}`);
  }
};

const installDatabaseObjects = async () => {
  const indexes = [
    ['idx_users_role', 'Users', 'role'],
    ['idx_users_poste_assigne', 'Users', 'posteAssigneId'],
    ['idx_pasteurs_poste', 'Pasteurs', 'posteId'],
    ['idx_pasteurs_responsabilite', 'Pasteurs', 'responsabilite'],
    ['idx_pasteurs_grade', 'Pasteurs', 'grade'],
    ['idx_mouvements_date_fin', 'Mouvements', 'dateFin'],
    ['idx_messages_audience', 'Messages', 'audienceType'],
    ['idx_message_recipients_pasteur', 'MessageRecipients', 'pasteurId']
  ];

  for (const [name, table, column] of indexes) {
    await executeOptional(`CREATE INDEX \`${name}\` ON \`${table}\` (\`${column}\`)`, `Index ${name}`);
  }

  const constraints = [
    ['chk_pasteurs_dates', 'Pasteurs', '`dateNaissance` IS NULL OR `dateOrdination` >= `dateNaissance`'],
    ['chk_mouvements_dates', 'Mouvements', '`dateFin` IS NULL OR `dateFin` >= `dateDebut`'],
    ['chk_paroisses_members_positive', 'Paroisses', '`nombreMembers` >= 0'],
    ['chk_postes_counts_positive', 'Postes', '`nombrePasteurs` >= 0 AND `nombreSections` >= 0 AND `nombreParoisses` >= 0'],
    ['chk_messages_contenu', 'Messages', 'CHAR_LENGTH(`contenu`) >= 3']
  ];

  for (const [name, table, expression] of constraints) {
    await executeOptional(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${name}\` CHECK (${expression})`, `Contrainte ${name}`);
  }

  await sequelize.query('DROP VIEW IF EXISTS v_pasteurs_carte');
  await sequelize.query(`
    CREATE VIEW v_pasteurs_carte AS
    SELECT p.id, p.matricule, p.numeroIdentifiant, CONCAT(p.prenom, ' ', p.nom) AS nomComplet,
           p.grade, p.responsabilite, p.fonction, p.telephone, p.email, p.dateOrdination, p.statut,
           po.nom AS poste, s.nom AS section, pa.nom AS paroisse, p.etatCivil,
           JSON_UNQUOTE(JSON_EXTRACT(p.conjoint, '$.nom')) AS conjointNom
    FROM Pasteurs p
    LEFT JOIN Postes po ON po.id = p.posteId
    LEFT JOIN Sections s ON s.id = p.sectionId
    LEFT JOIN Paroisses pa ON pa.id = p.paroisseId
  `);

  await sequelize.query('DROP VIEW IF EXISTS v_dashboard_grades');
  await sequelize.query(`
    CREATE VIEW v_dashboard_grades AS
    SELECT grade, responsabilite, statut, COUNT(*) AS total
    FROM Pasteurs
    GROUP BY grade, responsabilite, statut
  `);

  await sequelize.query('DROP VIEW IF EXISTS v_couverture_postes');
  await sequelize.query(`
    CREATE VIEW v_couverture_postes AS
    SELECT po.id, po.code, po.nom AS poste,
           COUNT(DISTINCT p.id) AS pasteurs,
           COUNT(DISTINCT s.id) AS sections,
           COUNT(DISTINCT pa.id) AS paroisses
    FROM Postes po
    LEFT JOIN Pasteurs p ON p.posteId = po.id
    LEFT JOIN Sections s ON s.posteId = po.id
    LEFT JOIN Paroisses pa ON pa.posteId = po.id
    GROUP BY po.id, po.code, po.nom
  `);

  await sequelize.query('DROP VIEW IF EXISTS v_alertes_mandat');
  await sequelize.query(`
    CREATE VIEW v_alertes_mandat AS
    SELECT m.id, p.id AS pasteurId, CONCAT(p.prenom, ' ', p.nom) AS pasteur,
           po.nom AS posteCourant, m.dateFin AS dateFinMandat,
           DATEDIFF(m.dateFin, CURDATE()) AS joursRestants
    FROM Mouvements m
    INNER JOIN Pasteurs p ON p.id = m.pasteurId
    INNER JOIN Postes po ON po.id = m.posteCibleId
    WHERE m.statut = 'Effectué'
      AND m.dateFin IS NOT NULL
      AND m.dateFin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 6 MONTH)
  `);

  await sequelize.query('DROP VIEW IF EXISTS v_boites_messages');
  await sequelize.query(`
    CREATE VIEW v_boites_messages AS
    SELECT mr.id, mr.messageId, mr.pasteurId, CONCAT(p.prenom, ' ', p.nom) AS pasteur,
           p.grade, p.responsabilite, m.objet, m.contenu, m.priorite, m.sentAt, mr.statutLecture
    FROM MessageRecipients mr
    INNER JOIN Messages m ON m.id = mr.messageId
    INNER JOIN Pasteurs p ON p.id = mr.pasteurId
  `);

  await sequelize.query('DROP PROCEDURE IF EXISTS sp_dashboard_resume');
  await sequelize.query(`
    CREATE PROCEDURE sp_dashboard_resume()
    BEGIN
      SELECT (SELECT COUNT(*) FROM Pasteurs) AS totalPasteurs,
             (SELECT COUNT(*) FROM Postes) AS totalPostes,
             (SELECT COUNT(*) FROM Sections) AS totalSections,
             (SELECT COUNT(*) FROM Paroisses) AS totalParoisses,
             (SELECT COUNT(*) FROM v_alertes_mandat) AS alertesMandats,
             (SELECT COUNT(*) FROM MessageRecipients WHERE statutLecture = 'Non lu') AS messagesNonLus;
    END
  `);

  await sequelize.query('DROP PROCEDURE IF EXISTS sp_search_pasteurs');
  await sequelize.query(`
    CREATE PROCEDURE sp_search_pasteurs(IN searchTerm VARCHAR(120))
    BEGIN
      SELECT *
      FROM v_pasteurs_carte
      WHERE searchTerm IS NULL OR searchTerm = ''
         OR nomComplet LIKE CONCAT('%', searchTerm, '%')
         OR matricule LIKE CONCAT('%', searchTerm, '%')
         OR poste LIKE CONCAT('%', searchTerm, '%')
         OR responsabilite LIKE CONCAT('%', searchTerm, '%')
      ORDER BY nomComplet ASC;
    END
  `);

  await sequelize.query('DROP PROCEDURE IF EXISTS sp_envoyer_message_grade');
  await sequelize.query(`
    CREATE PROCEDURE sp_envoyer_message_grade(
      IN inObjet VARCHAR(255),
      IN inContenu TEXT,
      IN inGrade VARCHAR(80),
      IN inUserId INT
    )
    BEGIN
      INSERT INTO Messages (objet, contenu, audienceType, audienceValeur, canal, priorite, statut, sentById, sentAt, createdAt, updatedAt)
      VALUES (inObjet, inContenu, 'GRADE', inGrade, 'BOITE_INTERNE', 'Normale', 'Envoyé', inUserId, NOW(), NOW(), NOW());

      INSERT INTO MessageRecipients (messageId, pasteurId, statutLecture, canalLivraison, createdAt, updatedAt)
      SELECT LAST_INSERT_ID(), id, 'Non lu', 'BOITE_INTERNE', NOW(), NOW()
      FROM Pasteurs
      WHERE grade = inGrade AND statut = 'Actif';
    END
  `);

  await sequelize.query('DROP PROCEDURE IF EXISTS sp_affecter_pasteur');
  await sequelize.query(`
    CREATE PROCEDURE sp_affecter_pasteur(IN inPasteurId INT, IN inPosteCibleId INT, IN inDateDebut DATE, IN inDateFin DATE, IN inCreatedById INT)
    BEGIN
      INSERT INTO Mouvements (pasteurId, posteSourceId, posteCibleId, typeMovement, dateDebut, dateFin, statut, createdById, createdAt, updatedAt)
      SELECT p.id, p.posteId, inPosteCibleId, 'Transfert', inDateDebut, inDateFin, 'Effectué', inCreatedById, NOW(), NOW()
      FROM Pasteurs p WHERE p.id = inPasteurId;

      UPDATE Pasteurs SET posteId = inPosteCibleId, updatedById = inCreatedById, updatedAt = NOW()
      WHERE id = inPasteurId;
    END
  `);

  await sequelize.query('DROP TRIGGER IF EXISTS trg_pasteurs_after_update_audit');
  await sequelize.query(`
    CREATE TRIGGER trg_pasteurs_after_update_audit
    AFTER UPDATE ON Pasteurs
    FOR EACH ROW
    BEGIN
      INSERT INTO AuditLogs (action, entite, entiteId, utilisateurId, utilisateurNom, anciennes, nouvelles, createdAt, updatedAt)
      VALUES ('UPDATE', 'Pasteur', NEW.id, NEW.updatedById, 'TRIGGER_MYSQL',
        JSON_OBJECT('telephone', OLD.telephone, 'posteId', OLD.posteId, 'responsabilite', OLD.responsabilite, 'statut', OLD.statut),
        JSON_OBJECT('telephone', NEW.telephone, 'posteId', NEW.posteId, 'responsabilite', NEW.responsabilite, 'statut', NEW.statut),
        NOW(), NOW());
    END
  `);

  await sequelize.query('DROP TRIGGER IF EXISTS trg_mouvements_after_insert_alert');
  await sequelize.query(`
    CREATE TRIGGER trg_mouvements_after_insert_alert
    AFTER INSERT ON Mouvements
    FOR EACH ROW
    BEGIN
      IF NEW.dateFin IS NOT NULL AND NEW.dateFin <= DATE_ADD(CURDATE(), INTERVAL 6 MONTH) THEN
        UPDATE Pasteurs SET alerteFin = TRUE, updatedAt = NOW() WHERE id = NEW.pasteurId;
      END IF;
    END
  `);

  await sequelize.query('DROP TRIGGER IF EXISTS trg_message_recipients_after_insert_audit');
  await sequelize.query(`
    CREATE TRIGGER trg_message_recipients_after_insert_audit
    AFTER INSERT ON MessageRecipients
    FOR EACH ROW
    BEGIN
      UPDATE Messages SET updatedAt = NOW() WHERE id = NEW.messageId;
    END
  `);
};

const main = async () => {
  const serverConnection = await mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    multipleStatements: true
  });

  await serverConnection.query(`DROP DATABASE IF EXISTS \`${db.name}\``);
  await serverConnection.query(`CREATE DATABASE \`${db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await serverConnection.end();

  setupModels(sequelize);
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  await installDatabaseObjects();

  const communaute = await upsertBy(Communaute, { code: 'CBCA-NK' }, {
    nom: 'Communauté Baptiste au Centre de l’Afrique - Nord-Kivu',
    code: 'CBCA-NK',
    description: 'Base de pilotage pastoral et administratif',
    pays: 'République Démocratique du Congo',
    region: 'Nord-Kivu',
    telephone: '+243 970 000 000',
    email: 'secretariat@cbca.cd',
    siteWeb: 'https://cbca.cd',
    nombrePostes: postes.length,
    couleur1: '#0B5CAB',
    couleur2: '#B68A2C'
  });

  const superAdmin = await upsertBy(User, { email: users[0].email }, users[0]);
  await upsertBy(User, { email: users[1].email }, users[1]);

  const posteRows = {};
  for (const poste of postes) {
    posteRows[poste.code] = await upsertBy(Poste, { code: poste.code }, { ...poste, communauteId: communaute.id, createdById: superAdmin.id });
  }

  const adminPostes = [
    { email: 'admin.goma@cbca.cd', firstName: 'Admin', lastName: 'Goma', phone: '+243 970 000 110', role: 'ADMIN_POSTE', poste: 'GOM' },
    { email: 'admin.beni@cbca.cd', firstName: 'Admin', lastName: 'Beni', phone: '+243 970 000 210', role: 'ADMIN_POSTE', poste: 'BEN' }
  ];

  for (const admin of adminPostes) {
    const user = await upsertBy(User, { email: admin.email }, {
      email: admin.email,
      password: 'Cbca@2026!',
      firstName: admin.firstName,
      lastName: admin.lastName,
      phone: admin.phone,
      role: admin.role,
      posteAssigneId: posteRows[admin.poste].id
    });
    await posteRows[admin.poste].update({ responsableId: user.id });
  }

  const sectionRows = {};
  for (const section of sections) {
    sectionRows[section.code] = await upsertBy(Section, { code: section.code }, {
      nom: section.nom,
      code: section.code,
      posteId: posteRows[section.poste].id,
      telephone: section.telephone
    });
  }

  const paroisseRows = {};
  for (const paroisse of paroisses) {
    paroisseRows[paroisse.code] = await upsertBy(Paroisse, { code: paroisse.code }, {
      nom: paroisse.nom,
      code: paroisse.code,
      sectionId: sectionRows[paroisse.section].id,
      posteId: posteRows[paroisse.poste].id,
      nombreMembers: paroisse.nombreMembers
    });
  }

  const pasteurRows = {};
  for (const pasteur of pasteurs) {
    const { poste, section, paroisse, ...pasteurData } = pasteur;
    pasteurRows[pasteur.matricule] = await upsertBy(Pasteur, { matricule: pasteur.matricule }, {
      ...pasteurData,
      posteId: posteRows[poste].id,
      sectionId: sectionRows[section].id,
      paroisseId: paroisseRows[paroisse].id,
      createdById: superAdmin.id
    });
  }

  for (const pasteur of pasteurs) {
    await paroisseRows[pasteur.paroisse].update({ pasteurId: pasteurRows[pasteur.matricule].id });
  }

  for (const mouvement of mouvements) {
    await upsertBy(Mouvement, { pasteurId: pasteurRows[mouvement.pasteur].id, dateDebut: mouvement.dateDebut }, {
      pasteurId: pasteurRows[mouvement.pasteur].id,
      posteCibleId: posteRows[mouvement.posteCible].id,
      typeMovement: mouvement.typeMovement,
      dateDebut: mouvement.dateDebut,
      dateFin: mouvement.dateFin,
      statut: mouvement.statut,
      dureeMandat: mouvement.dureeMandat,
      createdById: superAdmin.id
    });
  }

  const seedMessage = await Message.create({
    objet: 'Bienvenue dans la boîte interne CBCA',
    contenu: 'Cette boîte recevra les communications ciblées de la haute hiérarchie.',
    audienceType: 'TOUS',
    audienceValeur: '',
    canal: 'BOITE_INTERNE',
    priorite: 'Normale',
    sentById: superAdmin.id
  });

  await MessageRecipient.bulkCreate(
    Object.values(pasteurRows).map((pasteur) => ({
      messageId: seedMessage.id,
      pasteurId: pasteur.id,
      canalLivraison: 'BOITE_INTERNE'
    }))
  );

  await AuditLog.create({
    entite: 'System',
    action: 'CREATE',
    utilisateurId: superAdmin.id,
    utilisateurNom: 'Initialisation CBCA',
    nouvelles: { database: db.name, seed: 'initial' }
  });

  await sequelize.close();

  console.log('Base de données CBCA initialisée.');
  console.log(`Database: ${db.name}`);
  console.log('Compte Super-Admin: representant.legal@cbca.cd / Cbca@2026!');
  console.log('Compte Admin Poste: admin.goma@cbca.cd / Cbca@2026!');
};

main().catch(async (error) => {
  console.error('Initialisation échouée:', error.message);
  try {
    await sequelize.close();
  } catch {}
  process.exit(1);
});
