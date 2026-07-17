import {Fragment} from "react";
import type {BlogBlock} from "@/content/blog";

// Inline emphasis written as **bold** or *italic* in the post source.
const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

function renderInline(text: string): React.ReactNode[] {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return <Fragment key={i}>{part}</Fragment>;
    });
}

function Block({block}: {block: BlogBlock}) {
  switch (block.type) {
    case "heading":
      return <h2 className='bp-heading'>{renderInline(block.text)}</h2>;
    case "paragraph":
      return <p className='bp-paragraph'>{renderInline(block.text)}</p>;
    case "list":
      return (
        <ul className='bp-list'>
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div className='hadith-banner bp-callout'>
          <div className='hb-label'>{block.label}</div>
          <div className='hb-text'>{renderInline(block.text)}</div>
          {block.attribution && <div className='hb-attr'>{renderInline(block.attribution)}</div>}
        </div>
      );
  }
}

export default function BlogPostView({body}: {body: BlogBlock[]}) {
  return (
    <div className='bp-body'>
      {body.map((block, i) => (
        <Block block={block} key={i} />
      ))}
    </div>
  );
}
