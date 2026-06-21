import { Container, SectionHeading } from "@/components/layout";
import { Reveal } from "@/components/motion";
import { getProfile } from "@/lib/data";

import { milestones } from "../about-content";
import { AboutScrolly } from "./about-timeline";

export async function AboutSection() {
  const profile = await getProfile();

  return (
    <section id="about" aria-label="About" className="scroll-mt-20">
      <Container className="py-chapter">
        <Reveal>
          <SectionHeading
            eyebrow="About"
            title="A short story about the work"
            lead={profile.summary}
          />
        </Reveal>
      </Container>
      <AboutScrolly items={milestones} />
    </section>
  );
}
