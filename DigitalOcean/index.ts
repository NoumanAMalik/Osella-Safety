import { S3Client } from "@aws-sdk/client-s3";

if (
    !process.env.NEXT_PUBLIC_SPACES_KEY ||
    !process.env.NEXT_PUBLIC_SPACES_SECRET
) {
    throw new Error(
        "DigitalOcean Spaces credentials are not set in environment variables"
    );
}

const s3Client = new S3Client({
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    endpoint: "https://nyc3.digitaloceanspaces.com",
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_SPACES_KEY,
        secretAccessKey: process.env.NEXT_PUBLIC_SPACES_SECRET,
    },
});

export { s3Client };
