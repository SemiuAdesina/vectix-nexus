import { registerForHackathon } from './actions/registerForHackathon';
import { checkHeartbeat } from './actions/checkHeartbeat';
import { createForumPost } from './actions/createForumPost';
import { createProjectDraft } from './actions/createProjectDraft';

export const colosseumPlugin = {
  name: 'colosseum-hackathon',
  description:
    'Register for Colosseum Hackathon, check heartbeat, post on forum, and create project draft.',
  actions: [registerForHackathon, checkHeartbeat, createForumPost, createProjectDraft],
};

export { registerForHackathon, checkHeartbeat, createForumPost, createProjectDraft };
export default colosseumPlugin;
