/*
 * Copyright © 2024 Hexastack. All rights reserved.
 *
 * Licensed under the GNU Affero General Public License v3.0 (AGPLv3) with the following additional terms:
 * 1. The name "Hexabot" is a trademark of Hexastack. You may not use this name in derivative works without express written permission.
 * 2. All derivative works must include clear attribution to the original creator and software, Hexastack and Hexabot, in a prominent location (e.g., in the software's "About" section, documentation, and README file).
 */

import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { Block } from '@/chat/schemas/block.schema';
import { Context } from '@/chat/schemas/types/context';
import {
  OutgoingMessageFormat,
  StdOutgoingEnvelope,
  StdOutgoingTextEnvelope,
} from '@/chat/schemas/types/message';
import { BlockService } from '@/chat/services/block.service';
import { ContentService } from '@/cms/services/content.service';
import { BaseBlockPlugin } from '@/plugins/base-block-plugin';
import { PluginService } from '@/plugins/plugins.service';
import { PluginBlockTemplate } from '@/plugins/types';
import { SettingService } from '@/setting/services/setting.service';

import SETTINGS from './settings';

const messages = [];
let isInit = false;

@Injectable()
export class HexabotGroqPlugin extends BaseBlockPlugin<typeof SETTINGS> {
  template: PluginBlockTemplate = {
    patterns: ['chat'],
    starts_conversation: true,
    name: 'Hexabot Groq Plugin',
  };

  constructor(
    pluginService: PluginService,
    private readonly blockService: BlockService,
    private readonly settingService: SettingService,
    private readonly contentService: ContentService,
  ) {
    super('hexabot-groq-plugin', pluginService);
  }

  getPath(): string {
    return __dirname;
  }

  async process(
    block: Block,
    context: Context,
    _convId: string,
  ): Promise<StdOutgoingEnvelope> {
    const settings = await this.settingService.getSettings();
    const args = this.getArguments(block);

    debugger;

    const systemPrompts = [
      `Context: ${args.context}`,
      `Instruction: ${args.instructions}`,
    ].join('\n');

    if (!isInit) {
      messages.push({
        role: 'system',
        content: systemPrompts,
      });

      isInit = true;
    }

    messages.push({
      role: 'user',
      content: context?.text,
    });

    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: args.model,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${args.api_key}`,
        },
      },
    );

    const response = res.data.choices[0].message.content;

    messages.push({
      role: 'assistant',
      content: response,
    });

    debugger;

    const msg: StdOutgoingTextEnvelope = {
      format: OutgoingMessageFormat.text,
      message: {
        text: this.blockService.processText(response, context, {}, settings),
      },
    };

    return msg;
  }
}
