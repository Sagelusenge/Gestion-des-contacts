CREATE DATABASE IF NOT EXISTS cbca_pastors CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cbca_pastors;

CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  role ENUM('SUPER_ADMIN', 'ADMIN_POSTE', 'VIEWER') DEFAULT 'VIEWER',
  posteAssigneId INT,
  isActive BOOLEAN DEFAULT TRUE,
  lastLogin DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_poste_assigne (posteAssigneId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Communautes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  pays VARCHAR(255),
  region VARCHAR(255),
  telephone VARCHAR(255),
  email VARCHAR(255),
  siteWeb VARCHAR(255),
  nombrePostes INT DEFAULT 0,
  logo VARCHAR(500),
  couleur1 VARCHAR(255) DEFAULT '#0B5CAB',
  couleur2 VARCHAR(255) DEFAULT '#B68A2C',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Postes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  communauteId INT NOT NULL,
  responsableId INT,
  telephone VARCHAR(255),
  email VARCHAR(255),
  adresse VARCHAR(255),
  nombrePasteurs INT DEFAULT 0,
  nombreSections INT DEFAULT 0,
  nombreParoisses INT DEFAULT 0,
  createdById INT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_postes_communaute FOREIGN KEY (communauteId) REFERENCES Communautes(id),
  CONSTRAINT fk_postes_responsable FOREIGN KEY (responsableId) REFERENCES Users(id),
  CONSTRAINT fk_postes_created_by FOREIGN KEY (createdById) REFERENCES Users(id),
  CONSTRAINT chk_postes_counts_positive CHECK (nombrePasteurs >= 0 AND nombreSections >= 0 AND nombreParoisses >= 0)
) ENGINE=InnoDB;

ALTER TABLE Users
  ADD CONSTRAINT fk_users_poste_assigne FOREIGN KEY (posteAssigneId) REFERENCES Postes(id);

