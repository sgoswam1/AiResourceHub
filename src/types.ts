export interface AIApp {
  name: string;
  logo: string;
  color: string;
  desc: string;
  link: string;
  tags: string[];
  catKey: string;
  catLabel: string;
}

export interface AICourse {
  title: string;
  provider: string;
  category: string;
  badge: string;
  logo: string;
  color: string;
  desc: string;
  link: string;
}

export interface TrendingNews {
  title: string;
  summary: string;
  impact: string;
  sourceUrl?: string;
  category: string;
}

export interface Innovation {
  title: string;
  description: string;
  category: string;
  highlights: string[];
  link?: string;
}

export interface CreativeIdea {
  title: string;
  concept: string;
  howToBuild: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
}

export interface WeeklyTrendsResponse {
  updatedDate: string;
  trendingNews: TrendingNews[];
  innovations: Innovation[];
  ideas: CreativeIdea[];
}
