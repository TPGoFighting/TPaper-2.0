import { Metadata } from 'next';
import { SAMPLE_PAPERS } from '@/lib/sample-papers';
import { PaperViewer } from './paper-viewer';

export function generateStaticParams() {
  return Object.keys(SAMPLE_PAPERS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = SAMPLE_PAPERS[slug] || SAMPLE_PAPERS['os-exam-b'] || SAMPLE_PAPERS['calculus-midterm'];
  return {
    title: `${paper.title} — tpaper 交互式试卷`,
    description: paper.description,
  };
}

export default async function PublishedPaperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PaperViewer slug={slug} />;
}
