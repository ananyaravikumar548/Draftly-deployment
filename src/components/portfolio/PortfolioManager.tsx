'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, Check, LoaderCircle, Plus, Save, Sparkles, Trash2, X } from '../ui/icons';
import { AppShell } from '../layout/AppShell';
import { PageHeader } from '../ui/PageHeader';
import { Badge } from '../ui/Badge';
import type { PortfolioItem, Profile } from '@/src/lib/portfolio-types';

type ItemType = PortfolioItem['type'];
type EditableItem = Omit<PortfolioItem, 'id' | 'createdAt'>;
const emptyProfile: Profile = { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', role: '', bio: '', education: [] };
const emptyItem: EditableItem = { type: 'project', title: '', description: '', technologies: [], dateRange: '' };

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? 'The request could not be completed.');
  return body;
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function SectionTitle({ title, caption, action }: { title: string; caption?: string; action?: ReactNode }) {
  return <div className="section-title"><div><h2>{title}</h2>{caption && <p>{caption}</p>}</div>{action}</div>;
}

export function PortfolioManager() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [itemEditor, setItemEditor] = useState<EditableItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingItem, setSavingItem] = useState(false);
  const [techText, setTechText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileResult, itemResult] = await Promise.all([
        fetch('/api/profile').then((response) => readResponse<{ profile: Profile }>(response)),
        fetch('/api/portfolio').then((response) => readResponse<{ items: PortfolioItem[] }>(response)),
      ]);
      setProfile(profileResult.profile);
      setItems(itemResult.items);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load your local portfolio.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const projectItems = useMemo(() => items.filter((item) => item.type !== 'skill'), [items]);
  const skillItems = useMemo(() => items.filter((item) => item.type === 'skill'), [items]);
  const profileCompletion = useMemo(() => {
    const profileFields = [profile.fullName, profile.role, profile.bio, profile.email, profile.location, profile.linkedin, profile.github];
    const filledProfileFields = profileFields.filter((value) => value.trim()).length;
    const describedItems = projectItems.filter((item) => item.description.trim()).length;
    const total = profileFields.length + Math.max(projectItems.length, 1);
    return Math.round(((filledProfileFields + describedItems) / total) * 100);
  }, [profile, projectItems]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setNotice('');
    try {
      const result = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) }).then((response) => readResponse<{ profile: Profile }>(response));
      setProfile(result.profile);
      setNotice('Profile saved to your local database.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your profile.');
    } finally { setSavingProfile(false); }
  }

  function openNew(type: ItemType = 'project') {
    setEditingId(null);
    setItemEditor({ ...emptyItem, type });
    setTechText('');
    setError('');
  }

  function openEdit(item: PortfolioItem) {
    setEditingId(item.id);
    setItemEditor({ type: item.type, title: item.title, description: item.description, technologies: item.technologies, dateRange: item.dateRange });
    setTechText(item.technologies.join(', '));
    setError('');
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!itemEditor) return;
    setSavingItem(true);
    setError('');
    const data = { ...itemEditor, technologies: techText.split(',').map((value) => value.trim()).filter(Boolean) };
    try {
      const url = editingId ? `/api/portfolio/${editingId}` : '/api/portfolio';
      const result = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((response) => readResponse<{ item: PortfolioItem }>(response));
      setItems((current) => editingId ? current.map((item) => item.id === editingId ? result.item : item) : [...current, result.item]);
      setItemEditor(null);
      setNotice(editingId ? 'Portfolio item updated.' : 'Portfolio item added.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save this portfolio item.');
    } finally { setSavingItem(false); }
  }

  async function deleteItem(item: PortfolioItem) {
    if (!window.confirm(`Delete “${item.title}” from your portfolio?`)) return;
    setError('');
    try {
      await fetch(`/api/portfolio/${item.id}`, { method: 'DELETE' }).then((response) => readResponse<{ success: boolean }>(response));
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      setNotice(`${item.title} removed from your portfolio.`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not delete this item.'); }
  }

  return <AppShell><div className="content-wrap portfolio-page">
    <PageHeader eyebrow="YOUR PROFESSIONAL STORY" title="My portfolio" subtitle="Keep your experience and strongest work ready for every opportunity." action={<button type="button" onClick={() => openNew()} className="button primary"><Plus size={16}/>Add to portfolio</button>}/>
    <div className="fictional-demo-note"><b>Sample workspace</b><span>This profile uses fictional names, contact details, and experience. Replace the sample content with verified information before using it in real applications.</span></div>
    <div className="portfolio-workspace-note"><span className="db-note-dot"/>Saved to your local workspace</div>
    {error && <div className="error-banner" role="alert"><span>{error}</span><button className="text-button" onClick={() => void load()}>Retry</button></div>}
    {notice && <div className="success-banner" role="status"><Check size={15}/>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={14}/></button></div>}
    {loading ? <Card className="portfolio-loading"><LoaderCircle className="spin" size={18}/>Loading your portfolio…</Card> : <>
      <section className="portfolio-overview" aria-label="Portfolio overview">
        <div className="portfolio-identity">
          <div className="profile-avatar-large">{profile.fullName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'CF'}</div>
          <div className="portfolio-identity-copy"><div className="portfolio-kicker">PROFILE OVERVIEW</div><div className="profile-name"><h2>{profile.fullName || 'Your name'}</h2><Badge tone="green"><span className="online-dot"/>Demo profile</Badge></div><div className="profile-role">{profile.role || 'Add your current role'}{profile.location && <><i/>{profile.location}</>}</div></div>
          <div className="portfolio-completion"><div className="completion-ring" style={{ '--completion': `${profileCompletion}%` } as CSSProperties}><span>{profileCompletion}<small>%</small></span></div><div><b>Profile strength</b><span>Complete the details that support your story.</span></div></div>
        </div>
        <p className="portfolio-bio">{profile.bio || 'Add a concise summary that shows the work you do and the strengths you bring.'}</p>
        <div className="portfolio-overview-footer"><div className="portfolio-contact-preview"><span>{profile.email || 'Add an email address'}</span>{profile.phone && <><i/>{profile.phone}</>}{profile.linkedin && <><i/>{profile.linkedin}</>}</div><div className="portfolio-saved-status"><span className="db-note-dot"/>Local workspace</div></div>
      </section>
      <div className="portfolio-metrics" aria-label="Portfolio at a glance"><div><span>Selected work</span><b>{projectItems.length.toString().padStart(2, '0')}</b><small>projects & experience</small></div><div><span>Skills</span><b>{skillItems.length.toString().padStart(2, '0')}</b><small>in your profile</small></div><div><span>Education</span><b>{profile.education.length.toString().padStart(2, '0')}</b><small>qualifications</small></div></div>
      <form onSubmit={saveProfile} className="profile-details-form">
        <Card className="profile-details-card"><SectionTitle title="Profile details" caption="Contact information and summary shown on your tailored resume." action={<button className="button outline small" type="submit" disabled={savingProfile}>{savingProfile?<LoaderCircle className="spin" size={14}/>:<Save size={14}/>}Save changes</button>}/>
          <div className="profile-fields"><label className="field-label">Full name<input className="field-input" value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} required/></label><label className="field-label">Current role<input className="field-input" value={profile.role} onChange={(event) => setProfile({ ...profile, role: event.target.value })} placeholder="e.g. Product designer"/></label><label className="field-label">Email<input className="field-input" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} placeholder="you@example.com"/></label><label className="field-label">Phone<input className="field-input" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="Optional"/></label><label className="field-label">Location<input className="field-input" value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} placeholder="City, Country"/></label><label className="field-label">LinkedIn<input className="field-input" value={profile.linkedin} onChange={(event) => setProfile({ ...profile, linkedin: event.target.value })} placeholder="linkedin.com/in/…"/></label><label className="field-label">GitHub<input className="field-input" value={profile.github} onChange={(event) => setProfile({ ...profile, github: event.target.value })} placeholder="github.com/…"/></label><label className="field-label profile-bio-field">Professional summary<textarea className="field-input" value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} placeholder="Summarize your experience and strengths." rows={3}/></label></div><div className="education-readout"><div className="education-heading"><div><h3>Education</h3><span>Your academic background</span></div></div>{profile.education.length ? profile.education.map((education, index) => <div className="education-readout-row" key={`${education.school}-${index}`}><span className="education-mark">{education.school.slice(0, 1).toUpperCase()}</span><div><b>{education.school}</b><span>{education.degree} · {education.field}</span><small>{education.start} – {education.end}{education.grade ? ` · ${education.grade}` : ''}</small></div></div>) : <p className="education-empty">No education details yet.</p>}</div>
        </Card>
      </form>
      <div className="portfolio-grid portfolio-manager-grid"><div className="portfolio-main"><SectionTitle title="Selected work" caption="Projects and experience that bring your skills to life." action={<button className="text-button" onClick={() => openNew()}><Plus size={14}/>Add work</button>}/>
        {projectItems.length ? <div className="project-grid">{projectItems.map((item, index) => <Card className="project-card" key={item.id}><div className={`project-art project-art-${index % 3}`}><span>{String(index + 1).padStart(2, '0')}</span></div><div className="project-body"><div className="project-meta"><span className="portfolio-type">{item.type}</span>{item.dateRange && <span className="item-date">{item.dateRange}</span>}<div className="project-card-actions"><button type="button" className="project-edit" onClick={() => openEdit(item)}>Edit</button><button type="button" className="project-delete" onClick={() => void deleteItem(item)} aria-label={`Delete ${item.title}`}><Trash2 size={13}/></button></div></div><div className="project-title"><h3>{item.title}</h3></div><p>{item.description || <em>Add a verified description to make this work more useful.</em>}</p><div className="skill-chips">{item.technologies.map((technology) => <span className="skill-chip" key={technology}>{technology}</span>)}</div></div></Card>)}</div> : <div className="empty-portfolio"><b>Your work will show up here</b><span>Add a project or experience with a clear, accurate description.</span><button type="button" className="button outline small" onClick={() => openNew()}><Plus size={14}/>Add your first item</button></div>}
      </div><aside className="portfolio-aside"><Card className="skills-card"><SectionTitle title="Skills" caption="Capabilities backed by your experience." action={<button className="icon-action" onClick={() => openNew('skill')} aria-label="Add a skill"><Plus size={16}/></button>}/><div className="all-skills">{skillItems.map((item) => <div className="portfolio-skill" key={item.id}><span>{item.title}</span><button className="skill-remove" onClick={() => void deleteItem(item)} aria-label={`Remove ${item.title}`}><X size={13}/></button></div>)}</div>{skillItems.length===0&&<p className="skills-empty">Add skills you can demonstrate through your work.</p>}<button className="text-button edit-skills" onClick={() => openNew('skill')}><Plus size={13}/>Add a skill</button></Card>
        <div className="profile-strength"><div className="strength-top"><div><b>Build a stronger profile</b><span>{projectItems.length ? `${projectItems.filter((item) => item.description.trim()).length} of ${projectItems.length} work descriptions completed` : 'Start with a project'}</span></div><Sparkles size={16}/></div><div className="strength-bar"><i style={{ width: `${profileCompletion}%` }}/></div><p>Clear, specific details help create more accurate resume drafts.</p></div></aside></div>
    </>}
        {itemEditor && <div className="modal-overlay" role="presentation" onMouseDown={(event) => event.target===event.currentTarget&&setItemEditor(null)}><div className="draft-modal portfolio-modal" role="dialog" aria-modal="true" aria-labelledby="portfolio-modal-title"><div className="modal-heading"><div><h2 id="portfolio-modal-title">{editingId?'Edit portfolio item':itemEditor.type==='skill'?'Add a skill':'Add portfolio item'}</h2><p>This portfolio is fictional demo content. Use only accurate details in any real resume.</p></div><button type="button" className="icon-action" onClick={() => setItemEditor(null)} aria-label="Close"><X size={18}/></button></div><form onSubmit={saveItem}><label className="field-label">Item type<select className="field-input" value={itemEditor.type} onChange={(event) => setItemEditor({ ...itemEditor, type: event.target.value as ItemType })}><option value="project">Project</option><option value="experience">Experience</option><option value="achievement">Achievement</option><option value="skill">Skill</option><option value="education">Education</option><option value="certification">Certification</option></select></label><label className="field-label modal-gap">Name<input className="field-input" value={itemEditor.title} onChange={(event) => setItemEditor({ ...itemEditor, title: event.target.value })} placeholder={itemEditor.type==='skill'?'e.g. Python':'e.g. Campus event app'} required maxLength={160}/></label>{itemEditor.type!=='skill'&&<><label className="field-label modal-gap">Source description<textarea className="field-input" value={itemEditor.description} onChange={(event) => setItemEditor({ ...itemEditor, description: event.target.value })} placeholder="Describe the fictional sample work used in this demo." rows={4}/></label><label className="field-label modal-gap">Dates<input className="field-input" value={itemEditor.dateRange} onChange={(event) => setItemEditor({ ...itemEditor, dateRange: event.target.value })} placeholder="e.g. 2024 – 2025"/></label></>}<label className="field-label modal-gap">Technologies / related skills<input className="field-input" value={techText} onChange={(event) => setTechText(event.target.value)} placeholder="React, TypeScript, …"/><span className="form-hint">Separate each item with a comma.</span></label><div className="modal-actions"><button type="button" className="button outline" onClick={() => setItemEditor(null)}>Cancel</button><button className="button primary" type="submit" disabled={savingItem}>{savingItem?<LoaderCircle className="spin" size={15}/>:<Save size={15}/>}Save item</button></div></form></div></div>}
  </div></AppShell>;
}
