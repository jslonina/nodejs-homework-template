const sgMail = require("@sendgrid/mail");
require("dotenv").config();
const { SENDGRID_API_KEY, PORT, BASE_URL, SENDER } = process.env;
sgMail.setApiKey(SENDGRID_API_KEY);

const baseUrl = BASE_URL + ":" + PORT;

const sendVerificationMsg = async (addressee, verificationToken) => {
  const msg = {
    to: addressee,
    from: {
      name: "CONTACT APP",
      email: SENDER,
    }, // Change to your verified sender
    subject: "Confirm registration",
    html: `
    <p style="font-family: Arial, sans-serif;">
  Hi there! </p>
  <p>Thank you for registering! We are thrilled to have you on board! </p>
 <p>Just one quick step left to get started - please click the link below to confirm your email address.
</p>
<p>${baseUrl}/api/users/verify/${verificationToken}</p>
`,
  };

  await sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  sendVerificationMsg,
};