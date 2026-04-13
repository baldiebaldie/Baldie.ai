export const AI_KEYWORDS = [
  // Models & providers
  "llm",
  "gpt",
  "claude",
  "gemini",
  "mistral",
  "llama",
  "openai",
  "anthropic",
  "deepmind",
  "deepseek",
  "cohere",
  "grok",
  "copilot",
  // Core concepts
  "artificial intelligence",
  " ai ",
  "machine learning",
  " ml ",
  "deep learning",
  "neural",
  "transformer",
  "diffusion",
  "generative",
  "foundation model",
  "large language",
  "multimodal",
  "reasoning",
  // Techniques
  "fine-tun",
  "finetuning",
  "rag",
  "retrieval augmented",
  "embedding",
  "inference",
  "training",
  "prompt",
  "agent",
  "agentic",
  "reinforcement learning",
  "rlhf",
  // Output types
  "paper",
  "benchmark",
  "dataset",
  "model release",
  "open source model",
  // Tools & infra
  "vector database",
  "langchain",
  "hugging face",
  "ollama",
  "vllm",
  "pytorch",
] as const;

/**
 * Returns true if the title contains at least one AI/ML keyword.
 * Case-insensitive.
 */
export function isAiRelated(title: string): boolean {
  const lower = ` ${title.toLowerCase()} `;
  return AI_KEYWORDS.some((kw) => lower.includes(kw));
}
