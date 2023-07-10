const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs").promises;
const multer = require("multer");
const jimp = require("jimp");

const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();
const { auth } = require("../../auth/auth.js");
const {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  getUserByVerificationToken,
} = require("../../controllers/users.js");

const { issueToken } = require("../../auth/issueToken.js");

const { userValidationSchema } = require("../../models/user.js");

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const { error } = userValidationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: error.details[0].message,
      data: "Bad Request",
    });
  }

  const newUser = await getUserByEmail(email);

  if (newUser) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email is already in use",
      data: "Conflict",
    });
  }
  try {
    const user = await createUser(email, password);
    const newUser = await getUserByEmail(email);
    const verificationToken = newUser.verificationToken;
    const msg = {
      to: email,
      from: "jp@jpworkroom.com",
      subject: "Please verify your email address",
      text: `Dear user, To access all the features of our website, please copy verification link [localhost:3000/api/users/verify/${verificationToken}] and paste into your browser to complete the email verification process. If you have any questions or concerns, please feel free to contact our customer support team. Best regards, Jacek Pietrzak`,
      html: `<p>Dear user,</p><p>To access all the features of our website, please click on the verification link below</p><a href='http://localhost:3000/api/users/verify/${verificationToken}'>http://localhost:3000/api/users/verify/${verificationToken}</a><p>If you have any questions or concerns, please feel free to contact our customer support team.</p><p>Best regards,<br>Jacek Pietrzak</p>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    return res.status(201).json({
      status: "Created",
      code: 201,
      message: "Registration successful",
      data: {
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

router.post("/verify", async (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ message: "missing required field email" });
  }
  try {
    const newUser = await getUserByEmail(email);
    const verificationToken = newUser.verificationToken;

    if (verificationToken === null) {
      res.status(400).json({
        status: "Bad Request",
        code: 400,
        message: "Verification has already been passed",
      });
    }
    const msg = {
      to: email,
      from: "jp@jpworkroom.com",
      subject: "Please verify your email address",
      text: `Dear user, To access all the features of our website, please copy verification link [localhost:3000/api/users/verify/${verificationToken}] and paste into your browser to complete the email verification process. If you have any questions or concerns, please feel free to contact our customer support team. Best regards, Jacek Pietrzak`,
      html: `<p>Dear user,</p><p>To access all the features of our website, please click on the verification link below</p><a href='http://localhost:3000/api/users/verify/${verificationToken}'>http://localhost:3000/api/users/verify/${verificationToken}</a><p>If you have any questions or concerns, please feel free to contact our customer support team.</p><p>Best regards,<br>Jacek Pietrzak</p>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
    return res.status(200).json({
      status: "Ok",
      code: 200,
      message: "Verification email sent",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

router.get("/verify/:verificationToken", async (req, res) => {
  const { verificationToken } = req.params;
  const user = await getUserByVerificationToken(verificationToken);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const newData = { verify: true, verificationToken: null };
    await updateUser(user._id, newData);
    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { error } = userValidationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: error.details[0].message,
      data: "Bad Request",
    });
  }

  const user = await getUserByEmail(email);

  if (user.verify === false) {
    return res
      .status(400)
      .json({ message: "You need to verify your email address" });
  }

  const userPassword = user.password;

  const passwordCorrect = bcrypt.compareSync(password, userPassword);

  if (!user || !passwordCorrect) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Email or password is wrong",
      data: "Bad request",
    });
  }

  try {
    const token = issueToken(user);

    const newData = { token: token };
    await updateUser(user._id, newData);

    return res.status(200).json({
      status: "success",
      code: 200,
      data: {
        token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

router.get("/logout", auth, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const newData = { token: null };
    await updateUser(_id, newData);
    return res.status(204).json({
      message: "Logged out",
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/current", auth, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);

    return res.status(200).json({
      status: "success",
      code: 200,
      data: {
        user: {
          email: user.email,
          subscription: user.subscription,
          avatar: user.avatarURL,
        },
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

const uploadTmpDir = path.join(process.cwd(), "tmp");
const avatarsDir = path.join(process.cwd(), "/public/avatars");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadTmpDir);
  },
  avatarFilePath: (req, file, cb) => {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 1048576,
  },
});

const upload = multer({
  storage: storage,
});

router.patch(
  "/avatars",
  auth,
  upload.single("avatar"),
  async (req, res, next) => {
    const { path: temporaryName, originalname: originalName } = req.file;

    const image = await jimp.read(temporaryName);
    await image.resize(250, 250);
    await image.writeAsync(temporaryName);

    const { _id } = req.user;

    const userId = req.user.id;
    const newName = userId + "-" + originalName;
    const avatarFilePath = path.join(avatarsDir, newName);

    try {
      await fs.rename(temporaryName, avatarFilePath);

      const newData = { avatarURL: avatarFilePath };
      await updateUser(_id, newData);

      const user = await getUserById(req.user.id);
      return res.status(200).json({
        status: "ok",
        code: 200,
        message: "File uploaded successfully",
        data: {
          avatarURL: user.avatarURL,
        },
      });
    } catch (error) {
      console.log(error.message);
      await fs.unlink(temporaryName);
      return res.status(401).json({
        status: "Unauthorized",
        code: 401,
        message: "Not authorized",
        error: error.message,
      });
    }
  }
);

module.exports = router;