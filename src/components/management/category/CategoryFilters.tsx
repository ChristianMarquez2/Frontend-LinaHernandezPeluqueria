// src/components/management/category/CategoryFilters.tsx
import { Search } from "lucide-react";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
}

export function CategoryFilters({ search, onSearchChange }: Props) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
        />
      </div>
    </div>
  );
}