import { getPaperById } from './agent/orchestrator';
import { SamplePaper } from './sample-papers';

export function resolvePublishedPaper(slug: string): SamplePaper | undefined {
  return getPaperById(slug);
}
