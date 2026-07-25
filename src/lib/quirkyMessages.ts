/** Sarcastic once-a-day nudges shown when the user has zero tasks. */
export const QUIRKY_EMPTY_MESSAGES = [
  'Zero tasks. Either you have your life perfectly together, or you forgot this app exists.',
  'No tasks today. Suspicious. Are you actually using me, or just admiring the UI?',
  'Your task list is emptier than my inbox on a good day. Impressive. Or concerning.',
  'Nothing to do? Either life is perfect or you have quietly given up. No judgment.',
  'Task count: 0. This is either enlightenment or elaborate denial.',
  'An empty list. Bold. Let us see how long that lasts.',
  'No tasks detected. Either you have it all together or you are ghosting your responsibilities.',
  'Wow, nothing pending. Show-off.',
  'Nothing due today. Either you are ahead of life or life forgot to send the invoice.',
  'No tasks. I would say "great job", but I am not fully convinced you are using me.',
  'Silence on the task front. Suspiciously peaceful.',
  'Your to-do list is on vacation. Hope you are too.',
  'Zero tasks. Chef’s kiss. Or a cry for help. Hard to tell from here.',
  'Empty task list. Living the dream or forgetting the plan?',
  'No tasks today. Either you are winning at life, or you and I need to have a talk.',
  'It is quiet in here. Too quiet. Add a task so I feel useful.',
  'Are you sureeeeeeee you don\'t have ANYTHING to do?',
]

/** Pick a random quirky message. */
export function pickQuirkyMessage(): string {
  const i = Math.floor(Math.random() * QUIRKY_EMPTY_MESSAGES.length)
  return QUIRKY_EMPTY_MESSAGES[i]
}
