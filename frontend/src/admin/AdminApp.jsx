import React, { useMemo, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, isStorageConfigured, storage } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useCollectionData, useDocumentData } from '../hooks/useFirestoreData';
import { fallbackCertificates, fallbackEducation, fallbackExperience, fallbackProfile, fallbackProjects, fallbackSkills } from '../data/fallbackPortfolio';

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
  title: '', subtitle: '', shortDescription: '', longDescription: '', thumbnailImage: '', galleryImages: [], technologies: [], category: '', status: 'Draft', repositoryUrl: '', liveDemoUrl: '', startDate: '', endDate: '', featured: false, displayOrder: 0,
};

const fieldClass = 'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-gray-400';
const buttonClass = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

function splitList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || '').split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function joinList(value) {
  return Array.isArray(value) ? value.join('\n') : value || '';
}

function slugify(value) {
  return String(value || 'asset').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'asset';
}

async function uploadFile(file, folder) {
  if (!file) return '';
  if (!isStorageConfigured || !storage) {
    throw new Error('File uploads need Firebase Storage (Blaze plan). Use an image URL field instead, or place files in frontend/public/.');
  }
  const fileRef = ref(storage, `${folder}/${Date.now()}-${slugify(file.name)}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

function Card({ children, className = '' }) {
  return <div className={`rounded-xl border border-white/10 bg-[#12141a]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] ${className}`}>{children}</div>;
}

function AdminLayout() {
  const { user, logout, adminEmail, isFirebaseConfigured } = useAuth();
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
            <NavLink key={href} to={href} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-gradient-to-r from-orange-400 to-amber-300 text-[#090a0c]' : 'text-gray-400 hover:bg-white/[0.05] hover:text-white'}`}>
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
              <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${isFirebaseConfigured ? 'border-orange-400/30 bg-orange-400/10 text-orange-200' : 'border-amber-400/30 bg-amber-400/10 text-amber-200'}`}>
                {isFirebaseConfigured ? 'Firestore connected' : 'Firebase env missing'}
              </div>
              <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${isStorageConfigured ? 'border-orange-400/30 bg-orange-400/10 text-orange-200' : 'border-slate-400/30 bg-slate-400/10 text-slate-300'}`}>
                {isStorageConfigured ? 'Storage enabled' : 'Storage off (URL mode)'}
              </div>
              <button className={`${buttonClass} border border-white/10 text-gray-200 hover:bg-white/[0.06]`} onClick={() => navigate('/')}>View Site</button>
              <button className={`${buttonClass} bg-white text-[#09090b] hover:bg-amber-100`} onClick={logout}>Sign Out</button>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map(([label, href]) => (
              <NavLink key={href} to={href} className={({ isActive }) => `shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${isActive ? 'bg-amber-300 text-[#090a0c]' : 'bg-white/[0.05] text-gray-300'}`}>{label}</NavLink>
            ))}
          </nav>
        </header>
        <main className="px-4 py-6 md:px-8">
          <Routes>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/profile" element={<ProfileEditor />} />
            <Route path="/admin/projects" element={<ProjectsManager />} />
            <Route path="/admin/skills" element={<SkillsManager />} />
            <Route path="/admin/experience" element={<GenericManager title="Experience" collectionName="experience" fallback={fallbackExperience} fields={experienceFields} />} />
            <Route path="/admin/education" element={<GenericManager title="Education" collectionName="education" fallback={fallbackEducation} fields={educationFields} />} />
            <Route path="/admin/certificates" element={<GenericManager title="Certificates" collectionName="certificates" fallback={fallbackCertificates} fields={certificateFields} />} />
            <Route path="/admin/contact" element={<ContactEditor />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export function Login() {
  const { login, isAdmin, adminEmail, isFirebaseConfigured } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  const handleLogin = async (provider) => {
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
        <p className="mt-3 text-sm leading-6 text-gray-400">Sign in with Google or GitHub. Only {adminEmail} can access admin routes.</p>
        {!isFirebaseConfigured && <div className="mt-5 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">Add Firebase values to your .env file before logging in.</div>}
        <div className="mt-6 space-y-3">
          <button onClick={() => handleLogin('google')} disabled={loading || !isFirebaseConfigured} className="w-full rounded-lg bg-white px-4 py-3 font-bold text-[#090a0c] transition hover:bg-amber-100 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>
          <button onClick={() => handleLogin('github')} disabled={loading || !isFirebaseConfigured} className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 font-bold text-white transition hover:bg-white/[0.08] disabled:opacity-50">
            Continue with GitHub
          </button>
        </div>
        {error && <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
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
      <PageTitle title="Dashboard" description="A quick read on the content currently feeding your public portfolio." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, value]) => <Card key={label}><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold text-white">{value}</p></Card>)}
      </div>
      <Card>
        <h2 className="text-xl font-bold">CMS Architecture</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {['Public Portfolio', 'Firebase Firestore', 'Firebase Storage', 'Google Auth', 'Protected Admin'].map((item) => <div key={item} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-gray-300">{item}</div>)}
        </div>
      </Card>
    </div>
  );
}

function PageTitle({ title, description, action }) {
  return <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><h1 className="text-3xl font-bold text-white">{title}</h1><p className="mt-2 max-w-2xl text-sm text-gray-400">{description}</p></div>{action}</div>;
}

function TextField({ label, value, onChange, type = 'text', textarea = false, required = false }) {
  return <label className="block"><span className={labelClass}>{label}</span>{textarea ? <textarea className={fieldClass} rows="5" value={value || ''} required={required} onChange={(e) => onChange(e.target.value)} /> : <input className={fieldClass} type={type} value={value || ''} required={required} onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)} />}</label>;
}

function FileField({ label, onUpload, folder }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!isStorageConfigured) {
    return (
      <div className="rounded-lg border border-slate-400/20 bg-white/[0.03] px-3 py-3 text-xs leading-5 text-gray-400">
        <p className="font-semibold text-gray-300">{label}</p>
        <p className="mt-1">Uploads need Firebase Storage (paid Blaze plan). Leave the URL field above filled instead, or add files under <code className="text-amber-200">frontend/public/</code> and use paths like <code className="text-amber-200">/projects/my-image.png</code>.</p>
      </div>
    );
  }

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
            onUpload(await uploadFile(file, folder));
          } catch (uploadError) {
            setError(uploadError.message);
          } finally {
            setUploading(false);
          }
        }}
      />
      {uploading && <p className="mt-2 text-xs text-amber-200">Uploading...</p>}
      {error && <p className="mt-2 text-xs text-red-200">{error}</p>}
    </label>
  );
}

