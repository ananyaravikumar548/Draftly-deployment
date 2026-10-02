import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/src/lib/application-types';

const s = StyleSheet.create({ page: { padding: 38, fontFamily: 'Helvetica', fontSize: 9, color: '#354d51' }, name: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#2b5358', marginBottom: 3 }, role: { fontSize: 10, color: '#52777b', marginBottom: 6 }, contact: { fontSize: 8, color: '#657b7e', marginBottom: 8 }, demo: { fontSize: 7, color: '#64877d', fontFamily: 'Helvetica-Bold', letterSpacing: 0.8, marginBottom: 10 }, heading: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#365f63', borderBottomWidth: 1, borderBottomColor: '#dbe7e6', paddingBottom: 4, marginTop: 12, marginBottom: 6 }, body: { lineHeight: 1.45, marginBottom: 5 }, row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }, title: { fontFamily: 'Helvetica-Bold' }, muted: { color: '#708386', fontSize: 8 }, bullet: { marginLeft: 9, marginBottom: 3, lineHeight: 1.35 }, skills: { lineHeight: 1.5 } });

export function ResumeDocument({ data }: { data: ResumeData }) {
  const contact = [data.profile.email, data.profile.phone, data.profile.location, data.profile.linkedin, data.profile.github].filter(Boolean).join('  •  ');
  return <Document title={`${data.profile.full_name || 'Candidate'} — Resume`}><Page size="A4" style={s.page}>
    <Text style={s.name}>{data.profile.full_name || 'Your Name'}</Text>
    {data.profile.role ? <Text style={s.role}>{data.profile.role}</Text> : null}
    {contact ? <Text style={s.contact}>{contact}</Text> : null}
    <Text style={s.demo}>FICTIONAL DEMO RESUME · SAMPLE DATA</Text>
    {data.summary ? <><Text style={s.heading}>PROFESSIONAL SUMMARY</Text><Text style={s.body}>{data.summary}</Text></> : null}
    {data.skills.length ? <><Text style={s.heading}>SKILLS</Text><Text style={s.skills}>{data.skills.join('  •  ')}</Text></> : null}
    {data.items.length ? <><Text style={s.heading}>EXPERIENCE & PROJECTS</Text>{data.items.map((item) => <View key={item.item_id} wrap={false}>
      <View style={s.row}><Text style={s.title}>{item.title}</Text><Text style={s.muted}>{item.date_range}</Text></View>
      {item.technologies.length ? <Text style={s.muted}>{item.technologies.join(' · ')}</Text> : null}
      {item.bullets.map((bullet, index) => <Text style={s.bullet} key={`${item.item_id}-${index}`}>•  {bullet}</Text>)}
    </View>)}</> : null}
    {data.education.length ? <><Text style={s.heading}>EDUCATION</Text>{data.education.map((education, index) => <View style={s.row} key={`${education.school}-${index}`}><View><Text style={s.title}>{education.school}</Text><Text>{[education.degree, education.field].filter(Boolean).join(' · ')}</Text>{education.grade ? <Text style={s.muted}>{education.grade}</Text> : null}</View><Text style={s.muted}>{[education.start, education.end].filter(Boolean).join(' – ')}</Text></View>)}</> : null}
  </Page></Document>;
}
