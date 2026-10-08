import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('ANTHROPIC_API_KEY', '');
    this.model = config.get<string>('AI_MODEL', 'claude-sonnet-5-5');
  }

  get isEnabled(): boolean {
    return Boolean(this.apiKey.trim());
  }

  async complete(system: string, user: string, maxTokens: number): Promise<string | null> {
    if (!this.isEnabled) return null;
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      });
      if (!response.ok) {
        this.logger.warn(`Claude API returned HTTP ${response.status}; using the non-AI fallback`);
        return null;
      }
      const result = await response.json() as { content?: Array<{ type?: string; text?: string }> };
      return result.content?.find((item) => item.type === 'text')?.text ?? null;
    } catch (error) {
      this.logger.warn(`Claude API request failed; using the non-AI fallback: ${(error as Error).message}`);
      return null;
    }
  }
}
