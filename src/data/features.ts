import { FeatureSchema, type Feature } from './schema';
import { z } from 'zod';

const features: Feature[] = [
  {
    id: 'parallel-agents',
    label: 'Parallel agents',
    category: 'workflow',
    shortDescription: 'Run multiple agents in parallel on independent tasks.',
    longDescription:
      'Spin up N agents simultaneously in isolated sandboxes (worktrees, containers, VMs) to work on multiple branches/tasks at once.',
  },
  {
    id: 'git-worktrees',
    label: 'Git worktree isolation',
    category: 'workflow',
    shortDescription: 'Each agent works in its own isolated git worktree.',
  },
  {
    id: 'cloud-execution',
    label: 'Cloud execution',
    category: 'platform',
    shortDescription: 'The orchestrator runs agents in a cloud environment, not locally.',
  },
  {
    id: 'local-execution',
    label: 'Local execution',
    category: 'platform',
    shortDescription: 'Agents run on the developer machine.',
  },
  {
    id: 'multi-model',
    label: 'Multi-model (Claude, GPT, …)',
    category: 'integrations',
    shortDescription: 'Supports multiple LLM providers/models.',
  },
  {
    id: 'pr-creation',
    label: 'Automatic PR creation',
    category: 'integrations',
    shortDescription: 'The agent opens a GitHub/GitLab PR when a task completes.',
  },
  {
    id: 'kanban-board',
    label: 'Kanban task board',
    category: 'ux',
    shortDescription: 'Kanban-style interface to track in-progress / done tasks.',
  },
  {
    id: 'live-logs',
    label: 'Live logs',
    category: 'observability',
    shortDescription: 'Streaming logs/output for each agent in real time.',
  },
  {
    id: 'diff-review',
    label: 'Built-in diff review',
    category: 'ux',
    shortDescription: 'In-app UI to review an agent diff before merging.',
  },
  {
    id: 'oss',
    label: 'Open source',
    category: 'pricing',
    shortDescription: 'Source available under a permissive license.',
  },
  {
    id: 'free-tier',
    label: 'Free tier',
    category: 'pricing',
    shortDescription: 'Free plan usable without a credit card.',
  },
  {
    id: 'self-hosted',
    label: 'Self-hosted',
    category: 'platform',
    shortDescription: 'Can be deployed on your own infrastructure.',
  },
];

export const FEATURES: readonly Feature[] = z.array(FeatureSchema).parse(features);
