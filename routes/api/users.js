const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const jimp = require("jimp");
const path = require("path");
const fs = require("fs").promises;

const { userSchema } = require("./../../models/users");
const {
  findUserByEmail,
  findUserByID,
  checkUserExists,
  addUser,
} = require("./../../controllers/userOperations");
const tokenMiddleware = require("./../../middlewares/tokenMiddleware");
const upload = require("./../../middlewares/upload");

router.post("/signup", async (req, res, next) => {
  try {
    const { error } = userSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: "Field missing" });
    }

    const userExists = await checkUserExists(req.body.email);

    if (userExists) {
      return res.status(409).json({ message: "Email in use" });
    }

    const hashedPassword = await bcrypt.hashSync(req.body.password, 10);

    const avatarURL = gravatar.url(req.body.email);

    const newUser = await addUser({
      email: req.body.email,
      password: hashedPassword,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Field missing" });
  }

  const userData = await findUserByEmail(req.body.email);

  if (!userData) {
    return res.status(401).send({ message: "Email or password is wrong" });
  }

  const hashVerifiedPassword = await bcrypt.compareSync(
    req.body.password,
    userData.password
  );

  if (!hashVerifiedPassword) {
    return res.status(401).send({ message: "Email or password is wrong" });
  }

  const token = jwt.sign({ userId: userData._id }, process.env.ACCESS_TOKEN, {
    expiresIn: "1h",
  });
  userData.token = token;
  await userData.save();

  res.status(200).send({
    token: token,
    user: {
      email: userData.email,
      subscription: userData.subscription,
    },
  });
});

router.get("/logout", tokenMiddleware, async (req, res) => {
  try {
    const user = await findUserByID(req.user.userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    user.token = null;
    user.save();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/current", tokenMiddleware, async (req, res) => {
  try {
    const user = await findUserByID(req.user.userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res
      .status(200)
      .send({ email: user.email, subscription: user.subscription });

    console.log(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch(
  "/avatars",
  tokenMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { path: temp, filename } = req.file;
      const avatarDir = path.join(process.cwd(), "public", "avatars");

      if (!req.file) {
        return res.status(400).json({ message: "File not found" });
      }

      const image = await jimp.read(req.file.path);
      await image.autocrop().resize(250, 250).writeAsync(req.file.path);
      const user = await findUserByID(req.user.userId);

      if (!user) {
        return res.staus(401).json({ message: "Not Authorized" });
      }

      await fs.rename(temp, path.join(avatarDir, filename));
      user.avatarURL = `/avatars/${filename}`;
      await user.save();

      return res
        .status(200)
        .json({ avatarURL: user.avatarURL, message: "avatar updated" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;