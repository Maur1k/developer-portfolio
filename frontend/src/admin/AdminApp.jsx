import React, { useMemo, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured, isStorageConfigured } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { useCollectionData, useDocumentData } from '../hooks/useFirestoreData';
import {
  fallbackCertificates,
  fallbackEducation,
  fallbackExperience,
  fallbackProfile,
  fallbackProjects,
  fallbackSkills,
} from '../data/fallbackPortfolio';

const navItems = [
  ['Dashboard', '/admin/dashboard'],
  ['Profile', '/admin/profile'],
  ['Projects', '/admin/projects'],
  ['Skills', '/admin/skills'],
  ['Experience', '/admin/experience'],
  ['Education', '/admin/education'],
  ['Certificates', '/admin/certificates'],
  ['Contact Information', '/admin/contact'],
  ['Settings', '/admin/settings'],
];

const emptyProject = {
  id: '',
  title: '',
  subtitle: '',
  tagline: '',
  shortDescription: '',
  longDescription: '',
  thumbnailImage: '',
  galleryImages: [],
  technologies: [],
  highlights: [],
  category: '',
  status: 'Completed',
  repositoryUrl: '',
  liveDemoUrl: '',
  startDate: '',
  endDate: '',
  featured: false,
  displayOrder: 0,
};

const fieldClass =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-gray-400';
const buttonClass =
  'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

function splitList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value) {
  return Array.isArray(value) ? value.join('\n') : value || '';
}

function slugify(value) {
  return (
    String(value || 'asset')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'asset'
  );
}

async function uploadFile(file, folder) {
  if (!file) return '';
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'File uploads need Supabase Storage configured. Use an image URL or place files in frontend/public/.'
    );
  }

  const filePath = `${folder}/${Date.now()}-${slugify(file.name)}`;
  const { data, error } = await supabase.storage
    .from('portfolio')
    .upload(filePath, file, { upsert: true });

  if (error) {
    throw new Error(`Upload error: ${error.message}. Ensure the 'portfolio' bucket exists in Supabase Storage.`);
  }

  const { data: publicData } = supabase.storage.from('portfolio').getPublicUrl(filePath);
  return publicData?.publicUrl || '';
}

function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-[#12141a]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] ${className}`}
    >
      {children}
    </div>
  );
}

