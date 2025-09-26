import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { NewsFilters as INewsFilters, TIME_WINDOWS, LANGUAGES, TOPIC_COLORS } from '@/types/news';
import { Search, RotateCcw } from 'lucide-react';

interface NewsFiltersProps {
  filters: INewsFilters;
  onFiltersChange: (filters: INewsFilters) => void;
  onReset: () => void;
}

const NewsFilters: React.FC<NewsFiltersProps> = ({ filters, onFiltersChange, onReset }) => {
  const updateFilter = (key: keyof INewsFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleTopic = (topic: string) => {
    const newTopics = filters.topics.includes(topic)
      ? filters.topics.filter(t => t !== topic)
      : [...filters.topics, topic];
    updateFilter('topics', newTopics);
  };

  return (
    <Card className="w-80 h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">News Filters</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
            className="text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Query</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search"
              placeholder="Search headlines..."
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Time Window */}
        <div className="space-y-2">
          <Label>Time Window</Label>
          <Select value={filters.timeWindow} onValueChange={(value) => updateFilter('timeWindow', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_WINDOWS.map((window) => (
                <SelectItem key={window.value} value={window.value}>
                  {window.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Topics */}
        <div className="space-y-3">
          <Label>Topics</Label>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(TOPIC_COLORS).map(([topic, color]) => (
              <div key={topic} className="flex items-center space-x-2">
                <Checkbox
                  id={topic}
                  checked={filters.topics.includes(topic)}
                  onCheckedChange={() => toggleTopic(topic)}
                />
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                  <Label htmlFor={topic} className="capitalize text-sm cursor-pointer">
                    {topic}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={filters.language} onValueChange={(value) => updateFilter('language', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min Article Count */}
        <div className="space-y-3">
          <Label>Minimum Articles: {filters.minCount}</Label>
          <Slider
            value={[filters.minCount]}
            onValueChange={(value) => updateFilter('minCount', value[0])}
            max={100}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Source Domain Filter */}
        <div className="space-y-2">
          <Label htmlFor="sources">Source Domains (comma-separated)</Label>
          <Input
            id="sources"
            placeholder="e.g., bbc.com, reuters.com"
            value={filters.sources.join(', ')}
            onChange={(e) => updateFilter('sources', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          />
        </div>

        {/* Verified Sources Only */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={filters.verifiedOnly}
            onCheckedChange={(checked) => updateFilter('verifiedOnly', checked)}
          />
          <Label htmlFor="verified" className="text-sm cursor-pointer">
            Verified sources only
          </Label>
        </div>
      </div>
    </Card>
  );
};

export default NewsFilters;