CREATE TABLE IF NOT EXISTS Sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  posteId INT NOT NULL,
  responsableId INT,
  telephone VARCHAR(255),
  adresse VARCHAR(255),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sections_poste FOREIGN KEY (posteId) REFERENCES Postes(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Paroisses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  sectionId INT NOT NULL,
  posteId INT NOT NULL,
  pasteurId INT,
  telephone VARCHAR(255),
  adresse VARCHAR(255),
  nombreMembers INT DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_paroisses_section FOREIGN KEY (sectionId) REFERENCES Sections(id),
  CONSTRAINT fk_paroisses_poste FOREIGN KEY (posteId) REFERENCES Postes(id),
  CONSTRAINT chk_paroisses_members_positive CHECK (nombreMembers >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Pasteurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  dateNaissance DATETIME,
  lieuNaissance VARCHAR(255),
  photo VARCHAR(500),
  email VARCHAR(255),
  telephone VARCHAR(255),
  matricule VARCHAR(255) NOT NULL UNIQUE,
  numeroIdentifiant VARCHAR(255),
  dateOrdination DATETIME NOT NULL,
  grade ENUM('Révérend Pasteur', 'Pasteur', 'Pasteur Stagiaire', 'Proposant') NOT NULL,
  responsabilite ENUM('Pasteur de Poste', 'Pasteur Sectionnaire', 'Pasteur de Paroisse', 'Assistant Pastoral', 'Administration') DEFAULT 'Pasteur de Paroisse',
  fonction VARCHAR(255),
  formation JSON,
  etatCivil ENUM('Célibataire', 'Marié', 'Divorcé', 'Veuf'),
  conjoint JSON,
  enfants JSON,
  posteId INT NOT NULL,
  sectionId INT,
  paroisseId INT,
  adresseActuelle VARCHAR(255),
  statut ENUM('Actif', 'En Congé', 'Retraité', 'Suspendu') DEFAULT 'Actif',
  createdById INT,
  updatedById INT,
  notes TEXT,
  alerteFin BOOLEAN DEFAULT FALSE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pasteurs_poste FOREIGN KEY (posteId) REFERENCES Postes(id),
  CONSTRAINT fk_pasteurs_section FOREIGN KEY (sectionId) REFERENCES Sections(id),
  CONSTRAINT fk_pasteurs_paroisse FOREIGN KEY (paroisseId) REFERENCES Paroisses(id),
  CONSTRAINT fk_pasteurs_created_by FOREIGN KEY (createdById) REFERENCES Users(id),
  CONSTRAINT fk_pasteurs_updated_by FOREIGN KEY (updatedById) REFERENCES Users(id),
  CONSTRAINT chk_pasteurs_dates CHECK (dateNaissance IS NULL OR dateOrdination >= dateNaissance),
  INDEX idx_pasteurs_grade (grade),
  INDEX idx_pasteurs_responsabilite (responsabilite),
  INDEX idx_pasteurs_poste (posteId)
) ENGINE=InnoDB;

ALTER TABLE Sections ADD CONSTRAINT fk_sections_responsable FOREIGN KEY (responsableId) REFERENCES Pasteurs(id);
ALTER TABLE Paroisses ADD CONSTRAINT fk_paroisses_pasteur FOREIGN KEY (pasteurId) REFERENCES Pasteurs(id);

CREATE TABLE IF NOT EXISTS Mouvements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pasteurId INT NOT NULL,
  dateDebut DATETIME NOT NULL,
  dateFin DATETIME,
  posteSourceId INT,
  posteCibleId INT NOT NULL,
  typeMovement ENUM('Affectation', 'Transfert', 'Promotion', 'Retraite') NOT NULL,
  motif VARCHAR(255),
  observations TEXT,
  statut ENUM('Proposé', 'Approuvé', 'Effectué', 'Annulé') DEFAULT 'Proposé',
  dateApprobation DATETIME,
  approuveeParId INT,
  createdById INT,
  alerteFin BOOLEAN DEFAULT FALSE,
  dureeMandat INT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mouvements_pasteur FOREIGN KEY (pasteurId) REFERENCES Pasteurs(id),
  CONSTRAINT fk_mouvements_poste_source FOREIGN KEY (posteSourceId) REFERENCES Postes(id),
  CONSTRAINT fk_mouvements_poste_cible FOREIGN KEY (posteCibleId) REFERENCES Postes(id),
  CONSTRAINT chk_mouvements_dates CHECK (dateFin IS NULL OR dateFin >= dateDebut)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  objet VARCHAR(255) NOT NULL,
  contenu TEXT NOT NULL,
  audienceType ENUM('TOUS', 'GRADE', 'RESPONSABILITE', 'POSTE', 'SECTION', 'PAROISSE', 'PASTEURS_SELECTIONNES') NOT NULL,
  audienceValeur VARCHAR(255),
  canal ENUM('BOITE_INTERNE', 'SMS', 'WHATSAPP', 'MIXTE') DEFAULT 'BOITE_INTERNE',
  priorite ENUM('Normale', 'Haute', 'Urgente') DEFAULT 'Normale',
  statut ENUM('Brouillon', 'Envoyé', 'Annulé') DEFAULT 'Envoyé',
  sentById INT,
  sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sentById) REFERENCES Users(id),
  CONSTRAINT chk_messages_contenu CHECK (CHAR_LENGTH(contenu) >= 3)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS MessageRecipients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  messageId INT NOT NULL,
  pasteurId INT NOT NULL,
  statutLecture ENUM('Non lu', 'Lu', 'Archivé') DEFAULT 'Non lu',
  luAt DATETIME,
  canalLivraison ENUM('BOITE_INTERNE', 'SMS', 'WHATSAPP', 'MIXTE') DEFAULT 'BOITE_INTERNE',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_message_recipients_message FOREIGN KEY (messageId) REFERENCES Messages(id),
  CONSTRAINT fk_message_recipients_pasteur FOREIGN KEY (pasteurId) REFERENCES Pasteurs(id),
  UNIQUE KEY uq_message_pasteur (messageId, pasteurId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS AuditLogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
  entite VARCHAR(255) NOT NULL,
  entiteId INT,
  utilisateurId INT,
  utilisateurNom VARCHAR(255),
  anciennes JSON,
  nouvelles JSON,
  ip VARCHAR(255),
  userAgent VARCHAR(500),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (utilisateurId) REFERENCES Users(id)
) ENGINE=InnoDB;