function ProfileEditor() {
  const { data } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const [draft, setDraft] = useState(fallbackProfile);
  React.useEffect(() => setDraft(data || fallbackProfile), [data]);
  const update = (path, value) => setDraft((current) => setNested(current, path, value));
  const save = () => setDoc(doc(db, 'siteContent', 'profile'), { ...draft, updatedAt: serverTimestamp() }, { merge: true });

  return <DocumentForm title="Profile" description="Manage hero, about, resume, socials, and personal contact details." onSave={save}>
    <TextField label="Name" value={draft.name} onChange={(value) => update('name', value)} required />
    <TextField label="Professional Title" value={draft.professionalTitle} onChange={(value) => update('professionalTitle', value)} />
    <TextField label="Headline" value={draft.headline} onChange={(value) => update('headline', value)} />
    <TextField label="Hero Description" value={draft.heroDescription} onChange={(value) => update('heroDescription', value)} textarea />
    <TextField label="About Me" value={draft.aboutMe} onChange={(value) => update('aboutMe', value)} textarea />
    <TextField label="Profile Photo URL" value={draft.profilePhoto} onChange={(value) => update('profilePhoto', value)} />
    <FileField label="Upload Profile Photo" folder="profile" onUpload={(url) => update('profilePhoto', url)} />
    <TextField label="Resume URL" value={draft.resumeUrl} onChange={(value) => update('resumeUrl', value)} />
    <TextField label="Location" value={draft.location} onChange={(value) => update('location', value)} />
    <TextField label="Availability" value={draft.availability} onChange={(value) => update('availability', value)} />
    <TextField label="Email" value={draft.contact?.email} onChange={(value) => update('contact.email', value)} />
    <TextField label="Phone" value={draft.contact?.phone} onChange={(value) => update('contact.phone', value)} />
    <TextField label="LinkedIn" value={draft.socialLinks?.linkedin} onChange={(value) => update('socialLinks.linkedin', value)} />
    <TextField label="GitHub" value={draft.socialLinks?.github} onChange={(value) => update('socialLinks.github', value)} />
    <TextField label="Facebook" value={draft.socialLinks?.facebook} onChange={(value) => update('socialLinks.facebook', value)} />
  </DocumentForm>;
}

