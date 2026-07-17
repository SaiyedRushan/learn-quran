// Renders a schema.org JSON-LD block for search engines. Server-rendered into
// static HTML, so it ships with the page and needs no client JavaScript.
export default function JsonLd({data}: {data: Record<string, unknown>}) {
  return <script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(data)}} />;
}