function AdminLayout() {
  const { user, logout, adminEmail, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-[#0d0f14]/95 p-5 lg:block">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">Portfolio CMS</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Admin</h1>
        </div>
        <nav className="space-y-1">
          {navItems.map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-400 to-amber-300 text-[#090a0c]'
                    : 'text-gray-400 hover:bg-white/[0.05] hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090b]/85 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs text-gray-500">Signed in as {user?.email || adminEmail}</p>
              <p className="font-semibold text-white">Private content management dashboard</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  isSupabaseConfigured
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                    : 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                }`}
              >
                {isSupabaseConfigured ? 'Supabase connected' : 'Supabase env missing'}
              </div>
              <div
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  isStorageConfigured
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                    : 'border-slate-400/30 bg-slate-400/10 text-slate-300'
                }`}
              >
                {isStorageConfigured ? 'Storage ready' : 'Storage off (URL mode)'}
              </div>
              <button
                className={`${buttonClass} border border-white/10 text-gray-200 hover:bg-white/[0.06]`}
                onClick={() => navigate('/')}
              >
                View Site ↗
              </button>
              <button
                className={`${buttonClass} bg-white text-[#09090b] hover:bg-amber-100`}
                onClick={logout}
              >
                Sign Out
              </button>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map(([label, href]) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  `shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${
                    isActive ? 'bg-amber-300 text-[#090a0c]' : 'bg-white/[0.05] text-gray-300'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="px-4 py-6 md:px-8">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="projects" element={<ProjectsManager />} />
            <Route path="skills" element={<SkillsManager />} />
            <Route
              path="experience"
              element={
                <GenericManager
                  title="Experience"
                  collectionName="experience"
                  fallback={fallbackExperience}
                  fields={experienceFields}
                />
              }
            />
            <Route
              path="education"
              element={
                <GenericManager
                  title="Education"
                  collectionName="education"
                  fallback={fallbackEducation}
                  fields={educationFields}
                />
              }
            />
            <Route
              path="certificates"
              element={
                <GenericManager
                  title="Certificates"
                  collectionName="certificates"
                  fallback={fallbackCertificates}
                  fields={certificateFields}
                />
              }
            />
            <Route path="contact" element={<ContactEditor />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export function Login() {
  const { login, isAdmin, adminEmail, isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (loginError) {
      setError(loginError.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    setError('');
    try {
      await login(provider);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-white">
      <Card className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">Private Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold">Portfolio CMS</h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          Sign in to manage projects, skills, and site content. Only <span className="text-white font-mono">{adminEmail}</span> has administrative access.
        </p>
        {!isSupabaseConfigured && (
          <div className="mt-5 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
            Add your Supabase credentials to <code className="font-mono text-amber-200">.env.local</code> before logging in.
          </div>
        )}
        <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
          <div>
            <span className={labelClass}>Email Address</span>
            <input
              className={fieldClass}
              type="email"
              placeholder="maurikfernandez123@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <span className={labelClass}>Password</span>
            <input
              className={fieldClass}
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="w-full rounded-lg bg-gradient-to-r from-orange-400 to-amber-300 px-4 py-3 font-bold text-[#090a0c] transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In with Email'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <span className="relative bg-[#12141a] px-3 text-xs uppercase tracking-wider text-gray-500">
            Or OAuth
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading || !isSupabaseConfigured}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            Google
          </button>
          <button
            onClick={() => handleOAuthLogin('github')}
            disabled={loading || !isSupabaseConfigured}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            GitHub
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
}

function Dashboard() {
  const { items: projects } = useCollectionData('projects', fallbackProjects, { orderBy: 'displayOrder' });
  const { items: experience } = useCollectionData('experience', fallbackExperience, { orderBy: 'displayOrder' });
  const { items: certificates } = useCollectionData('certificates', fallbackCertificates, { orderBy: 'displayOrder' });
  const { data: skills } = useDocumentData('siteContent', 'skills', fallbackSkills);
  const stats = [
    ['Projects', projects.length],
    ['Featured', projects.filter((project) => project.featured).length],
    ['Experience', experience.length],
    ['Certificates', certificates.length],
    ['Skill Groups', Object.keys(skills || {}).filter((key) => Array.isArray(skills[key])).length],
  ];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Dashboard"
        description="Live overview of the dynamic content feeding your public portfolio."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="text-xl font-bold">CMS Architecture (Supabase Powered)</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {['React Frontend', 'Supabase Postgres', 'Supabase Storage (1GB free)', 'Supabase Auth', 'Protected Admin CRUD'].map(
            (item) => (
              <div
                key={item}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-gray-300"
              >
                {item}
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  );
}

function PageTitle({ title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

function TextField({ label, value, onChange, type = 'text', textarea = false, required = false }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {textarea ? (
        <textarea
          className={fieldClass}
          rows="5"
          value={value || ''}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={fieldClass}
          type={type}
          value={value || ''}
          required={required}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        />
      )}
    </label>
  );
}

function ImageDropzone({ label, value, onChange, folder = 'projects/thumbnails' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    setError('');
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="block">
      <div className="flex items-center justify-between mb-2">
        <span className={labelClass}>{label}</span>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-amber-300 hover:text-amber-200 underline font-mono"
        >
          {showUrlInput ? 'Hide URL' : 'Manual URL'}
        </button>
      </div>

      {showUrlInput && (
        <div className="mb-2">
          <input
            className={fieldClass}
            type="text"
            placeholder="/projects/... or https://..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}

      {value ? (
        <div className="rounded-xl border border-white/10 bg-[#09090b] p-3 flex items-center gap-4">
          <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-zinc-800 bg-[#121318] flex items-center justify-center">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-zinc-300 truncate">{value}</p>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`${buttonClass} border border-white/10 px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/5`}
              >
                {uploading ? 'Uploading...' : 'Replace'}
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className={`${buttonClass} border border-red-500/20 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/10`}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            isDragging
              ? 'border-amber-400 bg-amber-400/10 text-amber-200'
              : 'border-white/15 bg-white/[0.02] text-zinc-400 hover:border-amber-300/40 hover:bg-white/[0.04]'
          }`}
        >
          <svg className="w-8 h-8 mb-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs font-semibold text-zinc-200">
            {uploading ? 'Uploading to Supabase...' : 'Drag & drop image here, or click to browse'}
          </p>
          <p className="text-[11px] font-mono text-zinc-500 mt-1">PNG, JPG, WebP up to 10MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}

function MultiImageDropzone({ label, images = [], onChange, folder = 'projects/gallery' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = React.useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const uploadPromises = Array.from(files).map((file) => uploadFile(file, folder));
      const newUrls = await Promise.all(uploadPromises);
      onChange([...images, ...newUrls.filter(Boolean)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const moveImage = (fromIdx, toIdx) => {
    const next = [...images];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
  };

  const addManual = (e) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    onChange([...images, manualUrl.trim()]);
    setManualUrl('');
  };

  return (
    <div className="md:col-span-2 block">
      <div className="flex items-center justify-between mb-2">
        <span className={labelClass}>
          {label} ({images.length} {images.length === 1 ? 'image' : 'images'})
        </span>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-amber-300 hover:text-amber-200 underline font-mono"
        >
          {showUrlInput ? 'Hide manual URL' : '+ Add URL manually'}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 mb-3">
          <input
            className={`${fieldClass} flex-1`}
            type="text"
            placeholder="/projects/... or https://..."
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
          />
          <button
            type="button"
            onClick={addManual}
            className={`${buttonClass} bg-zinc-800 text-zinc-200 hover:bg-zinc-700`}
          >
            Add
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          isDragging
            ? 'border-amber-400 bg-amber-400/10 text-amber-200'
            : 'border-white/15 bg-white/[0.02] text-zinc-400 hover:border-amber-300/40 hover:bg-white/[0.04]'
        }`}
      >
        <svg className="w-8 h-8 mb-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-xs font-semibold text-zinc-200">
          {uploading ? 'Uploading multiple screenshots...' : 'Drag & drop screenshots here, or click to browse'}
        </p>
        <p className="text-[11px] font-mono text-zinc-500 mt-1">Select or drop multiple files simultaneously</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}

      {/* Visual Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {images.map((imgUrl, index) => (
            <div
              key={`${imgUrl}-${index}`}
              className="relative group rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b] aspect-video flex flex-col justify-between"
            >
              <img
                src={imgUrl}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono bg-black/80 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="w-5 h-5 rounded bg-red-500/90 text-white hover:bg-red-600 text-xs flex items-center justify-center transition"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
                <div className="flex gap-1 justify-center">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(index, index - 1);
                      }}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[10px] font-mono hover:bg-zinc-700"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(index, index + 1);
                      }}
                      className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[10px] font-mono hover:bg-zinc-700"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileField({ label, onUpload, folder }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        className={fieldClass}
        type="file"
        accept="image/*,.pdf"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setUploading(true);
          setError('');
          try {
            const url = await uploadFile(file, folder);
            onUpload(url);
          } catch (uploadError) {
            setError(uploadError.message);
          } finally {
            setUploading(false);
          }
        }}
      />
      {uploading && <p className="mt-2 text-xs text-amber-200">Uploading to Supabase Storage...</p>}
      {error && <p className="mt-2 text-xs text-red-200">{error}</p>}
    </label>
  );
}

function ResumeDropzone({ value, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = React.useRef(null);

  const isPdf = value && (value.endsWith('.pdf') || value.includes('.pdf'));
  const isImage = value && !isPdf;

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Only PDF, JPG, PNG, or WebP files are supported.');
      return;
    }
    setUploading(true);
    setProgress('Uploading...');
    setError('');
    try {
      const url = await uploadFile(file, 'resume');
      onChange(url);
      setProgress('');
    } catch (err) {
      setError(err.message);
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="md:col-span-2 block">
      <div className="flex items-center justify-between mb-2">
        <span className={labelClass}>Resume File</span>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-amber-300 hover:text-amber-200 underline font-mono"
        >
          {showUrlInput ? 'Hide URL' : 'Manual URL'}
        </button>
      </div>

      {showUrlInput && (
        <div className="mb-2">
          <input
            className={fieldClass}
            type="text"
            placeholder="/files/Resume.pdf or https://..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}

      {value ? (
        <div className="rounded-xl border border-white/10 bg-[#09090b] p-4 flex items-center gap-4">
          {/* File type icon */}
          <div className="w-14 h-16 shrink-0 rounded-lg border border-zinc-800 bg-[#121318] flex flex-col items-center justify-center gap-1">
            {isPdf ? (
              <>
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className="text-[9px] font-mono text-red-400 font-bold">PDF</span>
              </>
            ) : isImage ? (
              <img src={value} alt="Resume preview" className="w-full h-full object-cover rounded-lg" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-200 mb-0.5">
              {isPdf ? 'PDF Resume' : isImage ? 'Image Resume' : 'Resume File'}
            </p>
            <p className="text-[11px] font-mono text-zinc-500 truncate mb-2">{value}</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className={`${buttonClass} border border-white/10 px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/5`}
              >
                Open ↗
              </a>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`${buttonClass} border border-white/10 px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/5`}
              >
                {uploading ? progress : 'Replace'}
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className={`${buttonClass} border border-red-500/20 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/10`}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            isDragging
              ? 'border-amber-400 bg-amber-400/10 text-amber-200'
              : 'border-white/15 bg-white/[0.02] text-zinc-400 hover:border-amber-300/40 hover:bg-white/[0.04]'
          }`}
        >
          <svg className="w-9 h-9 mb-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p className="text-xs font-semibold text-zinc-200">
            {uploading ? progress : 'Drag & drop your resume here, or click to browse'}
          </p>
          <p className="text-[11px] font-mono text-zinc-500 mt-1">PDF, JPG, PNG, WebP — max 10 MB</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}

function ProfileEditor() {
  const { data } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const [draft, setDraft] = useState(fallbackProfile);
  React.useEffect(() => setDraft(data || fallbackProfile), [data]);
  const update = (path, value) => setDraft((current) => setNested(current, path, value));

  const save = async () => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.from('site_content').upsert({
      key: 'profile',
      data: draft,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  };

  return (
    <DocumentForm
      title="Profile"
      description="Manage hero headline, about narrative, resume, and personal contact details."
      onSave={save}
    >
      <TextField label="Name" value={draft.name} onChange={(value) => update('name', value)} required />
      <TextField
        label="Professional Title"
        value={draft.professionalTitle}
        onChange={(value) => update('professionalTitle', value)}
      />
      <TextField label="Headline" value={draft.headline} onChange={(value) => update('headline', value)} />
      <TextField
        label="Hero Description"
        value={draft.heroDescription}
        onChange={(value) => update('heroDescription', value)}
        textarea
      />
      <TextField label="About Me" value={draft.aboutMe} onChange={(value) => update('aboutMe', value)} textarea />
      <ImageDropzone
        label="Profile Photo"
        value={draft.profilePhoto}
        onChange={(url) => update('profilePhoto', url)}
        folder="profile"
      />
      <ResumeDropzone value={draft.resumeUrl} onChange={(url) => update('resumeUrl', url)} />
      <TextField label="Location" value={draft.location} onChange={(value) => update('location', value)} />
      <TextField label="Availability" value={draft.availability} onChange={(value) => update('availability', value)} />
      <TextField label="Email" value={draft.contact?.email} onChange={(value) => update('contact.email', value)} />
      <TextField label="Phone" value={draft.contact?.phone} onChange={(value) => update('contact.phone', value)} />
      <TextField
        label="LinkedIn"
        value={draft.socialLinks?.linkedin}
        onChange={(value) => update('socialLinks.linkedin', value)}
      />
      <TextField
        label="GitHub"
        value={draft.socialLinks?.github}
        onChange={(value) => update('socialLinks.github', value)}
      />
      <TextField
        label="Facebook"
        value={draft.socialLinks?.facebook}
        onChange={(value) => update('socialLinks.facebook', value)}
      />
    </DocumentForm>
  );
}

function ContactEditor() {
  const { data } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const [draft, setDraft] = useState(fallbackProfile);
  React.useEffect(() => setDraft(data || fallbackProfile), [data]);
  const update = (path, value) => setDraft((current) => setNested(current, path, value));

  const save = async () => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.from('site_content').upsert({
      key: 'profile',
      data: draft,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  };

  return (
    <DocumentForm
      title="Contact Information"
      description="Update every public contact channel from one place."
      onSave={save}
    >
      <TextField label="Email" value={draft.contact?.email} onChange={(value) => update('contact.email', value)} />
      <TextField label="Phone" value={draft.contact?.phone} onChange={(value) => update('contact.phone', value)} />
      <TextField label="Location" value={draft.location} onChange={(value) => update('location', value)} />
      <TextField
        label="Portfolio URL"
        value={draft.contact?.portfolioUrl}
        onChange={(value) => update('contact.portfolioUrl', value)}
      />
      <TextField
        label="LinkedIn"
        value={draft.socialLinks?.linkedin}
        onChange={(value) => update('socialLinks.linkedin', value)}
      />
      <TextField
        label="GitHub"
        value={draft.socialLinks?.github}
        onChange={(value) => update('socialLinks.github', value)}
      />
      <TextField
        label="Facebook"
        value={draft.socialLinks?.facebook}
        onChange={(value) => update('socialLinks.facebook', value)}
      />
    </DocumentForm>
  );
}

function DocumentForm({ title, description, onSave, children }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  return (
    <div className="space-y-6">
      <PageTitle title={title} description={description} />
      <Card>
        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setMessage('');
            try {
              await onSave();
              setMessage('Saved successfully to Supabase.');
            } catch (error) {
              setMessage(`Error: ${error.message}`);
            } finally {
              setSaving(false);
            }
          }}
        >
          {children}
          <div className="md:col-span-2">
            <button
              disabled={saving || !supabase}
              className={`${buttonClass} bg-gradient-to-r from-orange-400 to-amber-300 text-[#090a0c]`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {message && <p className="mt-3 text-sm text-gray-300">{message}</p>}
          </div>
        </form>
      </Card>
    </div>
  );
}

function setNested(source, path, value) {
  const next = structuredClone(source || {});
  const keys = path.split('.');
  let target = next;
  keys.slice(0, -1).forEach((key) => {
    target[key] = target[key] || {};
    target = target[key];
  });
  target[keys.at(-1)] = value;
  return next;
}

function moveItem(list, fromIndex, toIndex) {
  const next = [...list];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function SkillCategoryEditor({ label, skills = [], onChange }) {
  const [dragIndex, setDragIndex] = useState(null);

  const updateSkill = (index, value) => {
    const next = [...skills];
    next[index] = value;
    onChange(next.filter(Boolean));
  };

  const removeSkill = (index) => onChange(skills.filter((_, itemIndex) => itemIndex !== index));

  return (
    <Card>
      <p className={labelClass}>{label}</p>
      <ul className="space-y-2">
        {skills.map((skill, index) => (
          <li
            key={`${skill}-${index}`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) return;
              onChange(moveItem(skills, dragIndex, index));
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2"
          >
            <span className="cursor-grab select-none text-gray-500" aria-hidden="true">
              ⋮⋮
            </span>
            <input
              className={`${fieldClass} flex-1`}
              value={skill}
              onChange={(event) => updateSkill(index, event.target.value)}
            />
            <button
              type="button"
              className={`${buttonClass} border border-white/10 px-2 py-1 text-xs text-gray-300`}
              onClick={() => onChange(moveItem(skills, index, Math.max(0, index - 1)))}
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              className={`${buttonClass} border border-white/10 px-2 py-1 text-xs text-gray-300`}
              onClick={() => onChange(moveItem(skills, index, Math.min(skills.length - 1, index + 1)))}
              aria-label="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              className={`${buttonClass} border border-red-400/30 px-2 py-1 text-xs text-red-200`}
              onClick={() => removeSkill(index)}
              aria-label="Remove skill"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={`${buttonClass} mt-3 border border-white/10 text-gray-300`}
        onClick={() => onChange([...skills, 'New skill'])}
      >
        Add Skill
      </button>
    </Card>
  );
}

function SkillsManager() {
  const { data } = useDocumentData('siteContent', 'skills', fallbackSkills);
  const [draft, setDraft] = useState(fallbackSkills);
  const [message, setMessage] = useState('');
  React.useEffect(() => setDraft(data || fallbackSkills), [data]);
  const categories = [
    ['react', 'React / Frontend Development'],
    ['flutter', 'Flutter / Mobile Development'],
    ['nodejs', 'Node.js / Backend Development'],
    ['laravel', 'Laravel / PHP Development'],
    ['mysql', 'MySQL / Database Development'],
    ['firebase', 'Firebase / Cloud Services'],
    ['restapis', 'REST APIs & Integrations'],
    ['aidev', 'AI-Assisted Development'],
  ];

  const save = async () => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.from('site_content').upsert({
      key: 'skills',
      data: draft,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Skills saved successfully.');
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Skills"
        description="Drag skills to reorder them within each category. Changes appear on the public portfolio after saving."
        action={
          <button disabled={!supabase} onClick={save} className={`${buttonClass} bg-amber-300 text-[#090a0c]`}>
            Save Skills
          </button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map(([key, label]) => (
          <SkillCategoryEditor
            key={key}
            label={label}
            skills={draft[key] || []}
            onChange={(nextSkills) => setDraft((current) => ({ ...current, [key]: nextSkills }))}
          />
        ))}
      </div>
      {message && <p className="text-sm text-gray-300">{message}</p>}
    </div>
  );
}

function ProjectsManager() {
  const { items: projects } = useCollectionData('projects', [...fallbackProjects, ...fallbackPlaygroundProjects], { orderBy: 'displayOrder' });
  const [editing, setEditing] = useState(null);

  const toggleFeature = async (project) => {
    if (!supabase) return;
    await supabase.from('projects').update({ featured: !project.featured }).eq('id', project.id);
  };

  const deleteProject = async (project) => {
    if (!supabase) return;
    if (window.confirm(`Are you sure you want to delete "${project.title || project.name}"?`)) {
      await supabase.from('projects').delete().eq('id', project.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Projects"
        description="Create, edit, duplicate, feature, order, and delete public portfolio projects dynamically."
        action={
          <button
            className={`${buttonClass} bg-gradient-to-r from-orange-400 to-amber-300 text-[#090a0c]`}
            onClick={() => setEditing({ ...emptyProject, displayOrder: projects.length + 1 })}
          >
            Add Project
          </button>
        }
      />
      {editing && <ProjectForm project={editing} onClose={() => setEditing(null)} />}
      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs text-amber-100">
                    {project.category || 'Uncategorized'}
                  </span>
                  {project.featured && (
                    <span className="rounded-full border border-orange-300/20 bg-orange-300/10 px-2 py-1 text-xs text-orange-100">
                      Featured
                    </span>
                  )}
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-400">
                    Order: {project.displayOrder ?? project.display_order ?? 0}
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-bold text-white">{project.title || project.name}</h2>
                <p className="mt-1 max-w-3xl text-sm text-gray-400">
                  {project.shortDescription || project.short_description || project.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`${buttonClass} border border-white/10 text-gray-200 hover:bg-white/[0.06]`}
                  onClick={() => setEditing(project)}
                >
                  Edit
                </button>
                <button
                  className={`${buttonClass} border border-white/10 text-gray-200 hover:bg-white/[0.06]`}
                  onClick={() => duplicateProject(project)}
                >
                  Duplicate
                </button>
                <button
                  className={`${buttonClass} border border-white/10 text-gray-200 hover:bg-white/[0.06]`}
                  onClick={() => toggleFeature(project)}
                >
                  {project.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  className={`${buttonClass} border border-red-400/30 text-red-200 hover:bg-red-400/10`}
                  onClick={() => deleteProject(project)}
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function duplicateProject(project) {
  if (!supabase) return;
  const { id, ...copy } = project;
  const newId = `${slugify(project.title || project.name)}-copy-${Date.now()}`;
  const payload = normalizeProject({
    ...copy,
    id: newId,
    title: `${project.title || project.name} (Copy)`,
    featured: false,
  });
  await supabase.from('projects').insert(payload);
}

function ProjectForm({ project, onClose }) {
  const [draft, setDraft] = useState({ ...emptyProject, ...project });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setError('');
    const payload = normalizeProject(draft);
    try {
      const { error: upsertError } = await supabase
        .from('projects')
        .upsert(payload, { onConflict: 'id' });

      if (upsertError) throw upsertError;
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <form onSubmit={save} className="grid gap-5 md:grid-cols-2">
        <TextField
          label="Project ID / Slug"
          value={draft.id}
          onChange={(value) => update('id', slugify(value))}
          required
        />
        <TextField
          label="Title"
          required
          value={draft.title || draft.name}
          onChange={(value) => update('title', value)}
        />
        <TextField label="Subtitle" value={draft.subtitle} onChange={(value) => update('subtitle', value)} />
        <TextField label="Category" value={draft.category} onChange={(value) => update('category', value)} />
        <TextField
          label="Short Description"
          textarea
          value={draft.shortDescription || draft.short_description || draft.summary}
          onChange={(value) => update('shortDescription', value)}
        />
        <TextField
          label="Long Description"
          textarea
          value={draft.longDescription || draft.long_description}
          onChange={(value) => update('longDescription', value)}
        />
        <ImageDropzone
          label="Thumbnail / Cover Image"
          value={draft.thumbnailImage || draft.thumbnail_image}
          onChange={(url) => update('thumbnailImage', url)}
          folder="projects/thumbnails"
        />
        <div className="hidden md:block" />
        <MultiImageDropzone
          label="Gallery & Screenshots"
          images={splitList(draft.galleryImages || draft.gallery_images)}
          onChange={(imgs) => update('galleryImages', imgs)}
          folder="projects/gallery"
        />
        <TextField
          label="Technologies (comma or newline separated)"
          textarea
          value={joinList(draft.technologies)}
          onChange={(value) => update('technologies', splitList(value))}
        />
        <TextField
          label="Highlights (one per line)"
          textarea
          value={joinList(draft.highlights)}
          onChange={(value) => update('highlights', splitList(value))}
        />
        <TextField label="Status" value={draft.status} onChange={(value) => update('status', value)} />
        <TextField
          label="GitHub Repository URL"
          value={draft.repositoryUrl || draft.repository_url}
          onChange={(value) => update('repositoryUrl', value)}
        />
        <TextField
          label="Live Demo URL"
          value={draft.liveDemoUrl || draft.live_demo_url}
          onChange={(value) => update('liveDemoUrl', value)}
        />
        <TextField
          label="Display Order"
          type="number"
          value={draft.displayOrder ?? draft.display_order ?? 0}
          onChange={(value) => update('displayOrder', value)}
        />
        {/* Project Type Selector */}
        <div className="md:col-span-2">
          <span className={labelClass}>Project Type</span>
          <div className="flex gap-3 mt-1.5">
            {[
              { value: 'main', label: '🏗️ Main Project', desc: 'Featured in the main projects grid' },
              { value: 'playground', label: '🧪 Playground', desc: 'School projects, experiments & side builds' },
            ].map(({ value, label, desc }) => (
              <label
                key={value}
                className={`flex-1 flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  (draft.projectType || 'main') === value
                    ? 'border-amber-400/50 bg-amber-400/5'
                    : 'border-white/10 bg-[#09090b] hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="projectType"
                  value={value}
                  checked={(draft.projectType || 'main') === value}
                  onChange={() => update('projectType', value)}
                  className="mt-0.5 accent-amber-400"
                />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">{label}</p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-gray-300 md:col-span-2">
          <input
            type="checkbox"
            checked={Boolean(draft.featured)}
            onChange={(event) => update('featured', event.target.checked)}
          />{' '}
          Featured Project (prominently displayed)
        </label>
        {error && <p className="text-sm text-red-300 md:col-span-2">{error}</p>}
        <div className="flex gap-2 md:col-span-2">
          <button
            disabled={saving || !supabase}
            className={`${buttonClass} bg-amber-300 text-[#090a0c] hover:bg-amber-200`}
          >
            {saving ? 'Saving...' : 'Save Project'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${buttonClass} border border-white/10 text-gray-300 hover:bg-white/[0.05]`}
          >
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}

function normalizeProject(project) {
  const galleryImages = splitList(project.galleryImages || project.gallery_images);
  const title = project.title || project.name || '';
  const id = project.id || slugify(title) || `project-${Date.now()}`;
  // Return ONLY the columns that exist in the Supabase projects table (snake_case).
  // Never spread ...project — that injects unknown camelCase keys Supabase rejects.
  return {
    id,
    title,
    name: title,
    subtitle: project.subtitle || '',
    tagline: project.tagline || project.subtitle || '',
    short_description: project.shortDescription || project.short_description || project.summary || '',
    long_description: project.longDescription || project.long_description || project.description || '',
    description: project.description || project.shortDescription || project.short_description || '',
    summary: project.summary || project.shortDescription || project.short_description || '',
    category: project.category || 'Full Stack Web Application',
    status: project.status || 'Completed',
    repository_url: project.repositoryUrl || project.repository_url || '',
    live_demo_url: project.liveDemoUrl || project.live_demo_url || '',
    app_store_url: project.appStoreUrl || project.app_store_url || '',
    play_store_url: project.playStoreUrl || project.play_store_url || '',
    start_date: project.startDate || project.start_date || '',
    end_date: project.endDate || project.end_date || '',
    featured: Boolean(project.featured),
    display_order: Number(project.displayOrder ?? project.display_order ?? 0),
    thumbnail_image: project.thumbnailImage || project.thumbnail_image || '',
    technologies: splitList(project.technologies),
    highlights: splitList(project.highlights),
    gallery_images: galleryImages,
    screenshots:
      galleryImages.length > 0
        ? galleryImages.map((src, index) => ({
            src,
            alt: `${title} screenshot ${index + 1}`,
            title: `Image ${index + 1}`,
          }))
        : Array.isArray(project.screenshots)
        ? project.screenshots
        : [],
    features: splitList(project.features),
    contributions: splitList(project.contributions),
    problem: project.problem || '',
    solution: project.solution || '',
    project_type: project.projectType || project.project_type || 'main',
    updated_at: new Date().toISOString(),
  };
}

const experienceFields = [
  ['company', 'Company'],
  ['position', 'Position'],
  ['duration', 'Duration'],
  ['description', 'Description', 'textarea'],
  ['responsibilities', 'Responsibilities', 'list'],
  ['technologies', 'Technologies', 'list'],
  ['logoUrl', 'Company Logo URL'],
  ['displayOrder', 'Display Order', 'number'],
];
const educationFields = [
  ['degree', 'Degree'],
  ['institution', 'Institution'],
  ['campus', 'Campus'],
  ['duration', 'Duration'],
  ['description', 'Description', 'textarea'],
  ['displayOrder', 'Display Order', 'number'],
];
const certificateFields = [
  ['title', 'Title'],
  ['issuer', 'Issuer'],
  ['date', 'Date', 'date'],
  ['credentialUrl', 'Credential URL'],
  ['pdfUrl', 'PDF URL'],
  ['imageUrl', 'Image URL'],
  ['displayOrder', 'Display Order', 'number'],
];

function GenericManager({ title, collectionName, fallback, fields }) {
  const { items } = useCollectionData(collectionName, fallback, { orderBy: 'displayOrder' });
  const [editing, setEditing] = useState(null);

  const deleteItem = async (item) => {
    if (!supabase) return;
    if (window.confirm(`Delete "${item.title || item.position || item.degree || item.company}"?`)) {
      await supabase.from(collectionName.toLowerCase()).delete().eq('id', item.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title={title}
        description={`Manage ${title.toLowerCase()} entries shown on the portfolio.`}
        action={
          <button
            onClick={() => setEditing({ id: `${collectionName}-${Date.now()}`, displayOrder: items.length + 1 })}
            className={`${buttonClass} bg-amber-300 text-[#090a0c]`}
          >
            Add Entry
          </button>
        }
      />
      {editing && (
        <GenericForm
          collectionName={collectionName}
          fields={fields}
          item={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {items.map((item) => (
        <Card key={item.id}>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div>
              <h2 className="text-lg font-bold">{item.title || item.position || item.degree || item.company}</h2>
              <p className="mt-1 text-sm text-gray-400">
                {item.issuer || item.company || item.institution || item.duration}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className={`${buttonClass} border border-white/10 text-gray-200`}
                onClick={() => setEditing(item)}
              >
                Edit
              </button>
              <button
                className={`${buttonClass} border border-red-400/30 text-red-200`}
                onClick={() => deleteItem(item)}
              >
                Delete
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function GenericForm({ collectionName, fields, item, onClose }) {
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (event) => {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setError('');

    const payload = { ...draft, updated_at: new Date().toISOString() };
    fields.forEach(([key, , type]) => {
      if (type === 'list') payload[key] = splitList(payload[key]);
      if (type === 'number') payload[key] = Number(payload[key] || 0);
    });

    if (!payload.id) {
      payload.id = `${collectionName}-${Date.now()}`;
    }

    try {
      const { error: upsertError } = await supabase
        .from(collectionName.toLowerCase())
        .upsert(payload, { onConflict: 'id' });

      if (upsertError) throw upsertError;
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <form onSubmit={save} className="grid gap-5 md:grid-cols-2">
        {fields.map(([key, label, type]) => (
          <TextField
            key={key}
            label={label}
            type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
            textarea={type === 'textarea' || type === 'list'}
            value={type === 'list' ? joinList(draft[key]) : draft[key]}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                [key]: type === 'list' ? splitList(value) : value,
              }))
            }
          />
        ))}
        {collectionName === 'certificates' && (
          <>
            <FileField
              label="Upload PDF"
              folder="certificates/pdf"
              onUpload={(url) => setDraft((current) => ({ ...current, pdfUrl: url }))}
            />
            <FileField
              label="Upload Image"
              folder="certificates/images"
              onUpload={(url) => setDraft((current) => ({ ...current, imageUrl: url }))}
            />
          </>
        )}
        {collectionName === 'experience' && (
          <FileField
            label="Upload Company Logo"
            folder="experience/logos"
            onUpload={(url) => setDraft((current) => ({ ...current, logoUrl: url }))}
          />
        )}
        {error && <p className="text-sm text-red-300 md:col-span-2">{error}</p>}
        <div className="flex gap-2 md:col-span-2">
          <button disabled={saving || !supabase} className={`${buttonClass} bg-amber-300 text-[#090a0c]`}>
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
          <button type="button" onClick={onClose} className={`${buttonClass} border border-white/10 text-gray-300`}>
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}

function Settings() {
  const [message, setMessage] = useState('');
  const [seeding, setSeeding] = useState(false);

  const seed = async () => {
    if (!supabase) return;
    setSeeding(true);
    setMessage('');
    try {
      // 1. Seed Site Content (Profile & Skills)
      await supabase.from('site_content').upsert([
        { key: 'profile', data: fallbackProfile, updated_at: new Date().toISOString() },
        { key: 'skills', data: fallbackSkills, updated_at: new Date().toISOString() },
      ]);

      // 2. Seed Projects
      const allFallbackProjects = [...fallbackProjects, ...fallbackPlaygroundProjects];
      const normalizedProjects = allFallbackProjects.map(normalizeProject);
      await supabase.from('projects').upsert(normalizedProjects, { onConflict: 'id' });

      // 3. Seed Experience
      const normalizedExperience = fallbackExperience.map((item) => ({
        ...item,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('experience').upsert(normalizedExperience, { onConflict: 'id' });

      // 4. Seed Education
      const normalizedEducation = fallbackEducation.map((item) => ({
        ...item,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('education').upsert(normalizedEducation, { onConflict: 'id' });

      // 5. Seed Certificates
      if (fallbackCertificates.length > 0) {
        await supabase.from('certificates').upsert(fallbackCertificates, { onConflict: 'id' });
      }

      setMessage('✓ All fallback content successfully seeded to your Supabase tables!');
    } catch (err) {
      setMessage(`Seeding error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Settings" description="Initialize and manage your Supabase database and portfolio CMS." />
      <Card>
        <h2 className="text-xl font-bold">1-Click Seed Supabase Content</h2>
        <p className="mt-2 text-sm text-gray-400">
          Click below to copy your existing portfolio projects (WIBE, Click2Serve, ProjeX), skills, profile, experience, and education directly into your Supabase database.
        </p>
        <button
          disabled={!supabase || seeding}
          onClick={seed}
          className={`${buttonClass} mt-5 bg-white text-[#090a0c] hover:bg-amber-100`}
        >
          {seeding ? 'Seeding Database...' : 'Seed Database Now'}
        </button>
        {message && <p className="mt-3 text-sm font-semibold text-amber-200">{message}</p>}
      </Card>
      <Card>
        <h2 className="text-xl font-bold">Supabase Setup Checklist</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-gray-300">
          <li>
            Open your project at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-amber-200 underline">supabase.com/dashboard</a>.
          </li>
          <li>
            Go to <strong>SQL Editor</strong> &gt; <strong>+ New Query</strong>, paste the content from <code className="font-mono text-amber-200">frontend/supabase_schema.sql</code>, and click <strong>Run</strong>.
          </li>
          <li>
            In <strong>Project Settings &gt; API</strong>, copy your <strong>Project URL</strong> and <strong>anon / public key</strong> into your <code className="font-mono text-amber-200">.env.local</code>.
          </li>
          <li>
            In <strong>Authentication &gt; Users</strong>, click <strong>Add User &gt; Create User</strong> with your email and chosen admin password.
          </li>
        </ol>
      </Card>
    </div>
  );
}

export default AdminLayout;
