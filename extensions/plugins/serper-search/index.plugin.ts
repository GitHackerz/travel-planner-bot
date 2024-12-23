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
import { BaseBlockPlugin } from '@/plugins/base-block-plugin';
import { PluginService } from '@/plugins/plugins.service';
import { PluginBlockTemplate } from '@/plugins/types';
import { SettingService } from '@/setting/services/setting.service';

import SETTINGS from './settings';

@Injectable()
export class HexabotGroqPlugin extends BaseBlockPlugin<typeof SETTINGS> {
  template: PluginBlockTemplate = {
    patterns: ['chat'],
    starts_conversation: true,
    name: 'Serper Plugin',
  };

  constructor(
    pluginService: PluginService,
    private readonly blockService: BlockService,
    private readonly settingService: SettingService,
  ) {
    super('serper-search-plugin', pluginService);
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
    const userResponse = context?.text;
    debugger;
    const sRes: any = await axios
      .post(
        'https://google.serper.dev/search',
        {
          q: userResponse,
        },
        {
          headers: {
            'X-API-KEY': `${args.api_key}`,
          },
        },
      )
      .catch((err) => {});

    const searchResponse = sRes.data;

    const systemPrompts = [
      `Context: You are a chat assistant bot designed to help users understand and explore web search results. Your task is to analyze JSON data containing search results and return a clear, user-friendly description of the findings, including relevant links for further exploration.`,
      `Instruction: Extract the title, snippet, and link from each search result in the JSON.
        Summarize the data into a descriptive paragraph, ensuring the information is concise and highlights key insights from the search results.
        Include hyperlinks to the original sources for easy navigation.
        Provide related questions and searches, if present, to encourage further exploration.
        Use a conversational tone, ensuring the response is helpful and easy to read.
      `,
    ].join('\n');

    const gRes: any = await axios
      .post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: systemPrompts,
            },
            {
              role: 'user',
              content: JSON.stringify(searchResponse),
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${args.api_groq_key}`,
          },
        },
      )
      .catch((err) => {});

    const msg: StdOutgoingTextEnvelope = {
      format: OutgoingMessageFormat.text,
      message: {
        text: this.blockService.processText(
          gRes.data.choices[0].message.content,
          context,
          {},
          settings,
        ),
      },
    };

    return msg;
  }
}
