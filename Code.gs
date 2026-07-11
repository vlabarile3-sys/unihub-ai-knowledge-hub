/**
* =========================================
* UNIHUB + Demo SLIDE AI (UNIFIED)
* Backend Architect: System
* Engine: V8 (ES6+) | Storage: Hybrid Chunking
* L10N: Fully Anglicized Logs, UI Strings, and Responses
* Patch: Enterprise Cron Daemon & Historical Duplicate Prevention
* Feature: Alignment Deletion Engine
* =========================================
*/

const TARGET_DB_IDÂ = 'MOCK_ID_VALUE'; // UniHub Single Source of Truth

/**
* Web App Entry Point. Handles multi-tenant routing.
* @param {Object} e - GET event parameters from the Partner
* @returns {HtmlOutput} Server-processed HTML template
*/
function doGet(e) {
const faviconUrlÂ = "https://example.com/resource";
const teamContextÂ = (e.parameterÂ && e.parameter.team) ? e.parameter.team.toUpperCase() : "QA";
const templateÂ = HtmlService.createTemplateFromFile('Index');
template.TEAM_CONTEXTÂ = teamContext;
return template.evaluate()
.setTitle(`UniHub - ${teamContext}Â Workspace`)
.setFaviconUrl(faviconUrl)
.addMetaTag('viewport', 'width=device-width, initial-scale=1')
.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
* Asynchronous inclusion for isolated assets (Anti-Spaghetti UI Architecture)
* @param {string} filename - Filename to include (CSS or JS)
* @returns {string} Text content of the HTML file
*/
function include(filename) {
return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
* =========================================
* HYBRID STORAGE ENGINE (PROPERTIES + SHEETS)
* =========================================
*/

/**
* Fragments and saves massive JSON payloads bypassing the native 9KB limit.
* @param {string} payloadString - Serialized JSON string to save
* @param {string} prefixKey - Unique prefix for memory key isolation
* @returns {Object} Operation state object
*/
function chunkAndSaveToProperties(payloadString, prefixKey) {
const lockÂ = LockService.getScriptLock();
ifÂ (!lock.tryLock(8000)) throw new Error("Storage is busy. Please try again.");

tryÂ {
const scriptPropsÂ = PropertiesService.getScriptProperties();
const keysÂ = scriptProps.getKeys().filter(kÂ => k.startsWith(prefixKeyÂ + "_CHUNK_"));
keys.forEach(kÂ => scriptProps.deleteProperty(k));

const chunkSizeÂ = 8500;
const totalChunksÂ = Math.ceil(payloadString.lengthÂ / chunkSize);
scriptProps.setProperty(`${prefixKey}_COUNT`, totalChunks.toString());

forÂ (let iÂ = 0; iÂ < totalChunks; i++) {
const chunkÂ = payloadString.substring(iÂ * chunkSize, (iÂ + 1) * chunkSize);
scriptProps.setProperty(`${prefixKey}_CHUNK_${i}`, chunk);
}
returnÂ { success: trueÂ };
} finallyÂ {
lock.releaseLock();
}
}

/**
* Retrieves and reassembles previously fragmented atomic chunks.
* @param {string} prefixKey - Unique prefix of the key to load
* @returns {Object|null} Parsed payload or null if data is absent
*/
function loadChunkedFromProperties(prefixKey) {
const scriptPropsÂ = PropertiesService.getScriptProperties();
const countStrÂ = scriptProps.getProperty(`${prefixKey}_COUNT`);
ifÂ (!countStr) return null;

const countÂ = parseInt(countStr, 10);
let assembledÂ = "";
forÂ (let iÂ = 0; iÂ < count; i++) {
const chunkÂ = scriptProps.getProperty(`${prefixKey}_CHUNK_${i}`);
ifÂ (chunk) assembledÂ += chunk;
}
tryÂ {
return assembledÂ ? JSON.parse(assembled) : null;
} catch(e) {
return null;
}
}

/**
* Saves the global state for QA/OPS via the Hybrid Storage Engine.
* @param {string} payloadString - Serialized global data string
* @param {string} team - Target team identifier
* @returns {Object} Operation outcome
*/
function saveGlobalData(payloadString, team) {
tryÂ {
chunkAndSaveToProperties(payloadString, `${team}_GLOBAL`);
returnÂ { status: "success"Â };
} catchÂ (error) {
returnÂ { status: "error", message: error.toString() };
}
}

/**
* Loads the global state associated with a specific operational team.
* @param {string} team - Target team identifier
* @returns {Object|null} Recovered global state
*/
function loadGlobalData(team) {
return loadChunkedFromProperties(`${team}_GLOBAL`);
}

/**
* Synchronizes and performs a persistent backup of global data on Google Sheets.
* @param {string} payloadString - Serialized data string
* @param {string} team - Team name for tracking
* @returns {Object} Cloud backup result
*/
function syncDataToCloud(payloadString, team) {
const lockÂ = LockService.getScriptLock();
ifÂ (!lock.tryLock(10000)) returnÂ { status: "error", message: "Server is busy. Please try again later."Â };

tryÂ {
const spreadsheetÂ = SpreadsheetApp.openById(TARGET_DB_ID);
const tabNameÂ = `${team}_Backups`;
let sheetÂ = spreadsheet.getSheetByName(tabName);
ifÂ (!sheet) {
sheetÂ = spreadsheet.insertSheet(tabName);
sheet.appendRow(["Date", "Operator", "Payload Data"]);
sheet.getRange("A1:C1").setFontWeight("bold");
}
let userÂ = "Unknown";
tryÂ { userÂ = Session.getActiveUser().getEmail() || "Unknown"; } catchÂ (e) {}

sheet.appendRow([new Date().toISOString(), user, payloadString]);
returnÂ { status: "success", message: `Global backup completed successfully!`Â };
} catchÂ (error) {
returnÂ { status: "error", message: error.toString() };
} finallyÂ {
lock.releaseLock();
}
}

/**
* Publishes and appends digital slides for the Agent Hub while preserving history.
* @param {string} payloadString - String of new items in JSON array format
* @param {string} workflow - Operational workflow name (e.g., DEMO)
* @returns {Object} Multiline publication operation outcome
*/
function publishAlignments(payloadString, workflow) {
const lockÂ = LockService.getScriptLock();
ifÂ (!lock.tryLock(15000)) returnÂ { success: false, error: "System busy. Retry."Â };

tryÂ {
const newItemsÂ = JSON.parse(payloadString);
let existingÂ = loadChunkedFromProperties(`ALIGNMENTS_${workflow}`);
ifÂ (!Array.isArray(existing)) existingÂ = [];
const combinedÂ = existing.concat(newItems);
chunkAndSaveToProperties(JSON.stringify(combined), `ALIGNMENTS_${workflow}`);

const ssÂ = SpreadsheetApp.openById(TARGET_DB_ID);
let sheetÂ = ss.getSheetByName("ALIGNMENTS_DB");
ifÂ (!sheet) {
sheetÂ = ss.insertSheet("ALIGNMENTS_DB");
sheet.appendRow(["Date", "Workflow", "Data Shards"]);
}

const MAX_CELL_CHARSÂ = 49000;
let jsonChunksÂ = [];
forÂ (let kÂ = 0; kÂ < payloadString.length; kÂ += MAX_CELL_CHARS) {
jsonChunks.push(payloadString.substring(k, kÂ + MAX_CELL_CHARS));
}

let rowDataÂ = [new Date().toISOString(), workflow];
forÂ (let kÂ = 0; kÂ < jsonChunks.length; k++) {
rowData.push(jsonChunks[k]);
}
sheet.appendRow(rowData);
returnÂ { success: true, count: newItems.lengthÂ };
} catchÂ (e) {
returnÂ { success: false, error: e.messageÂ };
} finallyÂ {
lock.releaseLock();
}
}

/**
* Retrieves the complete array of alignments for the Agent Hub filtered by workflow.
* @param {string} workflow - Workflow name to extract
* @returns {Object} Data collection for Partner-side rendering
*/
function fetchAlignments(workflow) {
const dataÂ = loadChunkedFromProperties(`ALIGNMENTS_${workflow}`);
returnÂ { success: true, data: dataÂ || [] };
}

/**
* FEATURE: Alignment Deletion Engine
* @param {string} dateKey - The ISO timestamp string acting as primary key
* @param {string} workflow - The workflow the slide belongs to
*/
function deleteAlignment(dateKey, workflow) {
const lockÂ = LockService.getScriptLock();
ifÂ (!lock.tryLock(10000)) returnÂ { success: false, error: "System busy. Retry."Â };

tryÂ {
let existingÂ = loadChunkedFromProperties(`ALIGNMENTS_${workflow}`);
ifÂ (!Array.isArray(existing)) existingÂ = [];

const initialLengthÂ = existing.length;
// Rimozione tramite filtro sulla data (Primary Key univoca di creazione/pubblicazione)
existingÂ = existing.filter(itemÂ => item.dateÂ !== dateKey);

ifÂ (existing.lengthÂ === initialLength) {
returnÂ { success: false, error: "Slide non trovata per l'eliminazione."Â };
}

chunkAndSaveToProperties(JSON.stringify(existing), `ALIGNMENTS_${workflow}`);
returnÂ { success: true, message: "Slide eliminata definitivamente."Â };
} catchÂ (e) {
returnÂ { success: false, error: e.messageÂ };
} finallyÂ {
lock.releaseLock();
}
}

/**
* =========================================
* Demo DYNAMIC MAPPING ENGINE
* =========================================
*/

function getSheetMetadata(spreadsheetId) {
tryÂ {
const ssÂ = SpreadsheetApp.openById(spreadsheetId);
returnÂ { success: true, metadata: ss.getSheets().map(sÂ => ({ name: s.getName(), lastRow: s.getLastRow(), id: s.getSheetId() })) };
} catchÂ (e) { returnÂ { success: false, error: e.messageÂ }; }
}

function getSheetHeaders(config) {
tryÂ {
const rangeNameÂ = "'"Â + config.sheetNameÂ + "'!"Â + config.headerRowÂ + ":"Â + config.headerRow;
const responseÂ = Sheets.Spreadsheets.Values.get(config.spreadsheetId, rangeName);
if(!response.valuesÂ || response.values.lengthÂ === 0) returnÂ { success: true, headers: [] };
returnÂ { success: true, headers: response.values[0].map((h, i) => ({ name: hÂ || `Col ${i+1}`, index: iÂ })) };
} catchÂ (e) { returnÂ { success: false, error: e.messageÂ }; }
}

function fetchFullSheetData(config) {
tryÂ {
const rangeNameÂ = "'"Â + config.sheetNameÂ + "'";
const responseÂ = Sheets.Spreadsheets.Values.get(config.spreadsheetId, rangeName, { valueRenderOption: 'FORMATTED_VALUE'Â });
const valuesÂ = response.valuesÂ || [];
const headerRowIdxÂ = parseInt(config.headerRow) || 1;
ifÂ (values.lengthÂ <= headerRowIdx) returnÂ { success: true, data: [] };

let processedDataÂ = [];
for(let iÂ = headerRowIdx; iÂ < values.length; i++) {
const rowÂ = values[i];
ifÂ (row.some(cellÂ => cellÂ && cell.toString().trim() !== "")) {
processedData.push({ realRowIndex: iÂ + 1, cells: rowÂ });
}
}
returnÂ { success: true, data: processedDataÂ };
} catchÂ (e) { returnÂ { success: false, error: e.messageÂ }; }
}

function saveSheetConfig(config) {
tryÂ {
const keyÂ = `V26_CFG_${config.spreadsheetId}_${config.sheetName}`;
PropertiesService.getUserProperties().setProperty(key, JSON.stringify({ headerRow: config.headerRow, mapping: config.mappingÂ }));
returnÂ { success: trueÂ };
} catchÂ (e) { returnÂ { success: falseÂ }; }
}

function loadSheetConfig(config) {
tryÂ {
const keyÂ = `V26_CFG_${config.spreadsheetId}_${config.sheetName}`;
const savedÂ = PropertiesService.getUserProperties().getProperty(key);
ifÂ (saved) returnÂ { success: true, config: JSON.parse(saved) };
returnÂ { success: falseÂ };
} catchÂ (e) { returnÂ { success: falseÂ }; }
}

function searchAdvancedMultiTab(config) {
tryÂ {
const ssÂ = SpreadsheetApp.openById(config.spreadsheetId);
const resultsÂ = [];
const maxResultsÂ = 40;
const rulesÂ = {
query: /context|query|prompt|input|topic|domanda|user/i,
response: /response|reply|output|answer|model|risposta|bot/i,
verdict: /final verdict|verdict|label|policy|labeling|explanation|logic/i,
discussion: /discussion|explanation|logic|reasoning|comments|note|description/i
};

forÂ (let tÂ = 0; tÂ < config.tabs.length; t++) {
const tabNameÂ = config.tabs[t];
const sheetÂ = ss.getSheetByName(tabName);
if(!sheet) continue;
const lastColÂ = Math.max(sheet.getLastColumn(), 1);
ifÂ (lastColÂ === 0) continue;
const headersÂ = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
const configKeyÂ = "V26_CFG_"Â + config.spreadsheetIdÂ + "_"Â + tabName;
const savedStrÂ = PropertiesService.getUserProperties().getProperty(configKey);
let savedMapÂ = null;
ifÂ (savedStr) { tryÂ { savedMapÂ = JSON.parse(savedStr).mapping; } catch(e) {} }

let mappingÂ = { query: -1, response: -1, verdict: -1, discussion: -1Â };
ifÂ (savedMap) {
ifÂ (savedMap.userÂ !== undefinedÂ && savedMap.userÂ !== "") mapping.queryÂ = parseInt(savedMap.user);
ifÂ (savedMap.botÂ !== undefinedÂ && savedMap.botÂ !== "") mapping.responseÂ = parseInt(savedMap.bot);
ifÂ (savedMap.explanationÂ !== undefinedÂ && savedMap.explanationÂ !== "") mapping.verdictÂ = parseInt(savedMap.explanation);
ifÂ (savedMap.descriptionÂ !== undefinedÂ && savedMap.descriptionÂ !== "") mapping.discussionÂ = parseInt(savedMap.description);
}

forÂ (let cÂ = 0; cÂ < headers.length; c++) {
let hÂ = headers[c].toLowerCase();
ifÂ (mapping.queryÂ === -1Â && rules.query.test(h)) mapping.queryÂ = c;
ifÂ (mapping.responseÂ === -1Â && rules.response.test(h)) mapping.responseÂ = c;
ifÂ (mapping.verdictÂ === -1Â && rules.verdict.test(h)) mapping.verdictÂ = c;
ifÂ (mapping.discussionÂ === -1Â && rules.discussion.test(h)) mapping.discussionÂ = c;
}

const finderÂ = sheet.createTextFinder(config.query).useRegularExpression(false);
const matchesÂ = finder.findAll();
const rowsFoundÂ = new Set();
for(let iÂ = 0; iÂ < matches.length; i++) {
ifÂ (results.lengthÂ >= maxResults) break;
const rÂ = matches[i].getRow();
if(rÂ <= 1Â || rowsFound.has(r)) continue;
rowsFound.add(r);
const rowValuesÂ = sheet.getRange(r, 1, 1, lastCol).getDisplayValues()[0];
results.push({ sheetName: tabName, row: r, headers: headers, rowData: rowValues, mapping: mappingÂ });
}
ifÂ (results.lengthÂ >= maxResults) break;
}
returnÂ { success: true, results: resultsÂ };
} catchÂ (e) { returnÂ { success: false, error: e.messageÂ }; }
}

function searchGlobalFast(config) {
tryÂ {
const ssÂ = SpreadsheetApp.openById(config.spreadsheetId);
const finderÂ = ss.createTextFinder(config.query).useRegularExpression(false);
const resultsÂ = finder.findAll();
returnÂ { success: true, results: results.slice(0, 10).map(rÂ => ({ sheetName: r.getSheet().getName(), row: r.getRow() })) };
} catchÂ (e) { returnÂ { success: false, error: e.messageÂ }; }
}

/**
* =========================================
* GMAIL DATA MINING ENGINE (ANTI-DUPLICATE PATCH)
* =========================================
*/

function getDbSheet() {
const ssÂ = SpreadsheetApp.openById(TARGET_DB_ID);
let sheetÂ = ss.getSheetByName("BUGS_MINED");
ifÂ (!sheet) {
sheetÂ = ss.insertSheet("BUGS_MINED");
sheet.appendRow(["Bug ID", "Subject", "JSON Data", "Last Updated", "Workflow"]);
sheet.setFrozenRows(1);
}
return sheet;
}

/**
* Core Data Mining Engine. Scans background emails.
* PATCH: Filters out email quote history to prevent cascading duplicate cases.
* @param {number} startOffset - Pagination offset for thread batch scanning
*/
function syncBugBatch(startOffset) {
startOffsetÂ = startOffsetÂ || 0;
const batchSizeÂ = 50;
const queryÂ = 'in:anywhere subject:"Issue" (subject:"[WF-DEMO" OR subject:"[DEMO-A" OR subject:"[DEMO-A" OR subject:"[DEMO-B" OR subject:"[DEMO-C" OR subject:"[DEMO-C" OR subject:"[DEMO-D" OR subject:"[DEMO-E" OR subject:"[DEMO-E" OR subject:"[DEMO-F")';
const threadsÂ = GmailApp.search(query, startOffset, batchSize);

ifÂ (threads.lengthÂ === 0) returnÂ { done: true, totalProcessed: startOffsetÂ };

const lockÂ = LockService.getScriptLock();
tryÂ {
lock.waitLock(25000);
} catchÂ (e) {
returnÂ { done: false, nextOffset: startOffsetÂ };
}

tryÂ {
const sheetÂ = getDbSheet();
const dataÂ = sheet.getDataRange().getValues();
const sheetLastColÂ = Math.max(5, sheet.getLastColumn());
const rowMapÂ = {};

forÂ (let iÂ = 1; iÂ < data.length; i++) {
rowMap[data[i][0].toString()] = iÂ + 1;
}

const timeZoneÂ = Session.getScriptTimeZone();
let newRowsÂ = [];

threads.forEach(threadÂ => {
const messagesÂ = thread.getMessages();
const subjectÂ = messages[0].getSubject();
const rawFirstBodyÂ = messages[0].getPlainBody();
let idMatchÂ = subject.match(/Issue\s+(\d+)/i) || rawFirstBody.match(/Tracker\.corp\.google\.com\/issues\/(\d+)/i);

ifÂ (idMatchÂ && idMatch[1]) {
const bugIdÂ = idMatch[1];
let cleanSubjectÂ = subject.replace(/Fwd:\s*|Re:\s*|Issue\s+\d+:\s*\/\/\s*/gi, '').trim();

let workflowLabelsÂ = [];
let searchAreaÂ = subject.toUpperCase();
ifÂ (/\\bWF-DEMO\\b/.test(searchArea)) workflowLabels.push("WF-DEMO");
ifÂ (/\b(DEMO-A)\b/.test(searchArea)) workflowLabels.push("DEMO-A");
ifÂ (/\\bDEMO-B\\b/.test(searchArea)) workflowLabels.push("DEMO-B");
ifÂ (/\b(DEMO-C)\b/.test(searchArea)) workflowLabels.push("DEMO-C");
ifÂ (/\b(DEMO-D|GEMINI DEMO-D)\b/.test(searchArea)) workflowLabels.push("DEMO-D");
ifÂ (/\b(DEMO-E)\b/.test(searchArea)) workflowLabels.push("DEMO-E");
ifÂ (/\\bDEMO-F\\b/.test(searchArea)) workflowLabels.push("DEMO-F");
let workflowLabelÂ = workflowLabels.lengthÂ > 0Â ? workflowLabels.join(", ") : "WF-DEMO";

let validCommentsÂ = [];

messages.forEach(msgÂ => {
let rawBodyÂ = msg.getPlainBody();
let msgDateÂ = Utilities.formatDate(msg.getDate(), timeZone, "dd/MM/yyyy HH:mm");
let addedSomethingÂ = false;

let cleanBodyÂ = rawBody.split(/On .* wrote:/i)[0].split(/Il .* ha scritto:/i)[0].split(/_{10,}/)[0].split(/Reference Info:/i)[0].trim();

let paCommentMatchÂ = cleanBody.match(/Detailed comments from PA on the final verdict:\s*([\s\S]*?)(?=\n(?:Final Decision from PA|Final Review Label|Initial Review Category|Issue Category|KB Update|Project|Question|Region|Session|Notes(?: -)? per grey area discussion:|Generated by Tracker):|$)/i);
let notesMatchÂ = cleanBody.match(/Notes(?: -)? per grey area discussion:\s*([\s\S]*?)(?=\n(?:Final Decision from PA|Final Review Label|Initial Review Category|Issue Category|KB Update|Project|Question|Region|Session|Detailed comments from PA|Generated by Tracker):|$)/i);
let finalDecisionMatchÂ = cleanBody.match(/Final Decision from PA:\s*(.*)/i);
let finalPolicyMatchÂ = cleanBody.match(/Final Review Label:\s*(.*)/i);

let combinedPaTextÂ = "";
ifÂ (paCommentMatchÂ && paCommentMatch[1].trim() !== ""Â && paCommentMatch[1].trim() !== "-") combinedPaTextÂ += paCommentMatch[1].trim() + "\n\n";
ifÂ (notesMatchÂ && notesMatch[1].trim() !== ""Â && notesMatch[1].trim() !== "-") combinedPaTextÂ += "Notes - per grey area discussion:\n"Â + notesMatch[1].trim() + "\n\n";

combinedPaTextÂ = combinedPaText.trim();

ifÂ (combinedPaTextÂ !== "") {
let adminActionÂ = cleanBody.match(/Changed[\s\S]*?(?=\n\n|$)/i);
let adminTextÂ = adminActionÂ ? adminAction[0].trim().replace(/\n/g, ' ') : "Status Update / Calibration";
let structuredDataÂ = parseStructuredCases(combinedPaText);

validComments.push({
type: 'pa_verdict', admin: adminText, header: "ðŸš¨ PA Final Verdict & Comments", body: combinedPaText, structuredCases: structuredData.cases, introText: structuredData.intro, globalDecision: finalDecisionMatchÂ ? finalDecisionMatch[1].trim() : "", globalPolicy: finalPolicyMatchÂ ? finalPolicyMatch[1].trim() : "", date: msgDate
});
addedSomethingÂ = true;
}

let commentMatchÂ = cleanBody.match(/([a-zA-Z0-9._-]+@google\.com added comment #\d+:)/i);
ifÂ (commentMatch) {
let adminTextÂ = cleanBody.substring(0, commentMatch.index).trim();
let headerÂ = commentMatch[1].trim();
let bodyÂ = cleanBody.substring(commentMatch.indexÂ + header.length).trim().replace(/\n{3,}/g, '\n\n');

ifÂ (body.lengthÂ > 0) {
let structuredDataÂ = parseStructuredCases(body);
validComments.push({ type: 'comment', admin: addedSomethingÂ ? ""Â : adminText, header: header, body: body, structuredCases: structuredData.cases, date: msgDateÂ });
addedSomethingÂ = true;
}
} else ifÂ (!addedSomethingÂ && (cleanBody.match(/created issue #\d+/i) || cleanBody.includes("DESCRIPTION"))) {
let bodyÂ = cleanBody.replace(/.*?created issue #\d+:\s*/i, '').replace(/^DESCRIPTION\s*/i, '').trim();
ifÂ (body.lengthÂ > 0) validComments.push({ type: 'description', admin: '', header: "Original Description:", body: body, date: msgDateÂ });
}
});

ifÂ (validComments.lengthÂ > 0) {
const threadLinkÂ = "https://example.com/resource"Â + thread.getId();
const payloadStrÂ = JSON.stringify({ subject: cleanSubject, comments: validComments, link: threadLinkÂ });
const nowStrÂ = Utilities.formatDate(new Date(), timeZone, "dd/MM/yyyy HH:mm:ss");

const MAX_CELL_CHARSÂ = 49000;
let jsonChunksÂ = [];
forÂ (let kÂ = 0; kÂ < payloadStr.length; kÂ += MAX_CELL_CHARS) {
jsonChunks.push(payloadStr.substring(k, kÂ + MAX_CELL_CHARS));
}

let rowDataÂ = [bugId, cleanSubject, jsonChunks[0], nowStr, workflowLabel];
forÂ (let kÂ = 1; kÂ < jsonChunks.length; k++) {
rowData.push(jsonChunks[k]);
}

ifÂ (rowMap[bugId]) {
let targetRowÂ = rowMap[bugId];
let writeDataÂ = [...rowData];
while(writeData.lengthÂ < sheetLastCol) writeData.push("");
sheet.getRange(targetRow, 1, 1, writeData.length).setValues([writeData]);
} elseÂ {
newRows.push(rowData);
rowMap[bugId] = data.lengthÂ + newRows.length;
}
}
}
});

ifÂ (newRows.lengthÂ > 0) {
let maxColsÂ = 0;
newRows.forEach(rÂ => maxColsÂ = Math.max(maxCols, r.length));
newRows.forEach(rÂ => { while(r.lengthÂ < maxCols) r.push(""); });
sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, maxCols).setValues(newRows);
}
} finallyÂ {
lock.releaseLock();
}

returnÂ { done: true, totalProcessed: startOffsetÂ };
}

function getBugCacheChunked(startRow, chunkSize) {
tryÂ {
const ssÂ = SpreadsheetApp.openById(TARGET_DB_ID);
const sheetÂ = ss.getSheetByName("BUGS_MINED");
ifÂ (!sheet) returnÂ { data: {}, nextRow: startRow, done: trueÂ };
const lastRowÂ = sheet.getLastRow();
ifÂ (lastRowÂ <= 1Â || startRowÂ > lastRow) returnÂ { data: {}, nextRow: startRow, done: trueÂ };

const numRowsÂ = Math.min(chunkSize, lastRowÂ - startRowÂ + 1);
const lastColÂ = Math.max(5, sheet.getLastColumn());
const dataÂ = sheet.getRange(startRow, 1, numRows, lastCol).getValues();

const resultÂ = {};
forÂ (let iÂ = 0; iÂ < data.length; i++) {
let bugIdÂ = data[i][0].toString();
let jsonStrÂ = data[i][2] || "";
let workflowÂ = data[i][4] || "WF-DEMO";

ifÂ (data[i].lengthÂ > 5) {
forÂ (let cÂ = 5; cÂ < data[i].length; c++) {
ifÂ (data[i][c]) jsonStrÂ += data[i][c].toString();
}
}

ifÂ (bugIdÂ && jsonStr) {
tryÂ {
let parsedObjÂ = JSON.parse(jsonStr);
parsedObj.workflowÂ = workflow;
result[bugId] = parsedObj;
} catch(e) {}
}
}
returnÂ { data: result, nextRow: startRowÂ + numRows, done: (startRowÂ + numRowsÂ > lastRow) };
} catchÂ (err) {
returnÂ { data: {}, done: true, error: err.messageÂ };
}
}

/**
* =========================================
* ENTERPRISE DAEMON INSTALLATION
* =========================================
*/

function setupEnterpriseTriggers() {
const triggersÂ = ScriptApp.getProjectTriggers();
const existsÂ = triggers.some(tÂ => t.getHandlerFunction() === 'runBackgroundSync');
ifÂ (!exists) {
ScriptApp.newTrigger('runBackgroundSync')
.timeBased()
.everyMinutes(30)
.create();
Logger.log("âœ… Enterprise Trigger Installato: Data Mining ogni 30 minuti.");
} elseÂ {
Logger.log("âš ï¸ Trigger giÃ  esistente. Nessuna azione necessaria.");
}
}

function runBackgroundSync() {
syncBugBatch(0);
}

function toggleAutoSync(enable) {
tryÂ {
const triggersÂ = ScriptApp.getProjectTriggers();
forÂ (let iÂ = 0; iÂ < triggers.length; i++) {
ifÂ (triggers[i].getHandlerFunction() === 'runBackgroundSync') ScriptApp.deleteTrigger(triggers[i]);
}
ifÂ (enable) {
ScriptApp.newTrigger('runBackgroundSync').timeBased().everyMinutes(30).create();
returnÂ { active: true, msg: "Auto-Sync activated! Background analysis every 30 min."Â };
} elseÂ {
returnÂ { active: false, msg: "Auto-Sync deactivated."Â };
}
} catch(e) { throw new Error(e.message); }
}

function getAutoSyncStatus() {
tryÂ {
const triggersÂ = ScriptApp.getProjectTriggers();
forÂ (let iÂ = 0; iÂ < triggers.length; i++) {
ifÂ (triggers[i].getHandlerFunction() === 'runBackgroundSync') return true;
}
return false;
} catch(e) { return false; }
}

function parseStructuredCases(text) {
const caseRegexÂ = /(?:\s|^)(?:For\s+)?([\[\(]?(?:Case|Task|Scenario)\s*\d+[\]\)\.:\-,]*|[\[\(]\d+[\]\)]|\b\d+[\)\.])(?=\s|$)/ig;
const partsÂ = text.split(caseRegex);
ifÂ (parts.lengthÂ <= 1) returnÂ { intro: text, cases: [] };

let introÂ = parts[0].trim();
let casesÂ = [];
const safeRegexÂ = /\b(no\s*violation|not\s*violative|safe|ok|no\s*action|good|allow|non\s*violative|nv)\b/i;
const violRegexÂ = /\b(violation|violative|unsafe|bad|actioned|remove|dangerous\s*content|sexually\s*explicit|harassment|medical\s*advice|hate\s*speech|pii|csam|child\s*safety|illicit|vulgar|profanity|violence|gore|self\s*harm|suicide|ssh|mai|dangerous\s*activity|v)\b/i;
const policyRegexStrÂ = "dangerous\\s*content|sexually\\s*explicit|harassment|medical\\s*advice|hate\\s*speech|pii|csam|child\\s*safety|illicit|vulgar|profanity|violence|gore|self\\s*harm|suicide|ssh|mai|dangerous\\s*activity";

forÂ (let iÂ = 1; iÂ < parts.length; iÂ += 2) {
let caseNameÂ = parts[i].trim();
let caseContentÂ = parts[i+1] ? parts[i+1].trim() : "";
let cleanNameÂ = caseName.replace(/[:\.\-\),]+$/, '').replace(/^[\[\(]+/, '').replace(/[\]\)]+$/, '').replace(/^for\s+/i, '').trim();
ifÂ (/^\d+$/.test(cleanName)) cleanNameÂ = "Case "Â + cleanName;
cleanNameÂ = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

let displayVerdictÂ = "Review";
let isViolationÂ = true;
let isNeutralÂ = true;

let explicitMatchÂ = caseContent.match(/^(?:-?\s*|[\r\n]*)*(?:Verdict|Esito|Decision|Label|Result|Policy)\s*[:-]\s*(.*?)(?=\.|\s+[-â€“]\s+|\s+(?:The|This|In|As|Due|Because|Frederik|Fredrik|Whenever|I|We|He|She|It|For)\b|$)/i);
let answerMatchÂ = caseContent.match(/(?:Answer|Conclusion|Guidance)\s*[:-]\s*([\s\S]+)/i);
let directiveMatchÂ = caseContent.match(new RegExp(`(?:label|flag|mark|consider|categorize|classify)(?:\\s+it|\\s+this)?(?:\\s+as|\\s+under)?\\s+(${policyRegexStr}|non\\s*violative|violative)`, "i"));
let violationUnderMatchÂ = caseContent.match(new RegExp(`(?:violation|violative)\\s+(?:for|under|of|due\\s+to)\\s+(${policyRegexStr})`, "i"));

ifÂ (explicitMatch) {
displayVerdictÂ = explicitMatch[1].trim();
ifÂ (safeRegex.test(displayVerdict)) { isViolationÂ = false; isNeutralÂ = false; }
else ifÂ (violRegex.test(displayVerdict)) { isViolationÂ = true; isNeutralÂ = false; }
elseÂ { isViolationÂ = true; isNeutralÂ = true; }
caseContentÂ = caseContent.replace(explicitMatch[0], '').replace(/^[:\.\-\s]*/, '').trim();
}
else ifÂ (answerMatchÂ && (safeRegex.test(answerMatch[1]) || violRegex.test(answerMatch[1]))) {
let ansTextÂ = answerMatch[1].trim();
ifÂ (safeRegex.test(ansText) && !violRegex.test(ansText)) {
displayVerdictÂ = "No Violation"; isViolationÂ = false; isNeutralÂ = false;
} else ifÂ (violRegex.test(ansText)) {
let extractedPolÂ = ansText.match(new RegExp(policyRegexStr, "i"));
displayVerdictÂ = extractedPolÂ ? extractedPol[0] : "Violation";
isViolationÂ = true; isNeutralÂ = false;
}
}
else ifÂ (directiveMatch) {
displayVerdictÂ = directiveMatch[1].trim();
ifÂ (safeRegex.test(displayVerdict)) { isViolationÂ = false; isNeutralÂ = false; displayVerdictÂ = "No Violation"; }
elseÂ { isViolationÂ = true; isNeutralÂ = false; }
}
else ifÂ (violationUnderMatch) {
displayVerdictÂ = violationUnderMatch[1].trim();
isViolationÂ = true; isNeutralÂ = false;
}
elseÂ {
let startMatchÂ = caseContent.match(/^(?:-?\s*|[\r\n]*)*(No\s*violation|Not\s*violative|Safe|Violation|Violative|Unsafe|OK|Actioned|BAD|Non\s*violative|NV|V)\b/i);
ifÂ (startMatch) {
displayVerdictÂ = startMatch[1].trim();
ifÂ (safeRegex.test(displayVerdict)) { isViolationÂ = false; isNeutralÂ = false; displayVerdictÂ = "No Violation"; }
elseÂ { isViolationÂ = true; isNeutralÂ = false; displayVerdictÂ = "Violation"; }
caseContentÂ = caseContent.substring(startMatch[0].length).replace(/^[:\.\-\s]*/, '').trim();
} elseÂ {
let snippetÂ = caseContent.substring(0, 150);
ifÂ (safeRegex.test(snippet) && !violRegex.test(snippet)) {
displayVerdictÂ = "Review (Safe?)"; isViolationÂ = false; isNeutralÂ = true;
}
else ifÂ (violRegex.test(snippet)) {
displayVerdictÂ = "Review (Violative?)"; isViolationÂ = true; isNeutralÂ = true;
}
elseÂ {
displayVerdictÂ = "Information"; isNeutralÂ = true; isViolationÂ = false;
}
}
}

ifÂ (displayVerdict.toLowerCase() === 'mai') displayVerdictÂ = 'Medical Advice';
ifÂ (displayVerdict.toLowerCase() === 'ssh') displayVerdictÂ = 'Self Harm';
ifÂ (displayVerdict.toLowerCase() === 'nv') displayVerdictÂ = 'No Violation';
displayVerdictÂ = displayVerdict.charAt(0).toUpperCase() + displayVerdict.slice(1);

cases.push({ name: cleanName, verdictText: displayVerdict, isViolation: isViolation, isNeutral: isNeutral, description: caseContentÂ });
}
returnÂ { intro: intro, cases: casesÂ };
}

function emergencyRestoreFromSheet() {
const teamÂ = "QA";
const ssÂ = SpreadsheetApp.openById(TARGET_DB_ID);
const sheetÂ = ss.getSheetByName(`${team}_Backups`);
ifÂ (!sheet) {
Logger.log("âŒ Error: Backup tab not found.");
return;
}
const lastRowÂ = sheet.getLastRow();
ifÂ (lastRowÂ < 2) {
Logger.log("âŒ Error: No backup found in tab.");
return;
}
const lastRowDataÂ = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
let payloadStrÂ = "";
forÂ (let iÂ = 0; iÂ < lastRowData.length; i++) {
const cellValueÂ = String(lastRowData[i]);
ifÂ (cellValue.startsWith('{"db":') || cellValue.includes('"db":[')) {
payloadStrÂ = cellValue;
break;
}
}
ifÂ (!payloadStr) {
Logger.log("âŒ Error: No valid JSON found in the last backup row.");
return;
}
tryÂ {
JSON.parse(payloadStr);
chunkAndSaveToProperties(payloadStr, `${team}_GLOBAL`);
Logger.log(`âœ… RESTORE COMPLETED SUCCESSFULLY!`);
} catchÂ (e) {
Logger.log(`âŒ Fatal error: ${e.message}`);
}
}

