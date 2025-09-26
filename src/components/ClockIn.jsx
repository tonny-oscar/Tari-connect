// src/components/ClockIn.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../services/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ClockIn = () => {
  const [user, setUser] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentLogId, setCurrentLogId] = useState(null);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await checkClockInStatus(currentUser.uid);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Check if user is currently clocked in
  const checkClockInStatus = async (uid) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const q = query(
        collection(db, "attendance"),
        where("userId", "==", uid),
        where("date", "==", today),
        orderBy("clockIn", "desc")
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const lastLog = snapshot.docs[0];
        if (!lastLog.data().clockOut) {
          setIsClockedIn(true);
          setCurrentLogId(lastLog.id);
        }
      }
    } catch (error) {
      console.error("Error checking clock-in status:", error);
    }
  };

  // Handle clock in
  const handleClockIn = async () => {
    if (!user) return alert("You must be logged in to clock in");

    try {
      const today = new Date().toISOString().split("T")[0];
      const docRef = await addDoc(collection(db, "attendance"), {
        userId: user.uid,
        date: today,
        clockIn: serverTimestamp(),
        clockOut: null,
      });
      setIsClockedIn(true);
      setCurrentLogId(docRef.id);
    } catch (error) {
      console.error("Error clocking in:", error);
    }
  };

  // Handle clock out
  const handleClockOut = async () => {
    if (!currentLogId) return;

    try {
      const logRef = doc(db, "attendance", currentLogId);
      await updateDoc(logRef, {
        clockOut: serverTimestamp(),
      });
      setIsClockedIn(false);
      setCurrentLogId(null);
    } catch (error) {
      console.error("Error clocking out:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-md mx-auto shadow-lg rounded bg-white">
      <h2 className="text-xl font-bold mb-4">Attendance</h2>
      {isClockedIn ? (
        <button
          onClick={handleClockOut}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clock Out
        </button>
      ) : (
        <button
          onClick={handleClockIn}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Clock In
        </button>
      )}
    </div>
  );
};

export default ClockIn;
