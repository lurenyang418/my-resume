import { useTranslations } from "@/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQSection() {
  const t = useTranslations("home.faq");
  const faqItems = t.raw("items");

  return (
    <section className="overflow-clip bg-background py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold text-primary">FAQ</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full overflow-hidden rounded-3xl border bg-card px-5 shadow-sm sm:px-7">
            {faqItems.map(
              (item: { question: string; answer: string }, index: number) => (
                <AccordionItem key={index} value={`item-${index}`} className="last:border-b-0">
                  <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline sm:text-lg">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="max-w-3xl pb-5 leading-7 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              )
            )}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
