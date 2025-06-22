import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  FaFolder, FaFile, FaUpload, FaSearch, FaFilter, FaSortAmountDown, 
  FaSortAmountUp, FaDownload, FaTrash, FaEye, FaEdit, FaShare, 
  FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint,
  FaFileVideo, FaFileAudio, FaFileArchive, FaFileCode, FaPlus,
  FaList, FaTh, FaCalendarAlt, FaUser, FaTag, FaTimes,
  FaStar, FaHeart, FaBookmark, FaCopy, FaCompress
} from 'react-icons/fa';

// Mock data for demonstration
const mockFiles = [
  {
    id: '1',
    name: 'Project Proposal.pdf',
    type: 'pdf',
    size: 2048576,
    createdAt: new Date('2024-01-15'),
    modifiedAt: new Date('2024-01-20'),
    owner: 'John Doe',
    tags: ['important', 'proposal'],
    starred: true,
    shared: false
  },
  {
    id: '2',
    name: 'Budget Spreadsheet.xlsx',
    type: 'excel',
    size: 1024000,
    createdAt: new Date('2024-01-10'),
    modifiedAt: new Date('2024-01-18'),
    owner: 'Jane Smith',
    tags: ['finance', 'budget'],
    starred: false,
    shared: true
  },
  {
    id: '3',
    name: 'Team Photo.jpg',
    type: 'image',
    size: 5242880,
    createdAt: new Date('2024-01-05'),
    modifiedAt: new Date('2024-01-05'),
    owner: 'Mike Johnson',
    tags: ['team', 'photo'],
    starred: false,
    shared: false
  },
  {
    id: '4',
    name: 'Presentation.pptx',
    type: 'powerpoint',
    size: 15728640,
    createdAt: new Date('2024-01-12'),
    modifiedAt: new Date('2024-01-22'),
    owner: 'Sarah Wilson',
    tags: ['presentation', 'client'],
    starred: true,
    shared: true
  },
  {
    id: '5',
    name: 'Meeting Recording.mp4',
    type: 'video',
    size: 104857600,
    createdAt: new Date('2024-01-08'),
    modifiedAt: new Date('2024-01-08'),
    owner: 'David Brown',
    tags: ['meeting', 'recording'],
    starred: false,
    shared: false
  }
];

const mockFolders = [
  {
    id: 'f1',
    name: 'Projects',
    itemCount: 12,
    createdAt: new Date('2024-01-01'),
    color: '#3B82F6'
  },
  {
    id: 'f2',
    name: 'Documents',
    itemCount: 8,
    createdAt: new Date('2024-01-02'),
    color: '#10B981'
  },
  {
    id: 'f3',
    name: 'Media',
    itemCount: 25,
    createdAt: new Date('2024-01-03'),
    color: '#F59E0B'
  }
];

