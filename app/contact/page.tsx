import { ContactSection } from "@/components/contact-section"
import { BubbleCursor } from "@/components/bubble-cursor"

export default function ContactPage() {
  return (
    <div className="min-h-screen relative">
      <BubbleCursor />
      <main>
        <ContactSection />
      </main>
    </div>
  )
}
