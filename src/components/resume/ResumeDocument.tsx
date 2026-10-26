/**
 * Reusable PDF resume layout used by previews, downloads, and Gmail attachments.
 */
import { Document, Link, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/src/lib/application-types';

const s = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 26, paddingHorizontal: 38, fontFamily: 'Helvetica', fontSize: 8.5, color: '#2f2724' },
  header: { marginBottom: 5 },
  nameLine: { minHeight: 29, justifyContent: 'flex-start' },
  roleLine: { minHeight: 14, justifyContent: 'flex-start', marginTop: 1 },
  name: { fontSize: 21, lineHeight: 1.2, fontFamily: 'Helvetica-Bold', color: '#2f2724', letterSpacing: -0.35 },
  role: { fontSize: 9, lineHeight: 1.25, color: '#6f645c' },
  contact: { fontSize: 7.5, lineHeight: 1.3, color: '#514740', marginBottom: 5 },
  contactText: { fontSize: 7.5, color: '#514740' },
  contactLink: { fontSize: 7.5, color: '#684d41', textDecoration: 'none' },
  separator: { fontSize: 7.5, color: '#a38878', marginHorizontal: 4 },
  demo: { fontSize: 6.5, color: '#684d41', fontFamily: 'Helvetica-Bold', letterSpacing: 0.7, marginBottom: 2 },
  heading: { fontSize: 8.4, fontFamily: 'Helvetica-Bold', color: '#684d41', borderBottomWidth: 0.7, borderBottomColor: '#e5d9cf', paddingBottom: 2, marginTop: 5, marginBottom: 3, letterSpacing: 0.45 },
  body: { fontSize: 8.2, lineHeight: 1.2, marginBottom: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 1 },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 8.4 },
  muted: { color: '#6f645c', fontSize: 7.4 },
  bullet: { marginLeft: 10, marginBottom: 1, lineHeight: 1.18, fontSize: 8 },
  skills: { fontSize: 8, lineHeight: 1.2 },
  education: { marginBottom: 2 },
});

// Keep contact links compact in print while retaining their original clickable URL.
function tidyUrl(value: string) {
  return value.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

// Normalize typographic dashes so dates render consistently in the PDF font.
function tidyDateRange(value: string) {
  return value.replace(/[–—−]/g, '-');
}

// Group selected portfolio evidence into readable, optional resume sections.
export function ResumeDocument({ data }: { data: ResumeData }) {
  const experiences = data.items.filter((item) => item.item_type === 'experience');
  const projects = data.items.filter((item) => item.item_type === 'project');
  const certifications = data.items.filter((item) => item.item_type === 'certification');
  const renderItems = (items: ResumeData['items']) => items.map((item) => <View key={item.item_id} style={{ marginBottom: 2 }}>
    <View style={s.row}><Text style={s.title}>{item.title}</Text><Text style={s.muted}>{tidyDateRange(item.date_range)}</Text></View>
    {item.technologies.length ? <Text style={s.muted}>{item.technologies.join(' · ')}</Text> : null}
    {item.bullets.map((bullet, index) => <Text style={s.bullet} key={`${item.item_id}-${index}`}>•  {bullet}</Text>)}
  </View>);
  const contact = [
    data.profile.email ? { label: data.profile.email, href: `mailto:${data.profile.email}` } : null,
    data.profile.phone ? { label: data.profile.phone } : null,
    data.profile.location ? { label: data.profile.location } : null,
    data.profile.linkedin ? { label: tidyUrl(data.profile.linkedin), href: data.profile.linkedin.startsWith('http') ? data.profile.linkedin : `https://${data.profile.linkedin}` } : null,
    data.profile.github ? { label: tidyUrl(data.profile.github), href: data.profile.github.startsWith('http') ? data.profile.github : `https://${data.profile.github}` } : null,
  ].filter((item): item is { label: string; href?: string } => Boolean(item));

  return <Document title={`${data.profile.full_name || 'Candidate'} - Resume`}><Page size="A4" wrap={false} style={s.page}>
    <View style={s.header}>
      <View style={s.nameLine}><Text style={s.name}>{data.profile.full_name || 'Your Name'}</Text></View>
      {data.profile.role ? <View style={s.roleLine}><Text style={s.role}>{data.profile.role}</Text></View> : null}
    </View>
    {contact.length ? <Text style={s.contact}>{contact.map((item, index) => <Text key={`${item.label}-${index}`}>
      {index ? <Text style={s.separator}> · </Text> : null}
      {item.href ? <Link src={item.href} style={s.contactLink}>{item.label}</Link> : <Text style={s.contactText}>{item.label}</Text>}
    </Text>)}</Text> : null}
    <Text style={s.demo}>FICTIONAL DEMO RESUME · SAMPLE DATA</Text>
    {data.summary ? <><Text style={s.heading}>PROFESSIONAL SUMMARY</Text><Text style={s.body}>{data.summary}</Text></> : null}
    {data.skills.length ? <><Text style={s.heading}>SKILLS</Text><Text style={s.skills}>{data.skills.join('  ·  ')}</Text></> : null}
    {experiences.length ? <><Text style={s.heading}>EXPERIENCE</Text>{renderItems(experiences)}</> : null}
    {projects.length ? <><Text style={s.heading}>PROJECTS</Text>{renderItems(projects)}</> : null}
    {certifications.length ? <><Text style={s.heading}>CERTIFICATIONS</Text>{renderItems(certifications)}</> : null}
    {data.achievements.length ? <><Text style={s.heading}>ACHIEVEMENTS</Text>{data.achievements.map((achievement, index) => <View key={`${achievement.title}-${index}`} style={{ marginBottom: 2 }}>
      <Text style={s.title}>{achievement.title}</Text>
      {achievement.description ? <Text style={s.body}>{achievement.description}</Text> : null}
    </View>)}</> : null}
    {data.education.length ? <><Text style={s.heading}>EDUCATION</Text>{data.education.map((education, index) => <View style={[s.row, s.education]} key={`${education.school}-${index}`}>
      <View><Text style={s.title}>{education.school}</Text><Text style={s.body}>{[education.degree, education.field].filter(Boolean).join(' · ')}</Text>{education.grade ? <Text style={s.muted}>{education.grade}</Text> : null}</View>
      <Text style={s.muted}>{[education.start, education.end].filter(Boolean).join(' - ')}</Text>
    </View>)}</> : null}
  </Page></Document>;
}
