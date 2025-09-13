import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Newdocument.css";
import AddCardForm from "../Dashbord/AddCardForm";
import { FaUser ,FaSignOutAlt} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
function Newdocument() {
  const [fileTree, setFileTree] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedFile, setDraggedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [renamingItem, setRenamingItem] = useState({
    isRenaming: false,
    type: null,
    oldName: null
  });
  const [newName, setNewName] = useState("");
  const [activeComponent, setActiveComponent] = useState("upload");
  const [username, setUsername] = useState(""); // Add username state
  const [groupId, setGroupId] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

useEffect(() => {
  fetchFiles();

 axios.get(`http://${API_URL}/backend/session_info.php`, {
  withCredentials: true,
})
.then(response => {
  if (response.data.authenticated) {
    setUsername(response.data.username);
    setGroupId(response.data.group_id); // ← ajout
    console.log("Username from session:", response.data.username, "the group is", response.data.group_id);
  } else {
    console.warn("User not authenticated.");
  }
})

}, []);


  const fetchFiles = async () => {
    try {
      const res = await axios.get(`http://${API_URL}/backend/Back/list_files.php`);
      setFileTree(res.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      alert("Failed to load files. Please check the server connection.");
    }
  };

  const navigateTo = (folderName) => {
    setCurrentPath((prevPath) => [...prevPath, folderName]);
  };

  const navigateBack = () => {
    setCurrentPath((prevPath) => prevPath.slice(0, -1));
  };

  const getCurrentFolder = () => {
    let folder = { children: fileTree || [] };
    for (const part of currentPath) {
      const found = folder.children?.find(
        (item) => item.type === "folder" && item.name === part
      );
      if (!found) return null;
      folder = found;
    }
    return folder;
  };

  // Drag & Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    handleDrag(e);
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    handleDrag(e);
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    handleDrag(e);
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setDraggedFile(files[0]);
    }
  };

  // Upload functions
  const uploadFile = async (selectedFile) => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("path", currentPath.join("/"));

    try {
      const response = await axios.post(`http://${API_URL}/backend/Back/upload.php`, formData, {
		 
        headers: {
          "Content-Type": "multipart/form-data",
		 
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      if (response.data.status === "success") {
  alert("File uploaded successfully!");
  setDraggedFile(null);
  setUploadProgress(0);
  fetchFiles();
  // Ne PAS faire fileInputRef.current.value = ""; ici
} else {
        alert(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.response?.data?.message || error.message}`);
      setUploadProgress(0);
    }
  };

  const deleteItem = async (name, type) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const path = [...currentPath, name].join("/");

      const res = await axios.post(
        `http://${API_URL}/backend/Back/delete_file_folder.php`,
        { path, type },
        {
			
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.status === "success") {
        fetchFiles();
        alert(res.data.message);
      } else {
        alert(res.data.message || "Deletion failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Delete failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const renameItem = async (oldName, type) => {
    if (!newName.trim()) {
      alert("Please enter a valid name");
      return;
    }

    try {
      const oldPath = [...currentPath, oldName].join("/");
      const newPath = [...currentPath, newName.trim()].join("/");

      const res = await axios.post(
        `http://${API_URL}/backend/Back/rename.php`,
        { oldPath, newPath, type },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (res.data.status === "success") {
        fetchFiles();
        setRenamingItem({ isRenaming: false, type: null, oldName: null });
        setNewName("");
      } else {
        alert(res.data.message || "Renaming failed");
      }
    } catch (error) {
      console.error("Renaming error:", error);
      alert(`Renaming failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Please enter a valid folder name.");
      return;
    }

    try {
      const folderPath = [...currentPath, newFolderName].join("/");
      const res = await axios.post(
        `http://${API_URL}/backend/Back/create_folder.php`,
        { folderPath },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      
      if (res.data.status === "success") {
        setNewFolderName("");
        fetchFiles();
      } else {
        alert(res.data.message || "Folder creation failed");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      alert(`Folder creation failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const UploadModal = ({ onClose }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Upload File</h3>
        <div 
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {draggedFile ? (
            <div className="file-preview">
              📄 {draggedFile.name}
            </div>
          ) : (
            <>
              <p>Drag & Drop your file here</p>
              <p>OR</p>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="browse-btn"
              >
                Browse File
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files[0]) setDraggedFile(e.target.files[0]);
                }}
                style={{ display: "none" }}
              />
            </>
          )}
        </div>

        <div className="modal-actions">
          <button 
  onClick={() => {
    if (draggedFile) {
      uploadFile(draggedFile);
      onClose();
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 100);
    }
  }}
  className="confirm-btn"
>
  Import
</button>

        </div>
      </div>
    </div>
  );

  const renderBreadcrumbs = () => {
    return (
      <div className="breadcrumbs">
        <button 
          className="breadcrumb-root" 
          onClick={() => setCurrentPath([])}
        >
          Root
        </button>
        {currentPath.map((folder, index) => (
          <React.Fragment key={index}>
            <span className="breadcrumb-separator">/</span>
            <button
              className="breadcrumb-item"
              onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
            >
              {folder}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderFileTable = (items) => {
    const sortedItems = [...items].sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === "folder" ? -1 : 1;
    });
    
    return (
      <table className="file-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item, index) => (
            <tr key={`${item.type}-${index}`} className={`${item.type}-row`}>
              <td>
                {renamingItem.isRenaming && renamingItem.oldName === item.name ? (
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                    className="rename-input"
                  />
                ) : (
                  <>
                    <span className="icon">{item.type === "folder" ? "📁" : "📄"}</span>
                    {item.type === "folder" ? (
                      <button 
                        className="folder-name-btn"
                        onClick={() => navigateTo(item.name)}
                      >
                        {item.name}
                      </button>
                    ) : (
                      item.name
                    )}
                  </>
                )}
              </td>
              <td>{item.type === "folder" ? "Folder" : "File"}</td>
              <td>
                <div className="file-actions">
                  {!renamingItem.isRenaming && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingItem({
                            isRenaming: true,
                            type: item.type,
                            oldName: item.name
                          });
                          setNewName(item.name);
                        }}
                        className="action-btn small rename-btn"
                      >
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(item.name, item.type);
                        }}
                        className="action-btn small delete-btn"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {renamingItem.isRenaming && renamingItem.oldName === item.name && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          renameItem(item.name, item.type);
                        }}
                        className="action-btn small confirm-btn"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenamingItem({ isRenaming: false });
                        }}
                        className="action-btn small cancel-btn"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {item.type === "file" && (
                    <>
                      <a
                        href={`http://localhost/backend/Back/uploads/${[...currentPath, item.name].join("/")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn small"
                      >
                        View
                      </a>
                      <a
                        href={`http://localhost/backend/Back/uploads/${[...currentPath, item.name].join("/")}`}
                        download
                        className="action-btn small"
                      >
                        Download
                      </a>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
// inforamtion compte userAgent
 const UserInfoSection = ({ onLogout }) => (
    <div className="user-info-section">
      <div className="user-icon">
        <FaUser />
      </div>
      <div className="user-details">
        <span className="username">{username}</span>
       <span className="username">Group: {groupId}</span>
		<button onClick={handleLogout} className="logout-btn"><FaSignOutAlt/></button>

      </div>
    </div>
	
  );

 const handleLogout = async () => {
    try {
       fetch(`http://${API_URL}/backend/logout.php`, {
  method: "POST",
  credentials: "include"
})
.then(res => res.json())
.then(data => {
  if (!data.authenticated) {
    navigate('/Login');
    // Rediriger vers la page de login ou afficher un message
  }
});

    } catch (error) {
      console.error("Logout error:", error);
      // Still clear storage and redirect even if server logout fails
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "/login";
    }
  };




  const renderComponent = () => {
    switch (activeComponent) {
      case "upload":
        const folder = getCurrentFolder();
        const currentItems = folder?.children || [];
        
        return (
          <div className="app-container">
            <h1 className="main-title">Upload et Création des fichiers</h1>
            
            <div className="top-bar">
              <button
                className="upload-modal-btn"
                onClick={() => setIsModalOpen(true)}
              >
                ⬆ Upload Files
              </button>
              
              {isModalOpen && <UploadModal onClose={() => setIsModalOpen(false)} />}

              <input
                type="text"
                placeholder="New folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="folder-input"
              />
              <button 
                className="action-btn" 
                onClick={createFolder}
                disabled={!newFolderName.trim()}
              >
                📁 Create Folder
              </button>
            </div>

            <div className="navigation-container">
              {renderBreadcrumbs()}
              {currentPath.length > 0 && (
                <button className="back-btn" onClick={navigateBack}>
                  ⬅ Back
                </button>
              )}
            </div>

            <div className="file-table-container">
              {currentItems.length > 0 ? (
                renderFileTable(currentItems)
              ) : (
                <div className="empty-folder">This folder is empty</div>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="progress-bar">
                <div style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>
        );
      case "addCard":
        return <AddCardForm />;
      default:
        return null;
    }
  };
///filtere bu
 const rendergroups = () => {
  switch (groupId) {
    case "admin":
      return (
        <>
          <button onClick={() => setActiveComponent("upload")}>Uploader</button>
          <button onClick={() => setActiveComponent("addCard")}>Ajouter Carte</button>
        </>
      );
    case "user":
      return (
        <button onClick={() => setActiveComponent("upload")}>Uploader</button>
      );
    default:
      return null;
  }
};







  return (
  
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Menu</h2>
			
          <UserInfoSection onLogout={handleLogout} />
        </div>
        <div className="sidebar-menu">
        {rendergroups () }
        </div>
		
		
      </aside>
      <main className="main-content">
	  
        {renderComponent()}
      </main>
    </div>
  );
}

export default Newdocument;