const FileManager = () => {
  const { user, userData } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [sharingFile, setSharingFile] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    // Use mock data for now
    setFiles(mockFiles);
    setFolders(mockFolders);
    setLoading(false);
  }, []);

  const getFileIcon = (type) => {
    const iconMap = {
      pdf: FaFilePdf,
      word: FaFileWord,
      excel: FaFileExcel,
      powerpoint: FaFilePowerpoint,
      image: FaImage,
      video: FaFileVideo,
      audio: FaFileAudio,
      archive: FaFileArchive,
      code: FaFileCode,
      default: FaFile
    };
    return iconMap[type] || iconMap.default;
  };

  const getFileColor = (type) => {
    const colorMap = {
      pdf: 'text-red-500',
      word: 'text-blue-500',
      excel: 'text-green-500',
      powerpoint: 'text-orange-500',
      image: 'text-purple-500',
      video: 'text-pink-500',
      audio: 'text-indigo-500',
      archive: 'text-yellow-500',
      code: 'text-gray-500',
      default: 'text-gray-400'
    };
    return colorMap[type] || colorMap.default;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredAndSortedFiles = files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterType === 'all' || file.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'size') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (sortBy === 'createdAt' || sortBy === 'modifiedAt') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    
    try {
      const newFiles = uploadFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: getFileTypeFromName(file.name),
        size: file.size,
        createdAt: new Date(),
        modifiedAt: new Date(),
        owner: userData?.name || 'You',
        tags: [],
        starred: false,
        shared: false
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      setUploadFiles([]);
      setShowUpload(false);
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    }
  };

  const handleEdit = (file) => {
    setEditingFile(file);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingFile) return;
    
    setFiles(prev => prev.map(file => 
      file.id === editingFile.id 
        ? { ...editingFile, modifiedAt: new Date() }
        : file
    ));
    setShowEditModal(false);
    setEditingFile(null);
    alert('File updated successfully!');
  };

  const handleDelete = (fileIds) => {
    if (window.confirm(`Delete ${fileIds.length} file(s)?`)) {
      setFiles(prev => prev.filter(file => !fileIds.includes(file.id)));
      setSelectedItems([]);
      alert('Files deleted successfully!');
    }
  };

  const handleShare = (file) => {
    setSharingFile(file);
    setShowShareModal(true);
  };

  const handleSendShare = () => {
    if (!sharingFile || !shareEmail) return;
    
    // Update file as shared
    setFiles(prev => prev.map(file => 
      file.id === sharingFile.id 
        ? { ...file, shared: true }
        : file
    ));
    
    setShowShareModal(false);
    setSharingFile(null);
    setShareEmail('');
    setShareMessage('');
    alert(`File shared with ${shareEmail}!`);
  };

  const handleDownload = (file) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = file.name;
    link.click();
    alert(`Downloading ${file.name}...`);
  };

  const handleBulkDownload = () => {
    const selectedFiles = files.filter(file => selectedItems.includes(file.id));
    selectedFiles.forEach(file => handleDownload(file));
  };

  const handleToggleStar = (fileId) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, starred: !file.starred }
        : file
    ));
  };

  const getFileTypeFromName = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const typeMap = {
      pdf: 'pdf',
      doc: 'word', docx: 'word',
      xls: 'excel', xlsx: 'excel',
      ppt: 'powerpoint', pptx: 'powerpoint',
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image',
      mp4: 'video', avi: 'video', mov: 'video',
      mp3: 'audio', wav: 'audio',
      zip: 'archive', rar: 'archive',
      js: 'code', html: 'code', css: 'code', py: 'code'
    };
    return typeMap[ext] || 'default';
  };

  const FileCard = ({ file }) => {
    const FileIcon = getFileIcon(file.type);
    const isSelected = selectedItems.includes(file.id);
    
    return (
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 cursor-pointer ${
          isSelected ? 'border-primary bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
        }`}
        onClick={() => toggleItemSelection(file.id)}
      >
        <div className="p-4">
          {/* File Icon & Actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FileIcon className={`w-8 h-8 ${getFileColor(file.type)}`} />
              {file.starred && <FaStar className="w-4 h-4 text-yellow-500" />}
              {file.shared && <FaShare className="w-4 h-4 text-blue-500" />}
            </div>
            <div className="flex gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); handleToggleStar(file.id); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <FaStar className={`w-3 h-3 ${file.starred ? 'text-yellow-500' : 'text-gray-400'}`} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <FaDownload className="w-3 h-3 text-gray-500" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleEdit(file); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <FaEdit className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* File Name */}
          <h3 className="font-medium text-gray-900 dark:text-white mb-2 truncate" title={file.name}>
            {file.name}
          </h3>
          
          {/* File Info */}
          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Size:</span>
              <span>{formatFileSize(file.size)}</span>
            </div>
            <div className="flex justify-between">
              <span>Modified:</span>
              <span>{formatDate(file.modifiedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Owner:</span>
              <span className="truncate ml-2">{file.owner}</span>
            </div>
          </div>
          
          {/* Tags */}
          {file.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {file.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
              {file.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{file.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const FolderCard = ({ folder }) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700 cursor-pointer"
      onClick={() => setCurrentFolder(folder.id)}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <FaFolder className="w-8 h-8" style={{ color: folder.color }} />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">{folder.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{folder.itemCount} items</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Created: {formatDate(folder.createdAt)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <FaFolder className="text-white" />
            </div>
            Smart Files
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Intelligent file management with AI-powered organization
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowUpload(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
          >
            <FaUpload />
            Upload Files
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files and folders..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Files</option>
          <option value="pdf">PDF</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="excel">Spreadsheets</option>
          <option value="word">Documents</option>
        </select>

        {/* Sort */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { key: 'name', label: 'Name', icon: FaSortAmountDown },
            { key: 'size', label: 'Size', icon: FaCompress },
            { key: 'modifiedAt', label: 'Date', icon: FaCalendarAlt }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                sortBy === key
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
              {sortBy === key && (
                sortOrder === 'asc' ? <FaSortAmountUp className="w-3 h-3" /> : <FaSortAmountDown className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>

        {/* View Mode */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { mode: 'grid', icon: FaTh },
            { mode: 'list', icon: FaList }
          ].map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-2 rounded-md transition-colors ${
                viewMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Selected Items Actions */}
      {selectedItems.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handleBulkDownload}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <FaDownload className="w-3 h-3" />
                Download
              </button>
              <button 
                onClick={() => {
                  const firstFile = files.find(f => selectedItems.includes(f.id));
                  if (firstFile) handleShare(firstFile);
                }}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-1"
              >
                <FaShare className="w-3 h-3" />
                Share
              </button>
              <button 
                onClick={() => handleDelete(selectedItems)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <FaTrash className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folders */}
            {folders.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaFolder className="text-blue-500" />
                  Folders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {folders.map(folder => (
                    <FolderCard key={folder.id} folder={folder} />
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaFile className="text-gray-500" />
                Files ({filteredAndSortedFiles.length})
              </h2>
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredAndSortedFiles.map(file => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Modified
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Owner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAndSortedFiles.map(file => {
                          const FileIcon = getFileIcon(file.type);
                          const isSelected = selectedItems.includes(file.id);
                          
                          return (
                            <tr 
                              key={file.id} 
                              className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                              onClick={() => toggleItemSelection(file.id)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <FileIcon className={`w-5 h-5 mr-3 ${getFileColor(file.type)}`} />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {file.name}
                                    </div>
                                    <div className="flex gap-1 mt-1">
                                      {file.starred && <FaStar className="w-3 h-3 text-yellow-500" />}
                                      {file.shared && <FaShare className="w-3 h-3 text-blue-500" />}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatFileSize(file.size)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(file.modifiedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {file.owner}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <FaDownload className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleShare(file); }}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <FaShare className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleEdit(file); }}
                                    className="text-yellow-600 hover:text-yellow-900"
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete([file.id]); }}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <FaTrash className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaUpload className="text-blue-500" />
                Upload Files
              </h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">Drag & drop files here or click to browse</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  Choose Files
                </label>
              </div>
              
              {uploadFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Selected Files:</h3>
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowUpload(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploadFiles.length === 0}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload {uploadFiles.length} file(s)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaEdit className="text-yellow-500" />
                Edit File
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={editingFile.name}
                  onChange={(e) => setEditingFile({...editingFile, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editingFile.tags?.join(', ') || ''}
                  onChange={(e) => setEditingFile({...editingFile, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="important, work, project"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="starred"
                  checked={editingFile.starred}
                  onChange={(e) => setEditingFile({...editingFile, starred: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="starred" className="text-sm text-gray-700 dark:text-gray-300">
                  Mark as starred
                </label>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && sharingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaShare className="text-green-500" />
                Share File
              </h2>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">{sharingFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(sharingFile.size)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Share with (Email)
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Optional message..."
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendShare}
                  disabled={!shareEmail}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;