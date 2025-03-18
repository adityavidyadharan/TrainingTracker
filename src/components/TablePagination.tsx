import { Table } from "@tanstack/react-table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "./ui/pagination";

export default function TablePagination<content>({
  pagination,
  users,
  pages,
  table
}: {
  pagination: {
    pageIndex: number
    pageSize: number
  }
  users: content[]
  pages: number
  table: Table<content>
}) {
  return (
    <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              className="cursor-pointer"
              onClick={() => table.setPageIndex(0)}
              isActive={pagination.pageIndex === 0}
            >
              {"<<"}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              className="cursor-pointer"
              onClick={() => table.previousPage()}
              isActive={pagination.pageIndex === 0}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              className="cursor-pointer"
              onClick={() => table.nextPage()}
              isActive={pagination.pageIndex === Math.ceil(users.length / pagination.pageSize) - 1}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              className="cursor-pointer"
              onClick={() => table.setPageIndex(pages - 1)}
              isActive={pagination.pageIndex === pages - 1}
            >
              {">>"}
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
  )
}
