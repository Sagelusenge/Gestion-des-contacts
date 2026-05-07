function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function printRecord(title, fields) {
  const printableRows = fields
    .filter((field) => field.value !== null && field.value !== undefined && field.value !== '')
    .map(
      (field) => `
        <tr>
          <th>${escapeHtml(field.label)}</th>
          <td>${escapeHtml(field.value)}</td>
        </tr>
      `
    )
    .join('');

  const printWindow = window.open('', '_blank', 'width=780,height=720');

  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body {
            color: #172033;
            font-family: Arial, sans-serif;
            margin: 42px;
          }
          header {
            border-bottom: 4px solid #d71920;
            margin-bottom: 28px;
            padding-bottom: 16px;
          }
          h1 {
            color: #123f8c;
            margin: 0;
          }
          p {
            color: #66758a;
            margin: 6px 0 0;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th,
          td {
            border-bottom: 1px solid #dbe5f2;
            padding: 13px 10px;
            text-align: left;
            vertical-align: top;
          }
          th {
            color: #123f8c;
            width: 220px;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>${escapeHtml(title)}</h1>
          <p>Annuaire CBCA</p>
        </header>
        <table>${printableRows}</table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function printPastorsList(pastors) {
  const today = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());

  const rows = pastors
    .map(
      (pastor, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${escapeHtml(pastor.nom)}</strong></td>
          <td>${escapeHtml(pastor.degre)}</td>
          <td>${escapeHtml(pastor.poste)}</td>
          <td>${escapeHtml(pastor.telephone)}</td>
          <td>${escapeHtml(pastor.email || '-')}</td>
        </tr>
      `
    )
    .join('');

  const printWindow = window.open('', '_blank', 'width=1120,height=780');

  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Liste des pasteurs CBCA</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 14mm;
          }

          body {
            color: #172033;
            font-family: Arial, sans-serif;
            margin: 0;
          }

          header {
            align-items: center;
            border-bottom: 4px solid #d71920;
            display: flex;
            justify-content: space-between;
            margin-bottom: 18px;
            padding-bottom: 12px;
          }

          h1 {
            color: #123f8c;
            font-size: 24px;
            margin: 0;
          }

          p {
            color: #66758a;
            margin: 5px 0 0;
          }

          .count {
            color: #d71920;
            font-weight: 700;
            text-align: right;
          }

          table {
            border-collapse: collapse;
            font-size: 12px;
            width: 100%;
          }

          th,
          td {
            border: 1px solid #dbe5f2;
            padding: 8px 7px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #123f8c;
            color: #ffffff;
            font-size: 11px;
            text-transform: uppercase;
          }

          tr:nth-child(even) td {
            background: #f4f7fb;
          }
        </style>
      </head>
      <body>
        <header>
          <div>
            <h1>Liste des pasteurs CBCA</h1>
            <p>Annuaire imprimé le ${escapeHtml(today)}</p>
          </div>
          <div class="count">${pastors.length} pasteur${pastors.length > 1 ? 's' : ''}</div>
        </header>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Grade</th>
              <th>Poste</th>
              <th>Téléphone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
