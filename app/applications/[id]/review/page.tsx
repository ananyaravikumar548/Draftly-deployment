import { ReviewScreen } from '@/src/components/screens';
type PageProps = { params: Promise<{ id: string }> };
export default async function ReviewPage({ params }: PageProps) { const { id } = await params; return <ReviewScreen id={id}/>; }
