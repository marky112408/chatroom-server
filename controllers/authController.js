const {
    collection,
    getDocs,
    query,
    where,
    doc,
    setDoc,
} = require("firebase/firestore");
const { db } = require("../firebaseConfig");
const {
    hashPassword,
    verifyPassword,
    createJWT,
    verifyJWT,
} = require("../util/util");
const { v4: uuidv4 } = require("uuid");

exports.signupUser = async (req, res, next) => {
    const data = req.body;
    const errors = [];
    const {
        avatar,
        firstname,
        lastname,
        email,
        mobileno,
        password,
        confirmpassword,
    } = data;

    if (!email.includes("@")) {
        error.push("Invalid email!");
    }

    if (mobileno.length > 11) {
        error.push("Mobile no cannot exceed to 11 digits");
    }

    if (password !== confirmpassword) {
        error.push("Password and Confirm password do not match!");
    }

    if (errors.length > 0) {
        return res.status(422).json({
            success: false,
            message: "User signup failed due to validation errors",
            errors: errors,
        });
    }
    const id = uuidv4();
    const usersSnapShot = await getDocs(collection(db, "users"));
    if (usersSnapShot.empty) {
        await setDoc(doc(db, "users", email), {
            id: id,
            avatar,
            firstname,
            lastname,
            email,
            mobileno,
            password: hashPassword(password),
            contacts: [],
        });
        const authToken = createJWT(email);
        return res.status(200).json({
            success: true,
            token: authToken,
            userData: {
                id,
                avatar,
                email,
                name: firstname + " " + lastname,
            },
            message: "Signup successfully. You will be login directly",
        });
    } else {
        const emailExistQuery = query(
            collection(db, "users"),
            where("email", "==", email)
        );
        const emailExistSnapShot = await getDocs(emailExistQuery);
        if (!emailExistSnapShot.empty) {
            errors.push("User email already exist");
            return res.status(422).json({
                success: false,
                message: "Data error. Some data already exist",
                errors: errors,
            });
        }

        const mobilenoExistQuery = query(
            collection(db, "users"),
            where("mobileno", "==", mobileno)
        );
        const mobilenoSnapShot = await getDocs(mobilenoExistQuery);
        if (!mobilenoSnapShot.empty) {
            errors.push("User mobile no already exist");
            return res.status(422).json({
                success: false,
                message: "Data error. Some data already exist",
                errors: errors,
            });
        }

        try {
            await setDoc(doc(db, "users", email), {
                id: uuidv4(),
                avatar,
                firstname,
                lastname,
                email,
                mobileno,
                password: hashPassword(password),
                contacts: [],
            });

            const authToken = createJWT(email);
            return res.status(200).json({
                success: true,
                token: authToken,
                userData: {
                    id,
                    avatar,
                    email,
                    name: firstname + " " + lastname,
                },
                message: "Signup successfully. You will be login directly",
            });
        } catch (error) {
            return res.status(422).json({
                success: false,
                message: "Unable to signup user",
            });
        }
    }
};

exports.loginUser = async (req, res, next) => {
    // res.status(200).json({
    //     success: true,
    // });

    // return;
    const data = req.body;
    const { username, password } = data;

    const errors = [];
    const userQuery = query(
        collection(db, "users"),
        where("email", "==", username)
    );
    const userSnapShot = await getDocs(userQuery);
    if (userSnapShot.empty) {
        errors.push("Invalid username.");
        return res.status(422).json({
            success: false,
            message: "Authentication error. Please check your username",
            errors: errors,
        });
    }

    userSnapShot.forEach((doc) => {
        const {
            password: hashPassword,
            id,
            avatar,
            email,
            firstname,
            lastname,
        } = doc.data();

        console.log(password);
        console.log(hashPassword);
        if (verifyPassword(password, hashPassword)) {
            // console.log("invalid");
            const authToken = createJWT(username);
            return res.status(200).json({
                success: true,
                token: authToken,
                userData: {
                    id,
                    avatar,
                    email,
                    name: firstname + " " + lastname,
                },
            });
        } else {
            // console.log("invalid");
            errors.push("Invalid username or password.");
            return res.status(422).json({
                success: false,
                message:
                    "Authentication error. Please check your username or password",
                errors: errors,
            });
        }
    });
};
