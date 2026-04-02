import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const STATUS_COLORS = {
  Applied:     { bg: "#e0f0ff", color: "#1a6fb5" },
  Shortlisted: { bg: "#fff8e0", color: "#b58a00" },
  Interview:   { bg: "#e8f5e9", color: "#2e7d32" },
  Rejected:    { bg: "#fde8e8", color: "#c62828" },
  Ghosted:     { bg: "#f0f0f0", color: "#666"    },
  Offered:     { bg: "#e8ffe8", color: "#1b5e20" },
};

const STATUS_LIST = Object.keys(STATUS_COLORS);
const EMPTY_FORM = { companyName: "", jobUrl: "", notes: "", resumeId: "" };

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add application
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Edit application
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ status: "", notes: "" });

  // Resume form
  const [showResumeForm, setShowResumeForm] = useState(false);
  const [resumeForm, setResumeForm] = useState({ fileUrl: "", tag: "" });
  const [resumeError, setResumeError] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState("");

  // Edit resume
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [editResumeData, setEditResumeData] = useState({ fileUrl: "", tag: "" });

  // Filter + sort
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    fetchApplications();
    fetchResumes();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/api/applications");
      setApplications(res.data);
    } catch (err) {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const res = await api.get("/api/resumes");
      setResumes(res.data);
    } catch (err) {
      console.error("Failed to load resumes");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ── Applications ──
  const handleAddApplication = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.resumeId) { setFormError("Please select a resume"); return; }
    setFormLoading(true);
    try {
      const res = await api.post(`/api/applications/${formData.resumeId}`, {
        companyName: formData.companyName,
        jobUrl: formData.jobUrl,
        notes: formData.notes,
      });
      setApplications([res.data, ...applications]);
      setFormData(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add application");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await api.put(`/api/applications/${id}`, editData);
      setApplications(applications.map((app) => app.id === id ? res.data : app));
      setEditingId(null);
    } catch (err) {
      alert("Failed to update application");
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    try {
      await api.delete(`/api/applications/${id}`);
      setApplications(applications.filter((app) => app.id !== id));
    } catch (err) {
      alert("Failed to delete application");
    }
  };

  // ── Resumes ──
  const handleAddResume = async (e) => {
    e.preventDefault();
    setResumeError("");
    setResumeSuccess("");
    if (!resumeForm.fileUrl || !resumeForm.tag) { setResumeError("Both fields are required"); return; }
    setResumeLoading(true);
    try {
      const res = await api.post("/api/resumes", resumeForm);
      setResumes([...resumes, res.data]);
      setResumeSuccess("Resume added successfully!");
      setResumeForm({ fileUrl: "", tag: "" });
      setTimeout(() => setResumeSuccess(""), 3000);
    } catch (err) {
      setResumeError(err.response?.data?.message || "Failed to add resume");
    } finally {
      setResumeLoading(false);
    }
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm("Delete this resume?")) return;
    try {
      await api.delete(`/api/resumes/${id}`);
      setResumes(resumes.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete resume");
    }
  };

  const handleEditResume = async (id) => {
    try {
      const res = await api.put(`/api/resumes/${id}`, editResumeData);
      setResumes(resumes.map((r) => r.id === id ? res.data : r));
      setEditingResumeId(null);
    } catch (err) {
      alert("Failed to update resume");
    }
  };

  const startEditResume = (r) => {
    setEditingResumeId(r.id);
    setEditResumeData({ fileUrl: r.fileUrl, tag: r.tag });
  };

  // ── Filter + Sort ──
  const filteredApps = applications
    .filter((app) => filterStatus === "All" || app.status === filterStatus)
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.applyDate) - new Date(a.applyDate);
      return new Date(a.applyDate) - new Date(b.applyDate);
    });

  // ── Stats ──
  const stats = STATUS_LIST.map((s) => ({
    label: s,
    count: applications.filter((a) => a.status === s).length,
    ...STATUS_COLORS[s],
  })).filter((s) => s.count > 0);

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.navLogo}>⚡</span>
          <h1 style={styles.logo}>ApplyTrack</h1>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navEmail}>{applications[0]?.user?.email || ""}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>

        {/* Page heading */}
        <div style={styles.pageHeading}>
          <h2 style={styles.heading}>Dashboard</h2>
          <p style={styles.subheading}>Track and manage all your job applications</p>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statNumber}>{applications.length}</span>
              <span style={styles.statLabel}>Total</span>
            </div>
            {stats.map((s) => (
              <div
                key={s.label}
                style={{ ...styles.statCard, backgroundColor: s.bg, cursor: "pointer", border: filterStatus === s.label ? `2px solid ${s.color}` : "2px solid transparent" }}
                onClick={() => setFilterStatus(filterStatus === s.label ? "All" : s.label)}
              >
                <span style={{ ...styles.statNumber, color: s.color }}>{s.count}</span>
                <span style={{ ...styles.statLabel, color: s.color }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Resume Section ── */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitleGroup}>
              <h3 style={styles.sectionTitle}>📄 My Resumes</h3>
              <span style={styles.countBadge}>{resumes.length}</span>
            </div>
            <button
              style={styles.secondaryBtn}
              onClick={() => { setShowResumeForm(!showResumeForm); setResumeError(""); setResumeSuccess(""); }}
            >
              {showResumeForm ? "✕ Cancel" : "+ Add Resume"}
            </button>
          </div>

          {showResumeForm && (
            <div style={styles.formCard}>
              {resumeError && <div style={styles.error}>{resumeError}</div>}
              {resumeSuccess && <div style={styles.success}>{resumeSuccess}</div>}
              <form onSubmit={handleAddResume}>
                <div style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>Resume URL (Google Drive etc.)</label>
                    <input style={styles.input} type="url" placeholder="https://drive.google.com/..." value={resumeForm.fileUrl} onChange={(e) => setResumeForm({ ...resumeForm, fileUrl: e.target.value })} required />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Tag / Label</label>
                    <input style={styles.input} type="text" placeholder="e.g. Backend Developer" value={resumeForm.tag} onChange={(e) => setResumeForm({ ...resumeForm, tag: e.target.value })} required />
                  </div>
                </div>
                <button style={styles.submitBtn} type="submit" disabled={resumeLoading}>
                  {resumeLoading ? "Saving..." : "Save Resume"}
                </button>
              </form>
            </div>
          )}

          {resumes.length === 0 && !showResumeForm ? (
            <p style={styles.emptySmall}>No resumes yet. Add one to get started.</p>
          ) : (
            <div style={styles.resumeList}>
              {resumes.map((r) => (
                <div key={r.id} style={styles.resumeCard}>
                  {editingResumeId === r.id ? (
                    <div style={styles.resumeEditRow}>
                      <input style={{ ...styles.input, flex: 1 }} type="text" value={editResumeData.tag} onChange={(e) => setEditResumeData({ ...editResumeData, tag: e.target.value })} placeholder="Tag" />
                      <input style={{ ...styles.input, flex: 2 }} type="url" value={editResumeData.fileUrl} onChange={(e) => setEditResumeData({ ...editResumeData, fileUrl: e.target.value })} placeholder="URL" />
                      <button style={styles.saveBtn} onClick={() => handleEditResume(r.id)}>Save</button>
                      <button style={styles.cancelBtn} onClick={() => setEditingResumeId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div style={styles.resumeCardInner}>
                      <div style={styles.resumeCardLeft}>
                        <span style={styles.resumeIcon}>📄</span>
                        <div>
                          <p style={styles.resumeCardTag}>{r.tag}</p>
                          <a href={r.fileUrl} target="_blank" rel="noreferrer" style={styles.resumeCardUrl}>
                            View Resume ↗
                          </a>
                        </div>
                      </div>
                      <div style={styles.resumeCardActions}>
                        <button style={styles.editIconBtn} onClick={() => startEditResume(r)}>✏️</button>
                        <button style={styles.deleteIconBtn} onClick={() => handleDeleteResume(r.id)}>🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Applications Section ── */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitleGroup}>
              <h3 style={styles.sectionTitle}>💼 My Applications</h3>
              <span style={styles.countBadge}>{filteredApps.length}</span>
            </div>
            <button style={styles.primaryBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? "✕ Cancel" : "+ Add Application"}
            </button>
          </div>

          {/* Filter + Sort bar */}
          <div style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Filter:</span>
              {["All", ...STATUS_LIST].map((s) => (
                <button
                  key={s}
                  style={{
                    ...styles.filterChip,
                    backgroundColor: filterStatus === s ? "#4f46e5" : "#f0f0f8",
                    color: filterStatus === s ? "#fff" : "#555",
                  }}
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <select
              style={styles.sortSelect}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {showForm && (
            <div style={styles.formCard}>
              <h4 style={styles.formTitle}>New Application</h4>
              {formError && <div style={styles.error}>{formError}</div>}
              <form onSubmit={handleAddApplication}>
                <div style={styles.formGrid}>
                  <div style={styles.field}>
                    <label style={styles.label}>Company Name</label>
                    <input style={styles.input} type="text" placeholder="e.g. Google" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Job URL</label>
                    <input style={styles.input} type="url" placeholder="https://..." value={formData.jobUrl} onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Select Resume</label>
                    <select style={styles.input} value={formData.resumeId} onChange={(e) => setFormData({ ...formData, resumeId: e.target.value })}>
                      <option value="">-- Select Resume --</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>{r.tag}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Notes</label>
                    <input style={styles.input} type="text" placeholder="Any notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                  </div>
                </div>
                <button style={styles.submitBtn} type="submit" disabled={formLoading}>
                  {formLoading ? "Saving..." : "Save Application"}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <p style={styles.loadingText}>Loading...</p>
          ) : error ? (
            <p style={styles.errorText}>{error}</p>
          ) : filteredApps.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: "32px" }}>📭</p>
              <p>{filterStatus === "All" ? "No applications yet. Add one!" : `No applications with status "${filterStatus}"`}</p>
            </div>
          ) : (
            <div style={styles.list}>
              {filteredApps.map((app) => (
                <div key={app.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardLeft}>
                      <div style={styles.companyAvatar}>
                        {app.companyName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={styles.companyName}>{app.companyName}</h3>
                        <p style={styles.applyDate}>📅 Applied: {app.applyDate}</p>
                      </div>
                    </div>
                    <div style={styles.cardRight}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: STATUS_COLORS[app.status]?.bg || "#f0f0f0",
                        color: STATUS_COLORS[app.status]?.color || "#333",
                      }}>
                        {app.status}
                      </span>
                      <button style={styles.deleteIconBtn} onClick={() => handleDeleteApplication(app.id)}>🗑️</button>
                    </div>
                  </div>

                  <div style={styles.cardBody}>
                    {app.jobUrl && (
                      <a href={app.jobUrl} target="_blank" rel="noreferrer" style={styles.jobUrl}>
                        🔗 View Job Posting ↗
                      </a>
                    )}
                    {app.notes && <p style={styles.notes}>📝 {app.notes}</p>}
                    {app.resume && (
                      <span style={styles.resumePill}>📄 {app.resume.tag}</span>
                    )}
                  </div>

                  {editingId === app.id ? (
                    <div style={styles.editBox}>
                      <select style={styles.input} value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                        {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input style={styles.input} type="text" placeholder="Update notes..." value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} />
                      <div style={styles.editActions}>
                        <button style={styles.saveBtn} onClick={() => handleUpdate(app.id)}>Save</button>
                        <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button style={styles.updateBtn} onClick={() => { setEditingId(app.id); setEditData({ status: app.status, notes: app.notes || "" }); }}>
                      ✏️ Update Status
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif" },
  navbar: { background: "linear-gradient(135deg, #4f46e5, #7c3aed)", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 12px rgba(79,70,229,0.3)" },
  navLeft: { display: "flex", alignItems: "center", gap: "10px" },
  navLogo: { fontSize: "22px" },
  logo: { color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0 },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  navEmail: { color: "#c7d2fe", fontSize: "13px" },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "6px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "13px" },
  content: { maxWidth: "900px", margin: "0 auto", padding: "32px 16px" },
  pageHeading: { marginBottom: "24px" },
  heading: { fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: 0 },
  subheading: { fontSize: "14px", color: "#888", marginTop: "4px" },
  statsRow: { display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" },
  statCard: { flex: 1, minWidth: "100px", backgroundColor: "#fff", borderRadius: "12px", padding: "16px 20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "2px solid transparent", transition: "border 0.2s" },
  statNumber: { display: "block", fontSize: "28px", fontWeight: "700", color: "#1a1a2e" },
  statLabel: { display: "block", fontSize: "12px", color: "#888", marginTop: "2px", fontWeight: "500" },
  section: { backgroundColor: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  sectionTitleGroup: { display: "flex", alignItems: "center", gap: "10px" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", margin: 0 },
  countBadge: { backgroundColor: "#ede9fe", color: "#4f46e5", borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: "600" },
  primaryBtn: { backgroundColor: "#4f46e5", color: "#fff", border: "none", padding: "9px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  secondaryBtn: { backgroundColor: "#f5f5ff", color: "#4f46e5", border: "1px solid #c7d2fe", padding: "9px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  formCard: { backgroundColor: "#fafafa", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid #ebebf5" },
  formTitle: { fontSize: "14px", fontWeight: "700", marginBottom: "14px", color: "#1a1a2e" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  field: { display: "flex", flexDirection: "column" },
  label: { fontSize: "12px", fontWeight: "600", color: "#555", marginBottom: "5px" },
  input: { padding: "9px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box", width: "100%", backgroundColor: "#fff" },
  submitBtn: { marginTop: "14px", backgroundColor: "#4f46e5", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  error: { backgroundColor: "#ffe0e0", color: "#cc0000", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "12px" },
  success: { backgroundColor: "#e0f7e9", color: "#1a7f3c", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "12px" },
  emptySmall: { color: "#aaa", fontSize: "13px", textAlign: "center", padding: "16px 0" },
  resumeList: { display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" },
  resumeCard: { border: "1px solid #ebebf5", borderRadius: "10px", padding: "12px 16px", backgroundColor: "#fafafa" },
  resumeCardInner: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  resumeCardLeft: { display: "flex", alignItems: "center", gap: "12px" },
  resumeIcon: { fontSize: "24px" },
  resumeCardTag: { fontSize: "14px", fontWeight: "600", color: "#1a1a2e", margin: 0 },
  resumeCardUrl: { fontSize: "12px", color: "#4f46e5", textDecoration: "none" },
  resumeCardActions: { display: "flex", gap: "8px" },
  resumeEditRow: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  editIconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: "4px" },
  deleteIconBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: "4px" },
  filterBar: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px", padding: "12px 14px", backgroundColor: "#fafafa", borderRadius: "10px", border: "1px solid #ebebf5" },
  filterGroup: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  filterLabel: { fontSize: "12px", fontWeight: "600", color: "#888" },
  filterChip: { border: "none", padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s" },
  sortSelect: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", outline: "none", backgroundColor: "#fff", color: "#333" },
  loadingText: { textAlign: "center", color: "#aaa", padding: "32px 0" },
  errorText: { textAlign: "center", color: "#cc0000", padding: "32px 0" },
  empty: { textAlign: "center", color: "#aaa", padding: "40px 0", lineHeight: "2" },
  list: { display: "flex", flexDirection: "column", gap: "14px" },
  card: { border: "1px solid #ebebf5", borderRadius: "12px", padding: "18px 20px", backgroundColor: "#fff", transition: "box-shadow 0.2s" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  cardLeft: { display: "flex", alignItems: "center", gap: "14px" },
  companyAvatar: { width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#ede9fe", color: "#4f46e5", fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" },
  companyName: { fontSize: "16px", fontWeight: "700", color: "#1a1a2e", margin: 0 },
  applyDate: { fontSize: "12px", color: "#999", marginTop: "2px" },
  cardRight: { display: "flex", alignItems: "center", gap: "10px" },
  badge: { fontSize: "12px", fontWeight: "600", padding: "4px 14px", borderRadius: "20px" },
  cardBody: { display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "12px" },
  jobUrl: { fontSize: "13px", color: "#4f46e5", textDecoration: "none" },
  notes: { fontSize: "13px", color: "#666", margin: 0 },
  resumePill: { fontSize: "12px", color: "#7c3aed", backgroundColor: "#f5f3ff", padding: "3px 10px", borderRadius: "20px" },
  editBox: { display: "flex", flexDirection: "column", gap: "10px", paddingTop: "12px", borderTop: "1px solid #f0f0f0" },
  editActions: { display: "flex", gap: "10px" },
  saveBtn: { backgroundColor: "#4f46e5", color: "#fff", border: "none", padding: "8px 18px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  cancelBtn: { backgroundColor: "#f0f0f0", color: "#555", border: "none", padding: "8px 18px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" },
  updateBtn: { backgroundColor: "#f5f5ff", color: "#4f46e5", border: "1px solid #c7d2fe", padding: "7px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
};

export default Dashboard;