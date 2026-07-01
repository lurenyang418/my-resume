import { useTranslations } from "@/i18n";

export default function Footer() {
  const t = useTranslations("home");

  return (
    <footer className="border-t py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-muted-foreground">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
