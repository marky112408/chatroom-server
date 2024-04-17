const bodyParser = require("body-parser");
const express = require("express");
const { Server } = require("socket.io");
const {
    collection,
    getDocs,
    query,
    where,
    doc,
    setDoc,
    runTransaction,
    getDoc,
    serverTimestamp,
    Timestamp,
    updateDoc,
} = require("firebase/firestore");
const { v4: uuidv4 } = require("uuid");
const { db } = require("./firebaseConfig");

const port = process.env.PORT || 8080;
const app = express();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");

const { getCurrentDate, getCurrentTime } = require("./util/util");

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader(
        "Access-Control-Allow-Method",
        "GET,POST,PATCH,DELETE,OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    next();
});

app.use(authRoutes);
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);
app.get("*", function (req, res) {
    res.send("working");
});
const httpServer = app.listen(port, () => {
    console.log("Connecting to port " + port);
});

// ::: SOCKET :::

const io = new Server(httpServer, {
    cors: {
        origin: ["https://chatapp-35ad1.web.app", "http://localhost:8080"],
    },
});
const chatIO = io.of("/chat");
chatIO.on("connection", (socket) => {
    socket.on("send-message", async (messageData, room) => {
        // socket.join(room);
        const chatDocRef = doc(db, "chats", room);
        messageData.date = getCurrentDate();
        messageData.time = getCurrentTime();
        messageData.received = false;
        messageData.timestamp = serverTimestamp();

        try {
            const chatDocSnap = await getDoc(chatDocRef);
            if (chatDocSnap.exists()) {
                const prevMessages = chatDocSnap.data().messages;
                const prevMsgArr = JSON.parse(prevMessages);
                prevMsgArr.push(messageData);

                await updateDoc(chatDocRef, {
                    messages: JSON.stringify(prevMsgArr),
                });
            } else {
                const newMessage = JSON.stringify([messageData]);
                const userRef = doc(db, "users", messageData.to);
                const userSnapShot = await getDoc(userRef);
                const {
                    avatar,
                    firstname,
                    lastname,
                    id: receiverID,
                } = userSnapShot.data();
                await setDoc(chatDocRef, {
                    id: room,
                    users: [messageData.from, messageData.to],
                    messages: newMessage,
                    timestamp: serverTimestamp(),
                    senderName: messageData.name,
                    senderAvatar: messageData.avatar,
                    senderID: messageData.senderID,
                    receiverName: firstname + " " + lastname,
                    receiverAvatar: avatar,
                    receiverID: receiverID,
                });
            }
        } catch (error) {
            console.log(error);
        }
        socket.to(room).emit("receive-message", messageData);
    });

    socket.on("join-room", (room) => {
        // console.log("you are connected to room", room);
        socket.join(room);
    });
});

// exports.httpServer = httpServer;