function ContactEditor() {
  const { data } = useDocumentData('siteContent', 'profile', fallbackProfile);
  const [draft, setDraft] = useState(fallbackProfile);
  React.useEffect(() => setDraft(data || fallbackProfile), [data]);
  const update = (path, value) => setDraft((current) => setNested(current, path, value));
  const save = () => setDoc(doc(db, 'siteContent', 'profile'), { ...draft, updatedAt: serverTimestamp() }, { merge: true });

  return <DocumentForm title="Contact Information" description="Update every public contact channel from one place." onSave={save}>
    <TextField label="Email" value={draft.contact?.email} onChange={(value) => update('contact.email', value)} />
    <TextField label="Phone" value={draft.contact?.phone} onChange={(value) => update('contact.phone', value)} />
    <TextField label="Location" value={draft.location} onChange={(value) => update('location', value)} />
    <TextField label="Portfolio URL" value={draft.contact?.portfolioUrl} onChange={(value) => update('contact.portfolioUrl', value)} />
    <TextField label="LinkedIn" value={draft.socialLinks?.linkedin} onChange={(value) => update('socialLinks.linkedin', value)} />
    <TextField label="GitHub" value={draft.socialLinks?.github} onChange={(value) => update('socialLinks.github', value)} />
    <TextField label="Facebook" value={draft.socialLinks?.facebook} onChange={(value) => update('socialLinks.facebook', value)} />
  </DocumentForm>;
}

function DocumentForm({ title, description, onSave, children }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  return <div className="space-y-6"><PageTitle title={title} description={description} /><Card><form className="grid gap-5 md:grid-cols-2" onSubmit={async (event) => { event.preventDefault(); setSaving(true); setMessage(''); try { await onSave(); setMessage('Saved.'); } catch (error) { setMessage(error.message); } finally { setSaving(false); } }}>{children}<div className="md:col-span-2"><button disabled={saving || !db} className={`${buttonClass} bg-gradient-to-r from-orange-400 to-amber-300 text-[#090a0c]`}>{saving ? 'Saving...' : 'Save Changes'}</button>{message && <p className="mt-3 text-sm text-gray-300">{message}</p>}</div></form></Card></div>;
}

function setNested(source, path, value) {
  const next = structuredClone(source || {});
  const keys = path.split('.');
  let target = next;
  keys.slice(0, -1).forEach((key) => { target[key] = target[key] || {}; target = target[key]; });
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
            <span className="cursor-grab select-none text-gray-500" aria-hidden="true">⋮⋮</span>
            <input
              className={`${fieldClass} flex-1`}
              value={skill}
              onChange={(event) => updateSkill(index, event.target.value)}
            />
            <button type="button" className={`${buttonClass} border border-white/10 px-2 py-1 text-xs text-gray-300`} onClick={() => onChange(moveItem(skills, index, Math.max(0, index - 1)))} aria-label="Move up">↑</button>
            <button type="button" className={`${buttonClass} border border-white/10 px-2 py-1 text-xs text-gray-300`} onClick={() => onChange(moveItem(skills, index, Math.min(skills.length - 1, index + 1)))} aria-label="Move down">↓</button>
            <button type="button" className={`${buttonClass} border border-red-400/30 px-2 py-1 text-xs text-red-200`} onClick={() => removeSkill(index)} aria-label="Remove skill">×</button>
          </li>
        ))}
      </ul>
      <button type="button" className={`${buttonClass} mt-3 border border-white/10 text-gray-300`} onClick={() => onChange([...skills, 'New skill'])}>Add Skill</button>
    </Card>
  );
}

