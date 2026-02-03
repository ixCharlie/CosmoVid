import { redirect } from 'next/navigation';
import { isLocale } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export default async function ToolsPage({ params }: Props) {
  const { locale } = await params;
  const validLocale = isLocale(locale) ? locale : 'en';
  redirect(`/${validLocale}`);
}
