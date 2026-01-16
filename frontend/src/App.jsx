import React, { useState, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [emailAuth, setEmailAuth] = useState("");
  const [passwordAuth, setPasswordAuth] = useState("");
  const [confirmPasswordAuth, setConfirmPasswordAuth] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "", confirm: "" });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });
  const [showPasswordHeld, setShowPasswordHeld] = useState(false);
  const [page, setPage] = useState("dashboard"); 
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState([]);
  const [privateNotes, setPrivateNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [undoNote, setUndoNote] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeFormatting, setActiveFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    list: false
  });

  // --- NEW: Private Notes Password Modal State ---
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [privatePwd, setPrivatePwd] = useState("");
  const [privateConfirm, setPrivateConfirm] = useState("");
  const [privateMode, setPrivateMode] = useState("enter"); // "enter" | "create"
  const [privateError, setPrivateError] = useState("");
  const [privateUnlocked, setPrivateUnlocked] = useState(false);

  const editorRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".note-menu")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchNotes();
    }
  }, [loggedIn]);

  useEffect(() => {
    const updateFormattingState = () => {
      if (!editorRef.current) return;
      
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const node = selection.getRangeAt(0).commonAncestorContainer;
        const parentElement = node.nodeType === 3 ? node.parentElement : node;
        
        setActiveFormatting({
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          list: parentElement.closest('ul, ol') !== null
        });
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('input', updateFormattingState);
      editor.addEventListener('click', updateFormattingState);
      editor.addEventListener('keyup', updateFormattingState);
    }

    return () => {
      if (editor) {
        editor.removeEventListener('input', updateFormattingState);
        editor.removeEventListener('click', updateFormattingState);
        editor.removeEventListener('keyup', updateFormattingState);
      }
    };
  }, [showForm]);



  const openPrivateModal = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/auth/validate-private-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: '' }), 
      });
      const data = await res.json();
      setPrivateMode(data.message === 'No private password set' ? 'create' : 'enter');
    } catch {
      setPrivateMode('create');
    }
    setShowPrivateModal(true);
    setPrivateError('');
  };

  const submitPrivatePassword = async () => {
    setPrivateError('');
    const token = localStorage.getItem('token');

    try {
      if (privateMode === 'create') {
        if (privatePwd.length < 6) throw new Error('Password must be ≥6 chars');
        if (privatePwd !== privateConfirm) throw new Error('Passwords do not match');

        const res = await fetch(`${API_BASE}/auth/set-private-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: privatePwd, confirm: privateConfirm }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed');
        }

        setPrivateUnlocked(true);
        setShowPrivateModal(false);
        setPage('private');
      } else {
        const res = await fetch(`${API_BASE}/auth/validate-private-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: privatePwd }),
        });
        const data = await res.json();
        if (data.valid) {
          setPrivateUnlocked(true);
          setShowPrivateModal(false);
          setPage('private');
        } else {
          setPrivateError(data.message || 'Incorrect password');
        }
      }
      setPrivatePwd('');
      setPrivateConfirm('');
    } catch (e) {
      setPrivateError(e.message);
    }
  };

  const closePrivateModal = () => {
    setShowPrivateModal(false);
    setPrivatePwd("");
    setPrivateConfirm("");
    setPrivateError("");
    if (page === "private") setPage("dashboard");
  };

  useEffect(() => {
    if (!loggedIn) {
      setPrivateUnlocked(false);
    }
  }, [loggedIn]);

  const nameValid = (v) => {
    if (!v.trim()) return "Name is required.";
    if (!/^[A-Za-z\s]+$/.test(v)) return "Name should contain only letters and spaces.";
    return "";
  };

  const emailValid = (v) => {
    if (!v.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Please enter a valid email address.";
    return "";
  };

  const passwordValid = (v) => {
    if (!v) return "Password is required.";
    const rx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
    if (!rx.test(v))
      return "Password must be ≥12 chars and include uppercase, lowercase, number, and special character.";
    return "";
  };

  const handleNameChange = (v) => {
    setName(v);
    setErrors((p) => ({ ...p, name: nameValid(v) }));
  };
  const handleEmailChange = (v) => {
    setEmailAuth(v);
    setErrors((p) => ({ ...p, email: emailValid(v) }));
  };
  const handlePasswordChange = (v) => {
    setPasswordAuth(v);
    setErrors((p) => ({ ...p, password: passwordValid(v) }));
    if (confirmPasswordAuth) {
      setErrors((p) => ({ ...p, confirm: v === confirmPasswordAuth ? "" : "Passwords do not match." }));
    }
  };
  const handleConfirmChange = (v) => {
    setConfirmPasswordAuth(v);
    setErrors((p) => ({ ...p, confirm: passwordAuth === v ? "" : "Passwords do not match." }));
  };

  const onShowPasswordPress = (e) => {
    e.preventDefault();
    setShowPasswordHeld(true);
  };
  const onShowPasswordRelease = (e) => {
    e.preventDefault();
    setShowPasswordHeld(false);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      name: isRegister ? nameValid(name) : "",
      email: emailValid(emailAuth),
      password: passwordValid(passwordAuth),
      confirm: isRegister ? (passwordAuth === confirmPasswordAuth ? "" : "Passwords do not match.") : "",
    };
    setErrors(newErrors);

    setTouched({ name: true, email: true, password: true, confirm: true });

    const hasError = Object.values(newErrors).some((x) => x && x.length > 0);
    if (hasError) return;

    try {
      const endpoint = isRegister ? "register" : "login";
      const body = isRegister
        ? { name, email: emailAuth, password: passwordAuth }
        : { email: emailAuth, password: passwordAuth };

      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Authentication failed: ${errorText}`);
      }
      
      const data = await res.json();
      const { access_token } = data;
      
      if (!access_token) {
        throw new Error("No access token received");
      }
      
      localStorage.setItem("token", access_token); 
      setLoggedIn(true);
      setName("");
      setEmailAuth("");
      setPasswordAuth("");
      setConfirmPasswordAuth("");
      setErrors({});
      setTouched({ name: false, email: false, password: false, confirm: false });
    } catch (err) {
      console.error("Auth error:", err);
      alert(`Authentication failed: ${err.message}`);
    }
  };

  async function fetchNotes() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoggedIn(false);
        return;
      }

      const res = await fetch(`${API_BASE}/notes`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (res.status === 401) {
        localStorage.removeItem("token");
        setLoggedIn(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      const publicList = data.filter((n) => !n.is_private);
      const privateList = data.filter((n) => n.is_private);
      setNotes(publicList);
      setPrivateNotes(privateList);
    } catch (err) {
      console.error("fetchNotes error:", err);
      alert("Could not load notes from backend. Check server.");
    }
  }

  const addNote = async () => {
    const content = editorRef.current?.innerHTML || "";
    if (!title.trim() || !content.trim()) {
      alert("Please enter title and content!");
      return;
    }

    const newNote = {
      title: title.slice(0, 80),
      content,
      color: "#ffffff",
      pinned: activeNote ? !!activeNote.pinned : false,
      is_private: isPrivate,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoggedIn(false);
        return;
      }

      if (activeNote) {
        const res = await fetch(`${API_BASE}/notes/${activeNote.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...newNote }),
        });
        if (!res.ok) throw new Error("Update failed");
        const updated = await res.json();
        if (isPrivate) {
          setPrivateNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        } else {
          setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        }
      } else {
        const res = await fetch(`${API_BASE}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newNote),
        });
        if (!res.ok) throw new Error("Create failed");
        const created = await res.json();
        if (created.is_private) {
          setPrivateNotes((prev) => [created, ...prev]);
        } else {
          setNotes((prev) => [created, ...prev]);
        }
      }
      resetForm(); 
    } catch (err) {
      console.error("addNote error:", err);
      alert("Could not save note. Check backend.");
    }
  };

  const deleteNote = async (note, isPrivateNote) => {
    console.log("Deleting note:", note.id, "isPrivate:", isPrivateNote);
    
    setUndoNote({ note, isPrivateNote });
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoggedIn(false);
        return;
      }

      const res = await fetch(`${API_BASE}/notes/${note.id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Delete failed: ${errorText}`);
      }
      
      if (isPrivateNote) {
        setPrivateNotes((prev) => prev.filter((n) => n.id !== note.id));
      } else {
        setNotes((prev) => prev.filter((n) => n.id !== note.id));
      }
      
      console.log("Note deleted successfully");
    } catch (err) {
      console.error("deleteNote error:", err);
      alert(`Could not delete note: ${err.message}`);
      setUndoNote(null);
    }
  };

  const undoDelete = async () => {
    if (!undoNote) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoggedIn(false);
        return;
      }

      const res = await fetch(`${API_BASE}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: undoNote.note.title,
          content: undoNote.note.content,
          color: undoNote.note.color,
          pinned: undoNote.note.pinned,
          is_private: undoNote.isPrivateNote,
        }),
      });
      
      if (!res.ok) throw new Error("Undo create failed");
      const created = await res.json();
      
      if (undoNote.isPrivateNote) {
        setPrivateNotes((prev) => [created, ...prev]);
      } else {
        setNotes((prev) => [created, ...prev]);
      }
      
      setUndoNote(null);
    } catch (err) {
      console.error("undoDelete error:", err);
      alert("Could not undo delete. Check backend.");
    }
  };

  const moveNote = async (note, toPrivate) => {
    console.log("Moving note:", note.id, "to private:", toPrivate);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoggedIn(false);
        return;
      }

      const res = await fetch(`${API_BASE}/notes/${note.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          ...note, 
          is_private: toPrivate 
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Move failed: ${errorText}`);
      }
      
      const updated = await res.json();
      console.log("Note moved successfully:", updated);

      if (page === "private") {
        setPrivateNotes((prev) => prev.filter((n) => n.id !== note.id));
        setNotes((prev) => [updated, ...prev]);
      } else {
        setNotes((prev) => prev.filter((n) => n.id !== note.id));
        setPrivateNotes((prev) => [updated, ...prev]);
      }
      
      setOpenMenuId(null);
    } catch (err) {
      console.error("moveNote error:", err);
      alert(`Could not move note: ${err.message}`);
    }
  };

  const togglePin = async (note, isPrivateNote) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoggedIn(false);
        return;
      }

      const res = await fetch(`${API_BASE}/notes/${note.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pinned: !note.pinned }),
      });

      if (!res.ok) throw new Error("Pin failed");
      const updated = await res.json();
      if (isPrivateNote) {
        setPrivateNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } else {
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      }
      setOpenMenuId(null);
    } catch (err) {
      console.error("togglePin error:", err);
      alert("Could not toggle pin. Check backend.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setIsPrivate(false);
    setShowForm(false);
    setActiveNote(null);
    setActiveFormatting({ bold: false, italic: false, underline: false, list: false });
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const formatText = (cmd) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(cmd, false, null);
      
      setActiveFormatting({
        ...activeFormatting,
        bold: cmd === 'bold' ? !activeFormatting.bold : activeFormatting.bold,
        italic: cmd === 'italic' ? !activeFormatting.italic : activeFormatting.italic,
        underline: cmd === 'underline' ? !activeFormatting.underline : activeFormatting.underline,
        list: cmd === 'insertUnorderedList' ? !activeFormatting.list : activeFormatting.list
      });
    }
  };

  const truncateContent = (content, maxLength = 100) => {
    const div = document.createElement("div");
    div.innerHTML = content;
    let text = div.textContent || div.innerText || "";
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const getSortedNotes = (list) => {
    const sorted = [...list];
    sorted.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
    sorted.sort((a, b) => (b.pinned === a.pinned ? 0 : b.pinned ? 1 : -1));
    return sorted;
  };

  if (!loggedIn) {
    return (
      <>
        <style>{`
          @import "tailwindcss/preflight";
          @tailwind utilities;

          @layer base {
            :root {
              font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
              line-height: 1.5;
              font-weight: 400;
              font-synthesis: none;
              text-rendering: optimizeLegibility;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              color: #213547;
              background-color: #ffe4e6;
            }

            body {
              margin: 0;
              width: 100%;
              height: 100vh;
            }

            #root {
              width: 100%;
              height: 100vh;
              margin: 0;
              padding: 0;
            }

            .logo {
              height: 6em;
              padding: 1.5em;
              will-change: filter;
              transition: filter 300ms;
            }
            .logo:hover {
              filter: drop-shadow(0 0 2em #646cffaa);
            }
            .logo.react:hover {
              filter: drop-shadow(0 0 2em #61dafbaa);
            }

            @keyframes logo-spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }

            @media (prefers-reduced-motion: no-preference) {
              a:nth-of-type(2) .logo {
                animation: logo-spin infinite 20s linear;
              }
            }

            .card {
              padding: 2em;
            }

            .read-the-docs {
              color: #888;
            }

            .bg-gradient-custom {
              background: linear-gradient(135deg, #f6f9ff 0%, #eef6ff 50%, #e8f2ff 100%);
            }

            .note-content {
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        `}</style>
        <div className="flex justify-center items-center min-h-screen bg-gradient-custom p-5">
          <div className="bg-white p-7 rounded-xl shadow-lg w-full max-w-md text-left border border-blue-100/10">
            <h2 className="mb-1.5 text-xl font-semibold">{isRegister ? "Create account" : "Welcome back"}</h2>
            <p className="mt-0 text-gray-600">{isRegister ? "Register an account" : "Sign in to continue"}</p>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3 mt-3.5">
              {isRegister && (
                <div className="text-left">
                  <label className="text-sm text-gray-700 mb-1.5 block">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                    placeholder="Your full name"
                    className="p-2.5 border border-blue-100 rounded-lg w-full"
                  />
                  {touched.name && errors.name && <div className="text-red-700 text-xs mt-1.5">{errors.name}</div>}
                </div>
              )}

              <div className="text-left">
                <label className="text-sm text-gray-700 mb-1.5 block">Email</label>
                <input
                  value={emailAuth}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  placeholder="you@example.com"
                  className="p-2.5 border border-blue-100 rounded-lg w-full"
                />
                {touched.email && errors.email && <div className="text-red-700 text-xs mt-1.5">{errors.email}</div>}
              </div>

              <div className="text-left relative">
                <label className="text-sm text-gray-700 mb-1.5 block">Password</label>
                <div className="flex items-center border border-blue-100 rounded-lg pr-2">
                  <input
                    value={passwordAuth}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    type={showPasswordHeld ? "text" : "password"}
                    placeholder="Enter password"
                    className="flex-1 p-2.5 border-none outline-none"
                  />
                  <button
                    title="Hold to view password"
                    onMouseDown={onShowPasswordPress}
                    onMouseUp={onShowPasswordRelease}
                    onMouseLeave={onShowPasswordRelease}
                    onTouchStart={onShowPasswordPress}
                    onTouchEnd={onShowPasswordRelease}
                    className="bg-transparent border-none cursor-pointer p-2 text-lg"
                  >
                    {showPasswordHeld ? "🙈" : "👁️"}
                  </button>
                </div>
                {touched.password && errors.password ? (
                  <div className="text-red-700 text-xs mt-1.5">{errors.password}</div>
                ) : (
                  !touched.password && (
                    <div className="text-xs text-gray-500 mt-1.5">
                      Password must be at least 12 characters and include uppercase, lowercase, number, and special character.
                      <div className="text-xs text-gray-600 mt-1.5">
                        <em>Example: Abc123!Password</em>
                      </div>
                    </div>
                  )
                )}
              </div>

              {isRegister && (
                <div className="text-left">
                  <label className="text-sm text-gray-700 mb-1.5 block">Confirm password</label>
                  <input
                    value={confirmPasswordAuth}
                    onChange={(e) => handleConfirmChange(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
                    type="password"
                    placeholder="Re-type password"
                    className="p-2.5 border border-blue-100 rounded-lg w-full"
                  />
                  {touched.confirm && errors.confirm && <div className="text-red-700 text-xs mt-1.5">{errors.confirm}</div>}
                </div>
              )}

              <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-lg cursor-pointer">
                {isRegister ? "Register" : "Login"}
              </button>
            </form>

            <p className="text-sm text-gray-600 mt-3">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrors({});
                  setTouched({ name: false, email: false, password: false, confirm: false });
                }}
              >
                {isRegister ? "Login" : "Register"}
              </span>
            </p>
          </div>
        </div>
      </>
    );
  }

  const currentNotes = page === "dashboard" ? notes : privateNotes;

  return (
    <>
      <style>{`
        @import "tailwindcss/preflight";
        @tailwind utilities;

        @layer base {
          :root {
            font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            font-weight: 400;
            font-synthesis: none;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            color: #213547;
            background-color: #ffe4e6;
          }

          body {
            margin: 0;
            width: 100%;
            height: 100vh;
          }

          #root {
            width: 100%;
            height: 100vh;
            margin: 0;
            padding: 0;
          }

          .logo {
            height: 6em;
            padding: 1.5em;
            will-change: filter;
            transition: filter 300ms;
          }
          .logo:hover {
            filter: drop-shadow(0 0 2em #646cffaa);
          }
          .logo.react:hover {
            filter: drop-shadow(0 0 2em #61dafbaa);
          }

          @keyframes logo-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (prefers-reduced-motion: no-preference) {
            a:nth-of-type(2) .logo {
              animation: logo-spin infinite 20s linear;
            }
          }

          .card {
            padding: 2em;
          }

          .read-the-docs {
            color: #888;
          }

          .bg-gradient-custom {
            background: linear-gradient(135deg, #f6f9ff 0%, #eef6ff 50%, #e8f2ff 100%);
          }

          .note-card {
            height: 200px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .note-content {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            flex-grow: 1;
          }

          .format-btn-active {
            background-color: #3b82f6;
            color: white;
          }
        }
      `}</style>

      {showPrivateModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {privateMode === "create" ? "Set Private Notes Password" : "Enter Private Notes Password"}
            </h3>
            <div className="space-y-3">
              <input
                type="password"
                value={privatePwd}
                onChange={(e) => setPrivatePwd(e.target.value)}
                placeholder={privateMode === "create" ? "New password (6+ chars)" : "Enter password"}
                className="w-full p-2.5 border border-blue-100 rounded-lg"
                autoFocus
              />
              {privateMode === "create" && (
                <input
                  type="password"
                  value={privateConfirm}
                  onChange={(e) => setPrivateConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full p-2.5 border border-blue-100 rounded-lg"
                />
              )}
              {privateError && <p className="text-red-600 text-sm">{privateError}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={submitPrivatePassword}
                className="flex-1 bg-blue-600 text-white p-2.5 rounded-lg"
              >
                {privateMode === "create" ? "Set Password" : "Unlock"}
              </button>
              <button
                onClick={closePrivateModal}
                className="flex-1 bg-gray-300 text-gray-700 p-2.5 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gradient-custom">
        {/* Sidebar */}
        <aside className="w-full md:w-56 bg-white/90 border-r border-blue-100/50 backdrop-blur-sm p-5 shadow-sm flex flex-col">
          <div>
            <h2 className="text-blue-900 mb-2">Notes</h2>
            <div
              className={`p-2.5 rounded-lg mb-2.5 cursor-pointer transition-colors ${page === "dashboard" ? "bg-blue-50" : ""}`}
              onClick={() => setPage("dashboard")}
            >
              Home
            </div>
            <div
              className={`p-2.5 rounded-lg mb-2.5 cursor-pointer transition-colors ${page === "private" ? "bg-blue-50" : ""}`}
              onClick={openPrivateModal}
            >
              Private {privateUnlocked ? "(Unlocked)" : ""}
            </div>
          </div>

          <div className="mt-auto">
            <button
              className="bg-blue-900 text-white p-2.5 rounded-lg cursor-pointer w-full"
              onClick={() => {
                localStorage.removeItem("token");
                setLoggedIn(false);
              }}
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-5 overflow-auto">
          {page === "private" && !privateUnlocked ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <p className="text-lg">Private notes are locked.</p>
              <button
                onClick={openPrivateModal}
                className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg"
              >
                Unlock Private Notes
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="m-0 text-xl font-semibold">{page === "dashboard" ? "Home" : "Private Notes"}</h2>
                  <div className="text-sm text-gray-600">{page === "dashboard" ? "Your workspace" : "Private notes"}</div>
                </div>

                <div className="flex gap-2.5">
                  {undoNote && (
                    <button onClick={undoDelete} className="bg-blue-600 text-white p-2.5 rounded-lg cursor-pointer">
                      Undo
                    </button>
                  )}
                  <button
                    className="bg-cyan-500 text-white p-2.5 rounded-lg cursor-pointer shadow-md"
                    onClick={() => {
                      setIsPrivate(page === "private");
                      setShowForm(true);
                      setActiveNote(null);
                      setTimeout(() => {
                        if (editorRef.current) {
                          editorRef.current.innerHTML = "";
                          editorRef.current.focus();
                        }
                      }, 20);
                    }}
                  >
                    + New note
                  </button>
                </div>
              </div>

              {showForm && (
                <section className="bg-white border border-blue-50 rounded-xl p-4 mb-5 shadow-sm">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title"
                    className="p-2.5 border border-blue-100 rounded-lg w-full mb-2"
                  />
                  <div className="flex gap-2 mb-2.5">
                    <button 
                      type="button" 
                      onClick={() => formatText("bold")} 
                      className={`p-1.5 border border-blue-50 rounded-md cursor-pointer ${activeFormatting.bold ? 'format-btn-active' : ''}`}
                    >
                      B
                    </button>
                    <button 
                      type="button" 
                      onClick={() => formatText("italic")} 
                      className={`p-1.5 border border-blue-50 rounded-md cursor-pointer ${activeFormatting.italic ? 'format-btn-active' : ''}`}
                    >
                      I
                    </button>
                    <button 
                      type="button" 
                      onClick={() => formatText("underline")} 
                      className={`p-1.5 border border-blue-50 rounded-md cursor-pointer ${activeFormatting.underline ? 'format-btn-active' : ''}`}
                    >
                      U
                    </button>
                    <button 
                      type="button" 
                      onClick={() => formatText("insertUnorderedList")} 
                      className={`p-1.5 border border-blue-50 rounded-md cursor-pointer ${activeFormatting.list ? 'format-btn-active' : ''}`}
                    >
                      • List
                    </button>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    className="w-full min-h-[140px] border border-blue-50 rounded-lg p-2.5 bg-white outline-none"
                    aria-label="Note editor"
                    onInput={() => {
                      // Content updates are now handled by the useEffect
                    }}
                  ></div>
                  <div className="mt-3 flex gap-2.5">
                    <button onClick={addNote} className="bg-blue-600 text-white p-2.5 rounded-lg cursor-pointer">
                      {activeNote ? "Update" : "Save"}
                    </button>
                    <button onClick={resetForm} className="bg-red-500 text-white p-2.5 rounded-lg cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {!showForm && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                  {getSortedNotes(currentNotes).map((n) => (
                    <article
                      key={n.id}
                      className="note-card border border-blue-50 p-3 rounded-xl shadow-sm cursor-pointer bg-white hover:shadow-md transition-transform duration-150 text-left"
                      style={{ background: n.color }}
                      onClick={() => {
                        setActiveNote(n);
                        setTitle(n.title);
                        setIsPrivate(page === "private");
                        setShowForm(true);
                        setTimeout(() => {
                          if (editorRef.current) {
                            editorRef.current.innerHTML = n.content;
                            editorRef.current.focus();
                          }
                        }, 40);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="m-0 text-base">{n.title}</h3>
                        <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                          <button
                            className="border-none bg-transparent cursor-pointer text-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === n.id ? null : n.id);
                            }}
                          >
                            ⋮
                          </button>
                          {openMenuId === n.id && (
                            <div className="absolute top-7 right-0 bg-white border border-blue-50 rounded-lg shadow-lg w-56 z-9999 note-menu">
                              {page === "dashboard" ? (
                                <div
                                  className="p-2.5 cursor-pointer text-sm border-b border-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveNote(n, true); // Move to private
                                    setOpenMenuId(null);
                                  }}
                                >
                                  Process (Move to Private)
                                </div>
                              ) : (
                                <div
                                  className="p-2.5 cursor-pointer text-sm border-b border-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveNote(n, false); // Move to public
                                    setOpenMenuId(null);
                                  }}
                                >
                                  Unprocess (Move to Home)
                                </div>
                              )}
                              <div
                                className="p-2.5 cursor-pointer text-sm border-b border-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNote(n, page === "private");
                                  setOpenMenuId(null);
                                }}
                              >
                                Delete
                              </div>
                              <div
                                className="p-2.5 cursor-pointer text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePin(n, page === "private");
                                }}
                              >
                                {n.pinned ? "Unpin" : "Pin"}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 note-content">{truncateContent(n.content)}</div>

                      <div className="mt-2.5 flex justify-between items-center">
                        <small className="text-gray-500">{new Date(n.created_at || n.createdAt).toLocaleString()}</small>
                        {n.pinned && <small className="text-amber-700">Pinned</small>}
                      </div>
                    </article>
                  ))}

                  {currentNotes.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <p className="m-0 text-base">No notes yet.</p>
                      <p className="m-0">
                        Click <strong>New note</strong> to create your first note.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default App;