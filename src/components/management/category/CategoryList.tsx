// src/components/management/category/CategoryList.tsx
import { Edit, Trash2, Power, Layers } from "lucide-react";
import { Category, PaginationMeta } from "../../../contexts/data/types";
import { Badge } from "../../ui/badge"; // Asumiendo que tienes un componente Badge, si no, usa un span con clases

interface Props {
  categories: Category[];
  meta: PaginationMeta | null;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onPageChange: (newPage: number) => void;
}

export function CategoryList({ 
  categories, 
  meta, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onPageChange 
}: Props) {
  
  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
        <Layers className="h-12 w-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No se encontraron categorías.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800/50 text-gray-400 font-medium">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Descripción</th>
              <th className="p-4 text-center">Servicios</th>
              <th className="p-4 text-center">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-gray-800/30 transition-colors">
                <td className="p-4 font-medium text-white">{cat.nombre}</td>
                <td className="p-4 text-gray-400 truncate max-w-xs">
                  {cat.descripcion || <span className="italic text-gray-600">Sin descripción</span>}
                </td>
                <td className="p-4 text-center text-gray-300">
                  {cat.services?.length || 0}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    cat.activo 
                      ? "bg-green-900 text-green-200" 
                      : "bg-red-900 text-red-200"
                  }`}>
                    {cat.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => onToggleStatus(cat._id, cat.activo)}
                    title={cat.activo ? "Desactivar" : "Activar"}
                    className={`p-2 rounded transition-colors ${
                      cat.activo ? "text-gray-400 hover:text-red-400 hover:bg-red-900/20" : "text-gray-400 hover:text-green-400 hover:bg-green-900/20"
                    }`}
                  >
                    <Power size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(cat)}
                    className="p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(cat._id)}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación simple */}
      {meta && meta.total > meta.limit && (
        <div className="flex justify-end gap-2">
          <button
            disabled={meta.page === 1}
            onClick={() => onPageChange(meta.page - 1)}
            className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50 hover:bg-gray-700"
          >
            Anterior
          </button>
          <span className="text-gray-400 px-2 py-1">
            Página {meta.page}
          </span>
          <button
            disabled={meta.page * meta.limit >= meta.total}
            onClick={() => onPageChange(meta.page + 1)}
            className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50 hover:bg-gray-700"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}