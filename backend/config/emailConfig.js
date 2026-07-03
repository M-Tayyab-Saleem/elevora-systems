const sendEmail = async ({ to, subject, template, context }) => {

  return { response: "250 OK (Demo Mode)" };
};

const sendInvitationEmail = async ({ to, name, role, loginURL }) => {

};

module.exports = {
  sendEmail,
  sendInvitationEmail,
};