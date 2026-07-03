import Link from "next/link";

type CrawlerNavProps = {
  readonly description: string;
  readonly name: string;
};

/** Always-visible HTML nav for crawlers and assistive tech on the interactive homepage. */
export function CrawlerNav({ description, name }: CrawlerNavProps) {
  return (
    <nav aria-label="Portfolio sections" className="sr-only">
      <p>{description}</p>
      <ul>
        <li>
          <Link href="/read">Readable portfolio — {name}</Link>
        </li>
        <li>
          <Link href="/work">Projects</Link>
        </li>
        <li>
          <Link href="/blog">Writing</Link>
        </li>
      </ul>
    </nav>
  );
}
