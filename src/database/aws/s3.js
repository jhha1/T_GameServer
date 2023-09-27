const AWS = require('aws-sdk');

class s3 {
    constructor() {
        // AWS 계정 액세스 자격 증명 설정
        this.S3 = new AWS.S3({
            accessKeyId: CONFIG["aws"]["accessKeyId"],
            secretAccessKey: CONFIG["aws"]["secretAccessKey"]
        });

        // S3 버킷 설정
        this.bucketName = CONFIG["aws"]["s3"]["bucketName"];
    }

    // AWS S3 파일 업로드
    async upload(folderPath, fileName, data) {
        // S3 객체 생성
        const params = {
            Bucket: `${this.bucketName}/${folderPath}`,
            Key: fileName,
            Body: data
        };

        // S3 객체 업로드
        try {
            const data = await this.S3.upload(params).promise();
            console.log(`File uploaded successfully. File URL: ${data.Location}`);
        } catch (err) {
            console.error(err);
        }
    }

    // AWS S3 파일 다운로드
    async download(folderPath, fileNameList) {
        const files = fileNameList.map(fileName => ({ Key: fileName, Bucket: `${this.bucketName}/${folderPath}`}));
        const downloadedFiles = {};

        await Promise.all(files.map(async (file) => {
            const params = {
                Bucket: file.Bucket,
                Key: file.Key
            };
            const { Body } = await this.S3.getObject(params).promise();
            downloadedFiles[file.Key] = Body;

            //downloadedFiles[file.Key] = JSON.parse(Body.toString('utf-8'));
            //console.log(`File downloaded successfully. Contents: ${Body.toString()}`);
        }))
        .catch((err) => {
            console.error(err);
        });

        return downloadedFiles;
    }

    // AWS S3 폴더 다운로드
    async downloadFolder(folderPath) {
        const params = {
            Bucket: this.bucketName,
            Prefix: `${folderPath}/`
        };

        // AWS S3 객체 리스트 조회
        const objects = await this.S3.listObjectsV2(params).promise();

        // AWS S3 객체 다운로드
        for (const object of objects.Contents) {
            const objectParams = { Bucket: this.bucketName, Key: object.Key };
            const objectData = await this.S3.getObject(objectParams).promise();
            return objectData.Body;
        }
    }
}

module.exports.s3 = s3;