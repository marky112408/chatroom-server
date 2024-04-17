const {
    collection,
    getDocs,
    query,
    where,
    doc,
    setDoc,
    limit,
} = require("firebase/firestore");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../firebaseConfig");
const chatRef = collection(db, "chats");
const userRef = collection(db, "users");

exports.getChats = async (req, res, next) => {
    const data = req.body;
    const userEmail = data.userEmail;
    const receiverID = data.receiverID;
    const senderName = data.senderName;

    const receiverData = [];
    const receiverQuery = query(userRef, where("id", "==", receiverID));

    const receiverSnapShot = await getDocs(receiverQuery);
    receiverSnapShot.forEach((doc) => {
        receiverData.push(doc.data());
    });

    const chatQuery = query(chatRef);
    // let chatQuery = query(chatRef, where("users", "array-contains", userEmail));

    // chatQuery = query(
    //     chatRef,
    //     where("users", "array-contains", receiverData[0].email)
    // );
    const chatSnapShot = await getDocs(chatQuery);

    if (chatSnapShot.empty) {
        res.status(200).json({
            success: false,
            message: "No conversation found",
            roomID: uuidv4(),
            chats: null,
            senderName: "New Message",
            receiverEmail: receiverData[0].email,
            receiverName:
                receiverData[0].firstname + " " + receiverData[0].lastname,
        });
    } else {
        const convo = [];
        const requiredElement = [userEmail, receiverData[0].email];
        chatSnapShot.forEach((doc) => {
            const data = doc.data();
            const arrayField = data.users;
            const containElement = requiredElement.every((element) =>
                arrayField.includes(element)
            );
            if (containElement) {
                convo.push(data);
            }
        });
        // const chats = [];
        // chatSnapShot.forEach((doc) => {
        //     chats.push(doc.data());
        // });

        if (convo.length === 0) {
            res.status(200).json({
                success: false,
                message: "No Conversation found",
                chats: null,
                roomID: uuidv4(),
                senderName: "New Message",
                receiverID: receiverData[0].id,
                receiverEmail: receiverData[0].email,
                receiverName:
                    receiverData[0].firstname + " " + receiverData[0].lastname,
            });
        } else {
            res.status(200).json({
                success: true,
                message: "Conversation found",
                chats: convo[0],
                roomID: convo[0].id,
                senderName: convo[0].senderName,
                receiverID: receiverData[0].id,
                receiverEmail: receiverData[0].email,
                receiverName:
                    receiverData[0].firstname + " " + receiverData[0].lastname,
            });
        }
    }
};

exports.getInboxes = async (req, res, next) => {
    const data = req.body;
    const userEmail = data.userEmail;

    const inboxes = [];
    const inboxQuery = query(
        chatRef,
        where("users", "array-contains", userEmail)
    );
    const inboxSnapShot = await getDocs(inboxQuery);

    if (inboxSnapShot.empty) {
        res.status(200).json({
            success: false,
            message: "Empty inbox",
            inboxes: inboxes,
        });
    } else {
        inboxSnapShot.forEach((doc) => {
            inboxes.push(doc.data());
        });

        res.status(200).json({
            success: true,
            message: "Inbox found",
            inboxes: inboxes,
        });
    }
};
