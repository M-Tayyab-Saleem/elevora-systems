const { cloudinary } = require('./config/cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const createStorage = (folderName) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `elevora_${folderName}`,
      resource_type: 'auto'
    },
  });
};

const userProfileStorage = createStorage("users/profile_photos");
const timeLogsStorage = createStorage("timeLogs/attachments");
const timesheetsStorage = createStorage("timesheets/attachments");
const ticketsAttachmentsStorage = createStorage("tickets/attachments");
const expensesStorage = createStorage("expenses/receipts");
const fileStorage = createStorage("files");
const folderStorage = createStorage("folders/thumbnails");

module.exports = {
  fileStorage,
  folderStorage,
  userProfileStorage,
  timeLogsStorage,
  timesheetsStorage,
  ticketsAttachmentsStorage,
  expensesStorage
};
