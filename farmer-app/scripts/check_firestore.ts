
import { db } from '../lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

async function checkData() {
    console.log("Checking Firestore connection...");
    try {
        const fieldsRef = collection(db, 'fields');
        const q = query(fieldsRef, limit(5));
        const snapshot = await getDocs(q);

        console.log(`Found ${snapshot.size} documents in 'fields' collection.`);
        snapshot.forEach(doc => {
            console.log(doc.id, doc.data());
        });

        if (snapshot.empty) {
            console.log("Collection is empty. This might be why data is not showing.");
        }

    } catch (error) {
        console.error("Error connecting to Firestore:", error);
    }
}

checkData();
