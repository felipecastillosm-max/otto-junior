function doGet(e) {
  const action = e.parameter.action;

  if (action === "listPasajeros") {
    return jsonResponse(listPasajeros());
  }

  return jsonResponse({ error: "accion no reconocida" });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents || "{}");
  const action = body.action;

  if (action === "addPasajero") {
    return jsonResponse(addPasajero(body));
  }

  if (action === "marcarBajada") {
    return jsonResponse(marcarBajada(body.id));
  }

  return jsonResponse({ error: "accion no reconocida" });
}

function listPasajeros() {
  const sheet = getSheet("Pasajeros");
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();

  return rows.map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) {
      obj[h] = row[i];
    });
    return obj;
  });
}

function addPasajero(data) {
  const sheet = getSheet("Pasajeros");
  const id = Utilities.getUuid();
  sheet.appendRow([
    id,
    data.nombre || "",
    data.asiento || "",
    data.paradero || "",
    "a_bordo",
    new Date()
  ]);
  return { id: id };
}

function marcarBajada(id) {
  const sheet = getSheet("Pasajeros");
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.getRange(i + 1, 5).setValue("bajado");
      return { ok: true };
    }
  }
  return { ok: false, error: "pasajero no encontrado" };
}

function getSheet(name) {
  const props = PropertiesService.getScriptProperties();
  let sheetId = props.getProperty("SHEET_ID");
  let spreadsheet;

  if (sheetId) {
    spreadsheet = SpreadsheetApp.openById(sheetId);
  } else {
    spreadsheet = SpreadsheetApp.create("Otto Junior - Base de datos");
    props.setProperty("SHEET_ID", spreadsheet.getId());
  }

  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    if (name === "Pasajeros") {
      sheet.appendRow(["id", "nombre", "asiento", "paradero", "estado", "creado_en"]);
    }
  }

  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
