import { permanentRedirect } from "next/navigation";

export default function WorldPage(): never {
  permanentRedirect("/");
}
