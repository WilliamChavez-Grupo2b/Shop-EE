export declare class AiService {
    private readonly openai;
    constructor();
    chat(prompt: string): Promise<string>;
}
