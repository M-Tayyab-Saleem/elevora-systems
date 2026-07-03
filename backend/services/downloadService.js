const { BadRequestError } = require("../utils/ExpressError");
const logger = require("../utils/logger");

class DownloadService {
  async getDownloadUrl(user, blobNameInput) {
    let blobName = blobNameInput;

    if (!blobName) {
      throw new BadRequestError("File URL or name is required");
    }

    // Since we now use Cloudinary (or external storage), the URL is usually direct.
    // If it's already an HTTP URL, we just return it.
    if (blobName.startsWith("http")) {
      logger.info(`Download link requested for file: ${blobName} by user: ${user?.email || "unknown"}`);
      return blobName;
    }

    blobName = decodeURIComponent(blobName);

    if (blobName.includes("..")) {
      throw new BadRequestError("Invalid file name pattern");
    }

    // If it's not an absolute URL, this assumes some local fetching logic, 
    // but in our Cloudinary transition, they should all be absolute URLs now.
    // We'll just return the blobName or construct a local path if needed.
    return blobName;
  }
}

module.exports = new DownloadService();
