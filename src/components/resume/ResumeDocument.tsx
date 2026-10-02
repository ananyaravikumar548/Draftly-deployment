import { Document, Link, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/src/lib/application-types';

const s = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 32, paddingHorizontal: 40, fontFamily: 'Helvetica', fontSize: 9, color: '#303b3d' },
  header: { marginBottom: 8 },
  nameLine: { height: 34, justifyContent: 'flex-start' },
  roleLine: { minHeight: 17, justifyContent: 'flex-start', marginTop: 3 },
  name: { fontSize: 22, lineHeight: 1.35, fontFamily: 'Helvetica-Bold', color: '#213c40', letterSpacing: -0.35 },
  role: { fontSize: 10, lineHeight: 1.4, color: '#65797a' },
  contact: { fontSize: 8, lineHeight: 1.5, color: '#536769', marginBottom: 7 },
  contactText: { fontSize: 8, color: '#53686a' },
  contactLink: { fontSize: 8, color: '#32716d', textDecoration: 'none' },
  separator: { fontSize: 8, color: '#a5b5b2', marginHorizontal: 5 },
  demo: { fontSize: 7, color: '#64877d', fontFamily: 'Helvetica-Bold', letterSpacing: 0.8, marginBottom: 3 },
  heading: { fontSize: 9.3, fontFamily: 'Helvetica-Bold', color: '#315e60', borderBottomWidth: 1, borderBottomColor: '#dbe7e6', paddingBottom: 3, marginTop: 7, marginBottom: 4, letterSpacing: 0.55 },
  body: { fontSize: 9.1, lineHeight: 1.32, marginBottom: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 2 },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 9.2 },
  muted: { color: '#708386', fontSize: 8.1 },
  bullet: { marginLeft: 11, marginBottom: 1.5, lineHeight: 1.28, fontSize: 8.8 },
  skills: { fontSize: 8.9, lineHeight: 1.35 },
  education: { marginBottom: 3 },
});

function tidyUrl(value: string) {
  return value.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

function tidyDateRange(value: string) {
  return value.replace(/[–—−]/g, '-');
}

export function ResumeDocument({ data }: { data: ResumeData }) {
  const experiences = data.items.filter((item) => item.item_type === 'experience');
  const projects = data.items.filter((item) => item.item_type === 'project');
  const certifications = data.items.filter((item) => item.item_type === 'certification');
  const renderItems = (items: ResumeData['items']) => items.map((item) => <View key={item.item_id} style={{ marginBottom: 4 }}>
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

  return <Document title={`${data.profile.full_name || 'Candidate'} - Resume`}><Page size="A4" style={s.page}>
    <View style={s.header}>
      <View style={s.nameLine}><Text style={s.name}>{data.profile.full_name || 'Your Name'}</Text></View>
      {data.profile.role ? <View style={s.roleLine}><Text style={s.role}>{data.profile.role}</Text></View> : null}
    </View>
    {contact.length ? <Text style={s.contact}>{contact.map((item, index) => <Text key={`${item.label}-${index}`}>
      {index ? <Text style={s.separator}>·</Text> : null}
      {item.href ? <Link src={item.href} style={s.contactLink}>{item.label}</Link> : <Text style={s.contactText}>{item.label}</Text>}
    </Text>)}</Text> : null}
    <Text style={s.demo}>FICTIONAL DEMO RESUME · SAMPLE DATA</Text>
    {data.summary ? <><Text style={s.heading}>PROFESSIONAL SUMMARY</Text><Text style={s.body}>{data.summary}</Text></> : null}
    {data.skills.length ? <><Text style={s.heading}>SKILLS</Text><Text style={s.skills}>{data.skills.join('  ·  ')}</Text></> : null}
    {experiences.length ? <><Text style={s.heading}>EXPERIENCE</Text>{renderItems(experiences)}</> : null}
    {projects.length ? <><Text style={s.heading}>PROJECTS</Text>{renderItems(projects)}</> : null}
    {certifications.length ? <><Text style={s.heading}>CERTIFICATIONS</Text>{renderItems(certifications)}</> : null}
    {data.achievements.length ? <><Text style={s.heading}>ACHIEVEMENTS</Text>{data.achievements.map((achievement, index) => <View key={`${achievement.title}-${index}`} style={{ marginBottom: 4 }}>
      <Text style={s.title}>{achievement.title}</Text>
      {achievement.description ? <Text style={s.body}>{achievement.description}</Text> : null}
    </View>)}</> : null}
    {data.education.length ? <><Text style={s.heading}>EDUCATION</Text>{data.education.map((education, index) => <View style={[s.row, s.education]} key={`${education.school}-${index}`}>
      <View><Text style={s.title}>{education.school}</Text><Text style={s.body}>{[education.degree, education.field].filter(Boolean).join(' · ')}</Text>{education.grade ? <Text style={s.muted}>{education.grade}</Text> : null}</View>
      <Text style={s.muted}>{[education.start, education.end].filter(Boolean).join(' - ')}</Text>
    </View>)}</> : null}
  </Page></Document>;
}
