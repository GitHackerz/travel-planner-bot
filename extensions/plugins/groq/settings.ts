/*
 * Copyright © 2024 Hexastack. All rights reserved.
 *
 * Licensed under the GNU Affero General Public License v3.0 (AGPLv3) with the following additional terms:
 * 1. The name "Hexabot" is a trademark of Hexastack. You may not use this name in derivative works without express written permission.
 * 2. All derivative works must include clear attribution to the original creator and software, Hexastack and Hexabot, in a prominent location (e.g., in the software's "About" section, documentation, and README file).
 */

import { PluginSetting } from '@/plugins/types';
import { SettingType } from '@/setting/schemas/types';

export default [
  {
    label: 'api_key',
    group: 'default',
    type: SettingType.text,
    value: 'Your response: ',
  },
  {
    label: 'model',
    group: 'default',
    type: SettingType.select,
    value: 'llama3-8b-8192',
    options: ['llama3-8b-8192', 'llama3-70b-8192', 'gemma2-9b-it'],
  },
  {
    label: 'context',
    group: 'default',
    type: SettingType.text,
    value:
      'You are an AI assistant designed to help users plan their tasks, answer questions, and provide recommendations. Your goal is to be efficient, clear, and helpful in every interaction.',
  },
  {
    label: 'instructions',
    group: 'default',
    type: SettingType.textarea,
    value:
      "Keep responses short, relevant, and friendly.\nAlways understand the user's intent and provide precise answers or solutions.\nIf additional details are needed, ask concise follow-up questions.\nAvoid unnecessary details unless the user requests them.\nStay polite and professional at all times.",
  },
] as const satisfies PluginSetting[];
