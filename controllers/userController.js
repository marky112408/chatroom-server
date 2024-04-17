const {
    collection,
    getDocs,
    query,
    where,
    doc,
    setDoc,
    limit,
} = require("firebase/firestore");
const { db } = require("../firebaseConfig");
const usersRef = collection(db, "users");

exports.getUsers = async (req, res, next) => {
    try {
        const data = req.body;
        const userQuery = query(
            usersRef,
            where("email", "!=", data.email),
            limit(4)
        );
        const userSnapShot = await getDocs(userQuery);

        const newDiscoveries = [];
        userSnapShot.forEach((doc) => {
            newDiscoveries.push(doc.data());
        });

        res.status(200).json({
            success: true,
            users: newDiscoveries,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong. Unable to fetch users",
        });
    }

    // next()
};

exports.searchUsers = async (req, res, next) => {
    try {
        const data = req.body;
        const searchQuery = query(usersRef, where("email", "==", data.search));
        const searchQuery2 = query(
            usersRef,
            where("mobileno", "==", data.search)
        );

        const searchSnapShot = await getDocs(searchQuery);
        const searchSnapShot2 = await getDocs(searchQuery2);

        const searchResult = [];

        searchSnapShot.forEach((doc) => {
            searchResult.push(doc.data());
        });

        if (searchResult.length === 0) {
            searchSnapShot2.forEach((doc) => {
                searchResult.push(doc.data());
            });
        }

        if (searchQuery.length === 0) {
            res.status(200).json({
                success: false,
                message: "Empty result",
                searchResult: searchResult,
            });
            return;
        }

        res.status(200).json({
            success: true,
            searchResult: searchResult,
            message: "Found Result!",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong. Unable to fetch users",
        });
    }
};
