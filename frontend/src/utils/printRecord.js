export function printRecord(title, fields) {
  const printableRows = fields
    .filter((field) => field.value !== null && field.value !== undefined && field.value !== '')
    .map(
      (field) => `
        <tr>
          <th>${field.label}</th>
          <td>${field.value}</td>
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
          <h1>${title}</h1>
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
