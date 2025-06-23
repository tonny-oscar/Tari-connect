import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
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
  const [uploadFiles, setUploadFiles] = useState([]);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
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
        className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border-2 cursor-pointer overflow-hidden backdrop-blur-sm ${
          isSelected ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-blue-200' : 'border-gray-200 hover:border-blue-300'
        }`}
        onClick={() => toggleItemSelection(file.id)}
      >
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileIcon className={`w-8 h-8 ${getFileColor(file.type)}`} />
              {file.starred && <FaStar className="w-4 h-4 text-yellow-500" />}
              {file.shared && <FaShare className="w-4 h-4 text-blue-500" />}
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStar(file.id);
                }}
                className="p-2 hover:bg-yellow-100 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <FaStar className={`w-3 h-3 ${file.starred ? 'text-yellow-500' : 'text-gray-400'}`} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file);
                }}
                className="p-2 hover:bg-green-100 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <FaDownload className="w-3 h-3 text-gray-500" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(file);
                }}
                className="p-2 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <FaEdit className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-3 truncate text-lg group-hover:text-blue-600 transition-colors duration-300" title={file.name}>
            {file.name}
          </h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between items-center py-1">
              <span className="font-medium">Size:</span>
              <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">{formatFileSize(file.size)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium">Modified:</span>
              <span className="text-xs">{formatDate(file.modifiedAt)}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium">Owner:</span>
              <span className="truncate ml-2 text-xs">{file.owner}</span>
            </div>
          </div>
          
          {file.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {file.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
              {file.tags.length > 2 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">+{file.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const FolderCard = ({ folder }) => (
    <div 
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border border-gray-200 hover:border-blue-300 cursor-pointer overflow-hidden backdrop-blur-sm"
      onClick={() => setCurrentFolder(folder)}
    >
      <div className="relative p-6">
        <div className="relative flex items-center gap-4 mb-4">
          <div className="relative">
            <FaFolder className="w-10 h-10 drop-shadow-lg" style={{ color: folder.color }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{folder.name}</h3>
            <p className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full inline-block">{folder.itemCount} items</p>
          </div>
        </div>
        <div className="relative text-sm text-gray-600 mt-2">
          <span className="font-medium">Created: {formatDate(folder.createdAt)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <FaFolder className="text-white" />
            </div>
            Smart Files
          </h1>
          <p className="text-gray-600 mt-1">
            Intelligent file management with AI-powered organization
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowUpload(true)}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 shadow-2xl hover:shadow-3xl font-semibold text-lg backdrop-blur-sm"
          >
            <FaUpload className="animate-pulse" />
            ✨ Upload Files
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files and folders..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        >
          <option value="all">All Files</option>
          <option value="pdf">PDF</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="excel">Spreadsheets</option>
          <option value="word">Documents</option>
        </select>

        <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1 shadow-inner">
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
                  : 'text-gray-600 hover:text-gray-900'
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

        <div className="flex bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1 shadow-inner">
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
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Selected Items Actions */}
      {selectedItems.length > 0 && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl border-2 border-blue-200 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-semibold text-lg">
              ✨ {selectedItems.length} item(s) selected
            </span>
            <div className="flex gap-3">
              <button 
                onClick={handleBulkDownload}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaDownload className="w-4 h-4" />
                Download
              </button>
              <button 
                onClick={() => {
                  const firstFile = files.find(f => selectedItems.includes(f.id));
                  if (firstFile) handleShare(firstFile);
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaShare className="w-4 h-4" />
                Share
              </button>
              <button 
                onClick={() => handleDelete(selectedItems)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaTrash className="w-4 h-4" />
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Modified
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Owner
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAndSortedFiles.map(file => {
                          const FileIcon = getFileIcon(file.type);
                          const isSelected = selectedItems.includes(file.id);
                          
                          return (
                            <tr 
                              key={file.id} 
                              className={`hover:bg-gray-50 cursor-pointer ${
                                isSelected ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => toggleItemSelection(file.id)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <FileIcon className={`w-5 h-5 mr-3 ${getFileColor(file.type)}`} />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {file.name}
                                    </div>
                                    <div className="flex gap-1 mt-1">
                                      {file.starred && <FaStar className="w-3 h-3 text-yellow-500" />}
                                      {file.shared && <FaShare className="w-3 h-3 text-blue-500" />}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatFileSize(file.size)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(file.modifiedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {file.owner}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(file);
                                    }}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <FaDownload className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShare(file);
                                    }}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <FaShare className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(file);
                                    }}
                                    className="text-yellow-600 hover:text-yellow-900"
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete([file.id]);
                                    }}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaUpload className="text-blue-500" />
                Upload Files
              </h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-3 border-dashed border-blue-300 rounded-2xl p-12 text-center bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                <FaUpload className="mx-auto text-6xl text-blue-500 animate-bounce mb-6" />
                <p className="text-gray-700 mb-6 text-lg font-medium">Drag & drop files here or click to browse</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl cursor-pointer hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                >
                  📁 Choose Files
                </label>
              </div>
              
              {uploadFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Selected Files:</h3>
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowUpload(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaEdit className="text-yellow-500" />
                Edit File
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={editingFile.name}
                  onChange={(e) => setEditingFile({...editingFile, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editingFile.tags?.join(', ') || ''}
                  onChange={(e) => setEditingFile({...editingFile, tags: e.target.value.split(',').map(tag => tag.trim())})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
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
                <label htmlFor="starred" className="text-sm font-medium text-gray-700">
                  Mark as starred
                </label>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaShare className="text-green-500" />
                Share File
              </h2>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{sharingFile.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(sharingFile.size)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share with (Email)
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  rows="3"
                  placeholder="Optional message..."
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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