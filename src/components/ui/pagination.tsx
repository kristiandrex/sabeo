import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "#/components/ui/button";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  basePath?: string;
};

export function PaginationControls({
  currentPage,
  totalPages,
  basePath = "/history",
}: PaginationControlsProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav className="mt-6 flex items-center justify-center gap-3 sm:gap-4" aria-label="Pagination">
      <Button variant="outline" size="sm" asChild={hasPrevious} disabled={!hasPrevious}>
        {hasPrevious ? (
          <Link href={`${basePath}?page=${currentPage - 1}`} aria-label="Pagina anterior">
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="ml-1">Anterior</span>
          </Link>
        ) : (
          <span className="inline-flex items-center">
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="ml-1">Anterior</span>
          </span>
        )}
      </Button>

      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        Pagina {currentPage} de {totalPages}
      </span>

      <Button variant="outline" size="sm" asChild={hasNext} disabled={!hasNext}>
        {hasNext ? (
          <Link href={`${basePath}?page=${currentPage + 1}`} aria-label="Pagina siguiente">
            <span className="mr-1">Siguiente</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center">
            <span className="mr-1">Siguiente</span>
            <ChevronRightIcon className="h-4 w-4" />
          </span>
        )}
      </Button>
    </nav>
  );
}
