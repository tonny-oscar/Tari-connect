import React, { useState, useEffect } from "react";
import { useAuth } from "../../store/useAuth";
import { db } from "../../services/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  FaFolder, FaFile, FaUpload, FaSearch,
  FaTrash, FaEdit, FaWhatsapp,
  FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint,
  FaImage, FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode,
} from "react-icons/fa";

// Helpers
const getFileIcon = (type) => ({
  pdf: FaFilePdf, word: FaFileWord, excel: FaFileExcel, powerpoint: FaFilePowerpoint,
  image: FaImage, video: FaFileVideo, audio: FaFileAudio, archive: FaFileArchive,
  code: FaFileCode, default: FaFile,
}[type] || FaFile);

const getFileColor = (type) => ({
  pdf: "text-red-500", word: "text-blue-500", excel: "text-green-500",
  powerpoint: "text-orange-500", image: "text-purple-500", video: "text-pink-500",
  audio: "text-indigo-500", archive: "text-yellow-500", code: "text-gray-500",
  default: "text-gray-400",
}[type] || "text-gray-400");

const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const formatDate = (date) =>
  new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

const getFileTypeFromName = (name) => {
  const ext = name.split(".").pop().toLowerCase();
  const map = {
    pdf: "pdf", doc: "word", docx: "word", xls: "excel", xlsx: "excel",
    ppt: "powerpoint", pptx: "powerpoint", jpg: "image", jpeg: "image",
    png: "image", gif: "image", mp4: "video", avi: "video", mov: "video",
    mp3: "audio", wav: "audio", zip: "archive", rar: "archive", js: "code",
    html: "code", css: "code", py: "code",
  };
  return map[ext] || "default";
};

const FileManager = () => {
  const { user, userData } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFile, setEditingFile] = useState(null);

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);

  // 🔹 Listen to Firestore collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "files"), (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFiles(docs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔹 Upload (just Firestore metadata for now, with preview URL)
  const handleUpload = async () => {
    if (!uploadFiles.length) return;

    for (let file of uploadFiles) {
      const url = URL.createObjectURL(file); // 🔹 Temp preview URL

      await addDoc(collection(db, "files"), {
        name: file.name,
        type: getFileTypeFromName(file.name),
        size: file.size,
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
        owner: userData?.name || user?.email || "Unknown",
        url,
        tags: [],
        starred: false,
        shared: false,
      });
    }

    setUploadFiles([]);
    setShowUpload(false);
  };

  // 🔹 Edit
  const handleSaveEdit = async () => {
    if (!editingFile) return;
    const ref = doc(db, "files", editingFile.id);
    await updateDoc(ref, {
      name: editingFile.name,
      modifiedAt: serverTimestamp(),
    });
    setShowEditModal(false);
    setEditingFile(null);
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "files", id));
  };

  // 🔹 Share via WhatsApp
  const shareViaWhatsApp = (file) => {
    const text = encodeURIComponent(`Check out this file: ${file.name}\n${file.url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // 🔹 Open Image Viewer
  const openImageViewer = (file) => {
    setViewingFile(file);
    setShowImageViewer(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaFolder className="text-blue-500" /> Smart Files
        </h1>
        <button
          onClick={() => setShowUpload(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
        >
          <FaUpload /> Upload
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-2 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-10 pr-4 py-2 border rounded-md w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Files */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : files.length === 0 ? (
          <div className="text-center text-gray-500">No files uploaded yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files
              .filter((file) =>
                file.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((file) => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="p-4 bg-white rounded-lg shadow hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <FileIcon className={`w-6 h-6 ${getFileColor(file.type)}`} />
                      <div className="flex gap-2">
                        {/* Edit */}
                        <button onClick={() => setEditingFile(file) || setShowEditModal(true)}>
                          <FaEdit />
                        </button>

                        {/* View (only for images) */}
                        {file.type === "image" && (
                          <button onClick={() => openImageViewer(file)}>👁️</button>
                        )}

                        {/* Share via WhatsApp */}
                        <button onClick={() => shareViaWhatsApp(file)}>
                          <FaWhatsapp className="text-green-500" />
                        </button>

                        {/* Delete */}
                        <button onClick={() => handleDelete(file.id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <h3 className="mt-2 font-semibold">{file.name}</h3>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-gray-400">
                      {file.createdAt ? formatDate(file.createdAt) : "—"}
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="font-bold text-lg mb-4">Upload Files</h2>
            <input
              type="file"
              multiple
              onChange={(e) => setUploadFiles(Array.from(e.target.files))}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowUpload(false)}>Cancel</button>
              <button
                onClick={handleUpload}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="font-bold text-lg mb-4">Edit File</h2>
            <input
              type="text"
              value={editingFile.name}
              onChange={(e) =>
                setEditingFile({ ...editingFile, name: e.target.value })
              }
              className="border px-3 py-2 w-full rounded-md"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button
                onClick={handleSaveEdit}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && viewingFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-3xl">
            <h2 className="text-lg font-bold mb-2">{viewingFile.name}</h2>
            <img
              src={viewingFile.url}
              alt={viewingFile.name}
              className="max-h-[80vh] mx-auto"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowImageViewer(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;
