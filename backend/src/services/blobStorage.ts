import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob";
import { config } from "../config.js";

const blobServiceClient = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING);

let containerClientPromise: Promise<ContainerClient> | null = null;

function getContainerClient(): Promise<ContainerClient> {
  if (!containerClientPromise) {
    containerClientPromise = (async () => {
      const container = blobServiceClient.getContainerClient(config.AZURE_STORAGE_CONTAINER_NAME);
      await container.createIfNotExists({ access: "blob" });
      return container;
    })();
  }
  return containerClientPromise;
}

export async function uploadCardImage(code: string, bytes: Buffer, contentType: string): Promise<string> {
  const container = await getContainerClient();
  const ext = contentType.includes("png") ? "png" : contentType.includes("jpeg") ? "jpg" : "png";
  const blockBlobClient = container.getBlockBlobClient(`${code}.${ext}`);
  await blockBlobClient.uploadData(bytes, { blobHTTPHeaders: { blobContentType: contentType } });
  return blockBlobClient.url;
}

// The blob's extension isn't known up front (it depends on the source
// image's content-type), so an existing upload for a card code can only be
// found by listing with a `${code}.` prefix rather than a direct lookup.
export async function findExistingCardImage(code: string): Promise<string | null> {
  const container = await getContainerClient();
  for await (const blob of container.listBlobsFlat({ prefix: `${code}.` })) {
    return container.getBlockBlobClient(blob.name).url;
  }
  return null;
}
