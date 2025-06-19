import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { FaFolder, FaFile, FaUpload, FaFolderPlus, FaSearch, FaDownload, FaTrash } from 'react-icons/fa';

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Fetch folders
    const foldersQuery = query(
      collection(db, 'folders'),
      where('parentFolder', '==', currentFolder),
      orderBy('name')
    );
    
    const foldersUnsubscribe = onSnapshot(foldersQuery, (snapshot) => {
      const foldersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'folder'
      }));
      setFolders(foldersList);
    });
    
    // Fetch files
    const filesQuery = query(
      collection(db, 'files'),
      where('folder', '==', currentFolder),
      orderBy('name')
    );
    
    const filesUnsubscribe = onSnapshot(filesQuery, (snapshot) => {
      const filesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'file'
      }));
      setFiles(filesList);
      setLoading(false);
    });
    
    return () => {
      foldersUnsubscribe();
      filesUnsubscribe();
    };
  }, [currentFolder]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const storageRef = ref(storage, `files/${currentFolder}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload error:', error);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Add file to Firestore
        await addDoc(collection(db, 'files'), {
          name: file.name,
          size: file.size,
          type: file.type,
          folder: currentFolder,
          url: downloadURL,
          createdAt: serverTimestamp(),
          createdBy: user?.uid,
          createdByName: user?.displayName || user?.email
        });
        
        setIsUploading(false);
        setUploadProgress(0);
      }
    );
  };

  const allItems = [...folders, ...files];
  
  const filteredItems = allItems.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">File Manager</h1>
          <p className="text-gray-600">Organize and share your files</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-700 transition-colors">
            <FaFolderPlus /> New Folder
          </button>
          <label className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer">
            <FaUpload /> Upload File
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>
      
      {/* Breadcrumbs and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center text-sm text-gray-600 flex-1">
          <button 
            onClick={() => setCurrentFolder('root')}
            className={`hover:text-blue-600 ${currentFolder === 'root' ? 'font-medium text-blue-600' : ''}`}
          >
            Home
          </button>
          {currentFolder !== 'root' && (
            <>
              <span className="mx-2">/</span>
              <span className="font-medium text-blue-600">Current Folder</span>
            </>
          )}
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search files..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Upload progress */}
      {isUploading && (
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-1">Uploading... {Math.round(uploadProgress)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Files and folders */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading files...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.type === 'folder' ? (
                          <FaFolder className="text-yellow-500 mr-3" />
                        ) : (
                          <FaFile className="text-blue-500 mr-3" />
                        )}
                        <div className="font-medium text-gray-900 cursor-pointer" onClick={() => {
                          if (item.type === 'folder') {
                            setCurrentFolder(item.id);
                          }
                        }}>
                          {item.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.type === 'folder' ? '--' : formatFileSize(item.size || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.type === 'folder' ? 'Folder' : (item.type || 'File')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.createdAt ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {item.type === 'file' && (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                            title="Download"
                          >
                            <FaDownload />
                          </a>
                        )}
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaFolder className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No files found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? 'Try adjusting your search term' : 'Upload your first file to get started'}
            </p>
            <label className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors cursor-pointer inline-flex">
              <FaUpload /> Upload File
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;