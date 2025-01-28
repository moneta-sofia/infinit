import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "process";
const multer = require("multer");

const s3Client = new S3Client({
  secretAccessKey: env(AWS_SECRET_ACCESS_KEY),
  accessKeyId: env(AWS_ACCESS_KEY_ID),
  region: env(AWS_REGION),
});

/*export const config = {
  api: {
    bodyParser: false,
  },
};*/

export async function POST(req, context) {
  try {
    const formData = await req.formData();


    const files = formData.getAll("images");

    console.log('files :>> ', files);


    const uploadUrls = []; // Array to store the URLs

    for (const file of files) {
      const { mimetype, name } = file;

      const directoryPath = "vehicle";

      const key = `${directoryPath}/${name}`;

      const fileBuffer = await file.arrayBuffer();

      const params = {
        Bucket: "c6-pi-grupo3",
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
      };

      await s3Client.send(new PutObjectCommand(params));

      const objectUrl = `https://c6-pi-grupo3.s3.amazonaws.com/${key}`;
      uploadUrls.push({ image: objectUrl }); // Push an object with an "image" attribute
    }

    const jsonResponse = JSON.stringify(uploadUrls);

    const response = new NextResponse(jsonResponse, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("File upload error:", error);
    const response = new NextResponse("File upload failed.", { status: 500 });
    return response;
  }
}
