import Link from "next/link";
import ReturnVerifier from "./ReturnVerifier";

export default async function BillingReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string; projectId: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { userId, projectId } = await params;
  const { ref } = await searchParams;
  const billingHref = `/u/${userId}/project/${projectId}/billing`;

  if (!ref) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-zinc-400">Missing payment reference.</p>
        <Link href={billingHref} className="mt-4 inline-block text-sm text-amber-400 hover:underline">
          Back to billing
        </Link>
      </div>
    );
  }

  return <ReturnVerifier reference={ref} billingHref={billingHref} />;
}
