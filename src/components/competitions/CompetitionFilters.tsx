import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  search: string;
  categories: string[];
  types: string[];
  requirements: string[];
}

const categories = [
  "Technology",
  "Design",
  "Marketing",
  "Writing",
  "Photography",
];
const types = ["Luck", "Skill"];
const requirements = ["Free", "Social Media", "Email", "Purchase"];

export default function CompetitionFilters({ onFilterChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(
    [],
  );
  const [sortBy, setSortBy] = useState("newest");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    applyFilters(
      e.target.value,
      selectedCategories,
      selectedTypes,
      selectedRequirements,
    );
  };

  const toggleCategory = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updated);
    applyFilters(searchTerm, updated, selectedTypes, selectedRequirements);
  };

  const toggleType = (type: string) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];

    setSelectedTypes(updated);
    applyFilters(searchTerm, selectedCategories, updated, selectedRequirements);
  };

  const toggleRequirement = (requirement: string) => {
    const updated = selectedRequirements.includes(requirement)
      ? selectedRequirements.filter((r) => r !== requirement)
      : [...selectedRequirements, requirement];

    setSelectedRequirements(updated);
    applyFilters(searchTerm, selectedCategories, selectedTypes, updated);
  };

  const applyFilters = (
    search: string,
    categories: string[],
    types: string[],
    requirements: string[],
  ) => {
    onFilterChange({
      search,
      categories,
      types,
      requirements,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedRequirements([]);
    applyFilters("", [], [], []);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    selectedRequirements.length > 0;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search competitions..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 bg-primary-foreground text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center">
                    {selectedCategories.length +
                      selectedTypes.length +
                      selectedRequirements.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Competition Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {types.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleType(type)}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Entry Requirements</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {requirements.map((requirement) => (
                      <div
                        key={requirement}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`requirement-${requirement}`}
                          checked={selectedRequirements.includes(requirement)}
                          onCheckedChange={() => toggleRequirement(requirement)}
                        />
                        <Label
                          htmlFor={`requirement-${requirement}`}
                          className="text-sm"
                        >
                          {requirement}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                  <Button size="sm" onClick={() => setIsOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="deadline">Deadline Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
