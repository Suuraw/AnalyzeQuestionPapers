import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, BookOpen, Tag } from 'lucide-react';
import { AnalysisResult } from '@/types';

interface ResultCardProps {
  result: AnalysisResult;
}

export function ResultCard({ result }: ResultCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{result.question}</CardTitle>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>Frequency: {result.frequency}</span>
          <span>•</span>
          <span>Importance: {result.importance}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm/relaxed">{result.answer}</p>

        {result.topics.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4" />
              <span>Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.topics.map((topic) => (
                <Badge key={topic.id} variant="secondary">
                  {topic.name} ({topic.score}%)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {result.resources.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ExternalLink className="h-4 w-4" />
                <span>External Resources</span>
              </div>
              <ul className="space-y-2">
                {result.resources.map((resource) => (
                  <li key={resource.id} className="text-sm">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      {resource.title}
                      <Badge variant="outline">
                        Relevance: {resource.relevanceScore}%
                      </Badge>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {result.papers.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                <span>Related Papers</span>
              </div>
              <ul className="space-y-1">
                {result.papers.map((paper) => (
                  <li key={paper.id} className="text-sm">
                    {paper.name} ({paper.year})
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}