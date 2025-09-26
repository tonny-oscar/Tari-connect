import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";

const AdminAttendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterUser, setFilterUser] = useState("");

  // Fetch all logs
  const fetchLogs = async () => {
    setLoading(true);
    const q = query(collection(db, "attendance"), orderBy("clockIn", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Calculate hours worked
  const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return "-";
    const inTime = clockIn.toDate();
    const outTime = clockOut.toDate();
    const diff = (outTime - inTime) / (1000 * 60 * 60);
    return diff.toFixed(2);
  };

  // Delete log
  const handleDelete = async (id) => {
    if (window.confirm("Delete this log?")) {
      await deleteDoc(doc(db, "attendance", id));
      fetchLogs();
    }
  };

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    const matchDate = filterDate ? log.date === filterDate : true;
    const matchUser = filterUser
      ? log.userName?.toLowerCase().includes(filterUser.toLowerCase())
      : true;
    return matchDate && matchUser;
  });

  if (loading) return <p>Loading attendance logs...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Attendance Dashboard</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="text"
          placeholder="Filter by user name"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={fetchLogs}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Clock In</th>
            <th className="border px-2 py-1">Clock Out</th>
            <th className="border px-2 py-1">Hours</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td className="border px-2 py-1">{log.userName}</td>
              <td className="border px-2 py-1">{log.date}</td>
              <td className="border px-2 py-1">
                {log.clockIn?.toDate().toLocaleTimeString()}
              </td>
              <td className="border px-2 py-1">
                {log.clockOut ? log.clockOut.toDate().toLocaleTimeString() : "-"}
              </td>
              <td className="border px-2 py-1">
                {calculateHours(log.clockIn, log.clockOut)}
              </td>
              <td className="border px-2 py-1">
                <button
                  onClick={() => handleDelete(log.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filteredLogs.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center p-2">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAttendance;
