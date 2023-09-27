const JSZip = require('jszip');
const moment = require('moment');

async function makeZip(data) {
    const zip = new JSZip();
    zip.file('data.json', JSON.stringify(data)); // data.json 파일 추가
    const content = await zip.generateAsync({ type: 'nodebuffer' });
    return content; // zip 파일 데이터를 리턴
}

async function unZip(zipData) {
    try {
        const zip = await JSZip.loadAsync(zipData);
        const files = Object.keys(zip.files);
        const unzipData = [];

        for (let i = 0; i < files.length; i++) {
            const fileName = files[i];
            const fileData = await zip.file(fileName).async('nodebuffer');
            unzipData.push(fileData);
        }

        return unzipData[0];
    } catch (err) {
        console.error(err);
    }
}

function makeZipFileName() {
    let dt = moment.utc().format('YYYY-MM-DD_HH:mm:ss');
    let fileName = `${CONFIG["const"]["zipName"]}_${dt}.zip`;
    return fileName;
}

exports.make = makeZip;
exports.unZip = unZip;
exports.makeZipFileName = makeZipFileName;