function SkillsManager() {
  const { data } = useDocumentData('siteContent', 'skills', fallbackSkills);
  const [draft, setDraft] = useState(fallbackSkills);
  const [message, setMessage] = useState('');
  React.useEffect(() => setDraft(data || fallbackSkills), [data]);
  const categories = [
    ['languages', 'Languages'],
    ['frontend', 'Frontend'],
    ['backend', 'Backend'],
    ['databases', 'Databases'],
    ['tools', 'Tools'],
    ['cloud', 'Cloud'],
    ['aiTools', 'AI Tools'],
    ['softSkills', 'Soft Skills'],
  ];
  const save = async () => {
    await setDoc(doc(db, 'siteContent', 'skills'), { ...draft, updatedAt: serverTimestamp() }, { merge: true });
    setMessage('Skills saved.');
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Skills" description="Drag skills to reorder them within each category. Changes appear on the public portfolio after saving." action={<button disabled={!db} onClick={save} className={`${buttonClass} bg-amber-300 text-[#090a0c]`}>Save Skills</button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
  const { items: projects } = useCollectionData('projects', fallbackProjects, { orderBy: 'displayOrder' });
  const [editing, setEditing] = useState(null);

  return <div className="space-y-6"><PageTitle title="Projects" description="Create, edit, duplicate, feature, order, and delete public portfolio projects." action={<button className={`${buttonClass} bg-gradient-to-r from-orange-400 to-amber-300 text-[#090a0c]`} onClick={() => setEditing({ ...emptyProject })}>Add Project</button>} />
    {editing && <ProjectForm project={editing} onClose={() => setEditing(null)} />}
    <div className="grid gap-4">{projects.map((project) => <Card key={project.id}><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap gap-2"><span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs text-amber-100">{project.category || 'Uncategorized'}</span>{project.featured && <span className="rounded-full border border-orange-300/20 bg-orange-300/10 px-2 py-1 text-xs text-orange-100">Featured</span>}</div><h2 className="mt-3 text-xl font-bold text-white">{project.title || project.name}</h2><p className="mt-1 max-w-3xl text-sm text-gray-400">{project.shortDescription || project.summary}</p></div><div className="flex flex-wrap gap-2"><button className={`${buttonClass} border border-white/10 text-gray-200`} onClick={() => setEditing(project)}>Edit</button><button className={`${buttonClass} border border-white/10 text-gray-200`} onClick={() => duplicateProject(project)}>Duplicate</button><button className={`${buttonClass} border border-white/10 text-gray-200`} onClick={() => updateDoc(doc(db, 'projects', project.id), { featured: !project.featured })}>{project.featured ? 'Unfeature' : 'Feature'}</button><button className={`${buttonClass} border border-red-400/30 text-red-200`} onClick={() => deleteDoc(doc(db, 'projects', project.id))}>Delete</button></div></div></Card>)}</div></div>;
}

async function duplicateProject(project) {
  const { id, ...copy } = project;
  await addDoc(collection(db, 'projects'), { ...copy, title: `${project.title || project.name} Copy`, featured: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

function ProjectForm({ project, onClose }) {
  const [draft, setDraft] = useState({ ...emptyProject, ...project });
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const save = async (event) => { event.preventDefault(); setSaving(true); const payload = normalizeProject(draft); try { if (draft.id) await setDoc(doc(db, 'projects', draft.id), payload, { merge: true }); else await addDoc(collection(db, 'projects'), { ...payload, createdAt: serverTimestamp() }); onClose(); } finally { setSaving(false); } };

  return <Card><form onSubmit={save} className="grid gap-5 md:grid-cols-2"><TextField label="Title" required value={draft.title || draft.name} onChange={(value) => update('title', value)} /><TextField label="Subtitle" value={draft.subtitle} onChange={(value) => update('subtitle', value)} /><TextField label="Short Description" textarea value={draft.shortDescription || draft.summary} onChange={(value) => update('shortDescription', value)} /><TextField label="Long Description" textarea value={draft.longDescription} onChange={(value) => update('longDescription', value)} /><TextField label="Thumbnail Image URL" value={draft.thumbnailImage} onChange={(value) => update('thumbnailImage', value)} /><FileField label="Upload Thumbnail" folder="projects/thumbnails" onUpload={(url) => update('thumbnailImage', url)} /><TextField label="Gallery Image URLs" textarea value={joinList(draft.galleryImages)} onChange={(value) => update('galleryImages', splitList(value))} /><FileField label="Upload Gallery Image" folder="projects/gallery" onUpload={(url) => update('galleryImages', [...splitList(draft.galleryImages), url])} /><TextField label="Technologies" textarea value={joinList(draft.technologies)} onChange={(value) => update('technologies', splitList(value))} /><TextField label="Category" value={draft.category} onChange={(value) => update('category', value)} /><TextField label="Status" value={draft.status} onChange={(value) => update('status', value)} /><TextField label="GitHub Repository URL" value={draft.repositoryUrl} onChange={(value) => update('repositoryUrl', value)} /><TextField label="Live Demo URL" value={draft.liveDemoUrl} onChange={(value) => update('liveDemoUrl', value)} /><TextField label="Start Date" type="date" value={draft.startDate} onChange={(value) => update('startDate', value)} /><TextField label="End Date" type="date" value={draft.endDate} onChange={(value) => update('endDate', value)} /><TextField label="Display Order" type="number" value={draft.displayOrder} onChange={(value) => update('displayOrder', value)} /><label className="flex items-center gap-3 text-sm text-gray-300"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => update('featured', event.target.checked)} /> Featured Project</label><div className="flex gap-2 md:col-span-2"><button disabled={saving || !db} className={`${buttonClass} bg-amber-300 text-[#090a0c]`}>{saving ? 'Saving...' : 'Save Project'}</button><button type="button" onClick={onClose} className={`${buttonClass} border border-white/10 text-gray-300`}>Cancel</button></div></form></Card>;
}

function normalizeProject(project) {
  const galleryImages = splitList(project.galleryImages);
  const title = project.title || project.name || '';
  return { ...project, title, name: title, technologies: splitList(project.technologies), galleryImages, screenshots: galleryImages.map((src, index) => ({ src, alt: `${title} screenshot ${index + 1}`, title: `Image ${index + 1}` })), summary: project.shortDescription || project.summary || '', description: project.shortDescription || project.description || '', updatedAt: serverTimestamp() };
}

const experienceFields = [ ['company', 'Company'], ['position', 'Position'], ['duration', 'Duration'], ['description', 'Description', 'textarea'], ['responsibilities', 'Responsibilities', 'list'], ['technologies', 'Technologies', 'list'], ['logoUrl', 'Company Logo URL'], ['displayOrder', 'Display Order', 'number'] ];
const educationFields = [ ['degree', 'Degree'], ['institution', 'Institution'], ['campus', 'Campus'], ['duration', 'Duration'], ['description', 'Description', 'textarea'], ['displayOrder', 'Display Order', 'number'] ];
const certificateFields = [ ['title', 'Title'], ['issuer', 'Issuer'], ['date', 'Date', 'date'], ['credentialUrl', 'Credential URL'], ['pdfUrl', 'PDF URL'], ['imageUrl', 'Image URL'], ['displayOrder', 'Display Order', 'number'] ];

function GenericManager({ title, collectionName, fallback, fields }) {
  const { items } = useCollectionData(collectionName, fallback, { orderBy: 'displayOrder' });
  const [editing, setEditing] = useState(null);
  return <div className="space-y-6"><PageTitle title={title} description={`Manage ${title.toLowerCase()} entries shown on the portfolio.`} action={<button onClick={() => setEditing({ displayOrder: items.length + 1 })} className={`${buttonClass} bg-amber-300 text-[#090a0c]`}>Add Entry</button>} />{editing && <GenericForm collectionName={collectionName} fields={fields} item={editing} onClose={() => setEditing(null)} />}{items.map((item) => <Card key={item.id}><div className="flex flex-col gap-4 md:flex-row md:justify-between"><div><h2 className="text-lg font-bold">{item.title || item.position || item.degree || item.company}</h2><p className="mt-1 text-sm text-gray-400">{item.issuer || item.company || item.institution || item.duration}</p></div><div className="flex gap-2"><button className={`${buttonClass} border border-white/10 text-gray-200`} onClick={() => setEditing(item)}>Edit</button><button className={`${buttonClass} border border-red-400/30 text-red-200`} onClick={() => deleteDoc(doc(db, collectionName, item.id))}>Delete</button></div></div></Card>)}</div>;
}

function GenericForm({ collectionName, fields, item, onClose }) {
  const [draft, setDraft] = useState(item);
  const [saving, setSaving] = useState(false);
  const save = async (event) => { event.preventDefault(); setSaving(true); const payload = { ...draft, updatedAt: serverTimestamp() }; fields.forEach(([key, , type]) => { if (type === 'list') payload[key] = splitList(payload[key]); }); try { if (draft.id) await setDoc(doc(db, collectionName, draft.id), payload, { merge: true }); else await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() }); onClose(); } finally { setSaving(false); } };
  return <Card><form onSubmit={save} className="grid gap-5 md:grid-cols-2">{fields.map(([key, label, type]) => <TextField key={key} label={label} type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'} textarea={type === 'textarea' || type === 'list'} value={type === 'list' ? joinList(draft[key]) : draft[key]} onChange={(value) => setDraft((current) => ({ ...current, [key]: type === 'list' ? splitList(value) : value }))} />)}{collectionName === 'certificates' && <><FileField label="Upload PDF" folder="certificates/pdf" onUpload={(url) => setDraft((current) => ({ ...current, pdfUrl: url }))} /><FileField label="Upload Image" folder="certificates/images" onUpload={(url) => setDraft((current) => ({ ...current, imageUrl: url }))} /></>}{collectionName === 'experience' && <FileField label="Upload Company Logo" folder="experience/logos" onUpload={(url) => setDraft((current) => ({ ...current, logoUrl: url }))} />}<div className="flex gap-2 md:col-span-2"><button disabled={saving || !db} className={`${buttonClass} bg-amber-300 text-[#090a0c]`}>{saving ? 'Saving...' : 'Save Entry'}</button><button type="button" onClick={onClose} className={`${buttonClass} border border-white/10 text-gray-300`}>Cancel</button></div></form></Card>;
}

function Settings() {
  const [message, setMessage] = useState('');
  const seed = async () => {
    await setDoc(doc(db, 'siteContent', 'profile'), fallbackProfile, { merge: true });
    await setDoc(doc(db, 'siteContent', 'skills'), fallbackSkills, { merge: true });
    await Promise.all(fallbackProjects.map((project) => setDoc(doc(db, 'projects', project.id), project, { merge: true })));
    await Promise.all(fallbackExperience.map((item) => setDoc(doc(db, 'experience', item.id), item, { merge: true })));
    await Promise.all(fallbackEducation.map((item) => setDoc(doc(db, 'education', item.id), item, { merge: true })));
    await Promise.all(fallbackCertificates.map((item) => setDoc(doc(db, 'certificates', item.id), item, { merge: true })));
    setMessage('Fallback content seeded to Firebase.');
  };
  return (
    <div className="space-y-6">
      <PageTitle title="Settings" description="Initialize and maintain your private portfolio CMS." />
      <Card>
        <h2 className="text-xl font-bold">Seed Firebase Content</h2>
        <p className="mt-2 text-sm text-gray-400">Use this once after creating your Firebase project to copy the current portfolio content into Firestore.</p>
        <button disabled={!db} onClick={seed} className={`${buttonClass} mt-5 bg-white text-[#090a0c]`}>Seed Current Content</button>
        {message && <p className="mt-3 text-sm text-orange-200">{message}</p>}
      </Card>
      <Card>
        <h2 className="text-xl font-bold">Firebase CLI (Spark / free plan)</h2>
        <p className="mt-2 text-sm text-gray-400">Storage is optional and needs a paid Blaze plan. On the free plan, use URL fields for images and skip Storage entirely.</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-300">
          <li>Copy your web app config from Firebase Console into <code className="text-amber-200">frontend/.env</code> (leave <code className="text-amber-200">VITE_FIREBASE_STORAGE_BUCKET</code> blank).</li>
          <li>Run <code className="text-amber-200">firebase login</code> in a terminal.</li>
          <li>Run <code className="text-amber-200">firebase use --add</code> inside the <code className="text-amber-200">firebase</code> folder and pick your project.</li>
          <li>Deploy rules only: <code className="text-amber-200">firebase deploy --only firestore:rules</code></li>
        </ol>
        <p className="mt-4 text-sm text-gray-400">For images without Storage: put files in <code className="text-amber-200">frontend/public/</code> and reference them like <code className="text-amber-200">/projects/click2serve/Kiosk Homescreen.png</code>.</p>
      </Card>
    </div>
  );
}

export default AdminLayout;
