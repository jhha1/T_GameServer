const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function _getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: CONFIG["google"]["serviceAccountKeyFile"],
        scopes: SCOPES,
    });
    const authClient = await auth.getClient();
    return authClient;
}

class GoogleSheet {
    constructor(sheetId) {
        this.sheetId = sheetId;
    }

    async _getGoogleSheet() {
        const authClient = await _getAuthClient();
        return google.sheets({
            version: 'v4',
            auth: authClient,
        });
    }

    //const sheetName = 'Item';
    async readSheet(sheetName) {
        const googleSheetClient = await this._getGoogleSheet();
        const res = await googleSheetClient.spreadsheets.values.get({
            spreadsheetId: this.sheetId,
            range: `${sheetName}!A1:Z`,
        });

        return res.data.values;
    }

    async readSheetAll() {
        const googleSheetClient = await this._getGoogleSheet();
        const res = await googleSheetClient.spreadsheets.get({
            spreadsheetId: this.sheetId,
            fields: 'sheets.properties'
        });

        const sheetsList = res.data.sheets.map((sheet) => sheet.properties.title);

        const promises = sheetsList.map(async (sheetName) => {
            const response = await googleSheetClient.spreadsheets.values.get({
                spreadsheetId: this.sheetId,
                range: `${sheetName}!A1:Z`,
            });
            const values = response.data.values;
            return { sheetName, values };
        });
        const sheetDataArray = await Promise.all(promises);

        return sheetDataArray;
    }
}

module.exports.GoogleSheet = GoogleSheet;

