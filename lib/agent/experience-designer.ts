import { PaperBrief, ExperiencePlan } from './types';

/**
 * 03 / Experience Designer Agent
 * 动态决定“这份试卷应该变成怎样的 Web 交互体验”，输出 ExperiencePlan。
 */
export async function designExperience(brief: PaperBrief): Promise<ExperiencePlan> {
  return {
    style: brief.subject.includes('物理') ? 'modern-comic' : 'minimal-academic',
    layout: {
      desktop: 'centered-container-with-sticky-header',
      mobile: 'fluid-single-column-with-top-progress',
    },
    navigation: 'top-progress',
    interactions: ['single-choice-cards', 'numerical-input-field', 'expandable-explanation-drawer'],
    scoringMode: 'submit-once',
    explanationMode: 'drawer-after-submit',
  };
}
