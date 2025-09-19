import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/subjects/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/subjects/"!</div>
}
