const bcrypt = require("bcryptjs");
const { sign, verify } = require("jsonwebtoken");
const KEY = "CHATROOM_SECRET2024";

exports.hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    return hashPassword;
};

exports.verifyPassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};

exports.createJWT = (email) => {
    return sign({ email }, KEY, { expiresIn: "1h" });
};

exports.verifyJWT = (token) => {
    return verify(token, KEY);
};

exports.getCurrentDate = () => {
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const year = currentDate.getFullYear();
    return `${month}/${day}/${year}`;
};

exports.getCurrentTime = () => {
    const currentDate = new Date();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 12-hour clock format
    minutes = minutes < 10 ? "0" + minutes : minutes; // Add leading zero if minutes < 10
    return `${hours}:${minutes} ${ampm}`;
};
