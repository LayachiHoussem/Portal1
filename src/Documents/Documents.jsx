import React, { useEffect, useState } from "react";
import "./Documents.css";

const getFileIconPath = (filename) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const ext = filename.split('.').pop().toLowerCase();
    if (["png", "jpg", "jpeg", "gif"].includes(ext)) return `http://${API_URL}/backend/public/image/img.png`;
    if (["pdf"].includes(ext)) return `http://${API_URL}/backend/public/image/format-de-fichier-pdf.png`;
    if (["xls", "xlsx", "csv"].includes(ext)) return `http://${API_URL}/backend/public/image/xls.png`;
    if (["doc", "docx"].includes(ext)) return `http://${API_URL}/backend/public/image/word.png`;
    if (["ppt", "pptx"].includes(ext)) return `http://${API_URL}/backend/public/image/powerpoint.png`;
    if (["zip"].includes(ext)) return `http://${API_URL}/backend/public/image/zip-francais.png`;
    if (["rar","tgz"].includes(ext)) return `http://${API_URL}/backend/public/image/deposer.png`;
    if (["txt"].includes(ext)) return `http://${API_URL}/backend/public/image/fichier-txt.png`;
    return "/images/icons/default.png";
};

const stripExtension = (filename) => {
    return filename.replace(/\.[^/.]+$/, "");
};

const FileCard = ({ file, currentPath }) => {
    const fileUrl = `${currentPath}/${file.name}`.replace("./public", "");
     const isImage = file.name.match(/\.$/i);
    const iconPath = getFileIconPath(file.name);
    const title = stripExtension(file.name);
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    const API_URL = import.meta.env.VITE_API_URL;

   const handleDownload = () => {
    
  const url = `http://${API_URL}/backend/Back/public/uploads/${file.name}`;
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};



    return (
        <div className="file-card square">
            {isImage ? (
                <img
                    src={fileUrl}
                    alt={file.name}
                    className="file-thumbnail"
                />
            ) : (
                <img
                    src={iconPath}
                    alt={file.name}
                    className="file-icon"
                />
            )}
            <div className="file-details">
                <h3>{title}</h3>
                <div className="file-path">
                    {currentPath.replace('./public/uploads', '')}
                </div>
            </div>
            <div className="actions">
                <button onClick={handleDownload} className="download">Télécharger</button>
                <a href={googleViewerUrl} target="_blank" rel="noopener noreferrer">
                    <button className="view">👁️ Voir</button>
                </a>
            </div>
        </div>
    );
};

const FolderItem = ({ folder, currentPath, onSelectFolder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFolder = () => {
        const newOpenState = !isOpen;
        setIsOpen(newOpenState);
        if (newOpenState) {
            onSelectFolder(folder.children, `${currentPath}/${folder.name}`);
        } else {
            onSelectFolder([], "./public/uploads");
        }
    };

    return (
        <div>
            <div className="folder" onClick={toggleFolder}>
                <span className="folder-icon">{isOpen ? "🔽" : "▶️"} 📁</span>
                {folder.name}
            </div>
            {isOpen && (
                <div className="folder-children">
                    {folder.children.map((item, index) => (
                        item.type === "folder" ? (
                            <FolderItem
                                key={index}
                                folder={item}
                                currentPath={`${currentPath}/${item.name}`}
                                onSelectFolder={onSelectFolder}
                            />
                        ) : null
                    ))}
                </div>
            )}
        </div>
    );
};

const getAllFiles = (items, basePath = './public/uploads') => {
    let files = [];
    items.forEach(item => {
        if (item.type === 'file') {
            files.push({
                ...item,
                fullPath: `${basePath}/${item.name}`
            });
        } else if (item.type === 'folder' && item.children) {
            files = [
                ...files,
                ...getAllFiles(item.children, `${basePath}/${item.name}`)
            ];
        }
    });
    return files;
};

const Documents = () => {
    const [data, setData] = useState([]);
    const [rootFiles, setRootFiles] = useState([]);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [allFiles, setAllFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState("./public/uploads");
    const [currentFolderName, setCurrentFolderName] = useState("Racine");
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [folderHistory, setFolderHistory] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;
    useEffect(() => {

        fetch(`http://${API_URL}/backend/Back/list_files.php`)
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                const filesAtRoot = data.filter(item => item.type === "file")
                    .map(file => ({
                        ...file,
                        fullPath: `./public/uploads/${file.name}`
                    }));
                setRootFiles(filesAtRoot);
                setCurrentFiles(filesAtRoot);
                setAllFiles(getAllFiles(data));
            })
            .catch(error => console.error('Error fetching files:', error));
    }, []);

    const handleSelectFolder = (children, path) => {
        if (isSearching) return;

        if (!path || path === "./public/uploads") {
            setCurrentFiles(rootFiles);
            setCurrentPath("./public/uploads");
            setCurrentFolderName("Racine");
            setFolderHistory([{ path: "./public/uploads", files: rootFiles }]);
        } else {
            const existingHistory = folderHistory.find(entry => entry.path === path);

            if (existingHistory) {
                setCurrentFiles(existingHistory.files);
                setCurrentPath(path);
                const pathParts = path.split('/');
                setCurrentFolderName(pathParts[pathParts.length - 1]);
            } else {
                const filesOnly = Array.isArray(children)
                    ? children.filter(item => item.type === "file")
                    : [];

                setFolderHistory(prevHistory => [
                    ...prevHistory,
                    { path, files: filesOnly }
                ]);

                setCurrentFiles(filesOnly);
                setCurrentPath(path);
                const pathParts = path.split('/');
                setCurrentFolderName(pathParts[pathParts.length - 1]);
            }
        }
    };

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length > 0) {
            setIsSearching(true);
            const filtered = allFiles.filter(file =>
                file.name.toLowerCase().includes(term.toLowerCase())
            );
            setCurrentFiles(filtered);
            setCurrentFolderName(`Résultats pour "${term}"`);
        } else {
            setIsSearching(false);
            setCurrentFiles(rootFiles);
            setCurrentPath("./public/uploads");
            setCurrentFolderName("Racine");
        }
    };

    return (
        <div className="documents-container">
            <h1 className="page-title">Documents</h1>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Rechercher un fichier..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="documents-sections">
                <div className="folders-section">
                    <h2>Dossiers -<span className="title_file">{currentFolderName}</span></h2>
                    {data.map((item, index) => (
                        item.type === "folder" && (
                            <FolderItem
                                key={index}
                                folder={item}
                                currentPath={`./public/uploads`}
                                onSelectFolder={handleSelectFolder}
                            />
                        )
                    ))}
                </div>

                <div className="files-section">
                    <h2>
                        Fichiers – <span className="title_file">{currentFolderName} {isSearching && `(${currentFiles.length})`}</span>
                    </h2>
                    <div className="files-grid">
                        {currentFiles.length > 0 ? (
                            currentFiles.map((file, index) => (
                                <FileCard
                                    key={index}
                                    file={file}
                                    currentPath={isSearching ? file.fullPath.replace(`/${file.name}`, '') : currentPath}
                                />
                            ))
                        ) : (
                            <p>{isSearching ? "Aucun résultat trouvé" : "Aucun fichier dans ce dossier"}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Documents;