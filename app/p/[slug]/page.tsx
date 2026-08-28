import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolvePublishedPaper } from '@/lib/paper-resolver';
import { PaperViewer } from './paper-viewer';

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const paper = resolvePublishedPaper(slug);
  if (!paper) {
    return { title: '试卷未找到 — tpaper' };
  }
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
  const paper = resolvePublishedPaper(slug);
  if (!paper) notFound();
  return <PaperViewer slug={slug} paper={paper} />;
}
